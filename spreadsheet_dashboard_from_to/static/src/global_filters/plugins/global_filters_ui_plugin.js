/** @odoo-module **/

import { Domain } from "@web/core/domain";
import { isEmpty } from "@spreadsheet/helpers/helpers";
import {getRelativeDateDomain} from "@spreadsheet/global_filters/helpers";
import GlobalFiltersUIPlugin from "@spreadsheet/global_filters/plugins/global_filters_ui_plugin";
import {patch} from "@web/core/utils/patch";

const { DateTime } = luxon;

patch(GlobalFiltersUIPlugin.prototype, 'spreadsheet_dashboard_from_to/static/src/global_filters/plugins/global_filters_ui_plugin.js', {
    /**
     * Get the current value of a global filter
     *
     * @param {string} filterId Id of the filter
     *
     * @returns {string|Array<string>|Object} value Current value to set
     */
    getGlobalFilterValue(filterId) {
        const filter = this.getters.getGlobalFilter(filterId);

        const value = filterId in this.values ? this.values[filterId].value : filter.defaultValue;

        const preventAutomaticValue =
            this.values[filterId] &&
            this.values[filterId].value &&
            this.values[filterId].value.preventAutomaticValue;

        if (filter.type === "date" && filter.rangeType === "from_to") {
            return value || { from: undefined, to: undefined };
        }
        const defaultsToCurrentPeriod = !preventAutomaticValue && filter.defaultsToCurrentPeriod;

        if (filter.type === "date" && isEmpty(value) && defaultsToCurrentPeriod) {
            return this._getValueOfCurrentPeriod(filterId);
        }

        return value;
    },
    /**
     * @param {string} id Id of the filter
     *
     * @returns { boolean } true if the given filter is active
     */
    isGlobalFilterActive(id) {
        const { type } = this.getters.getGlobalFilter(id);
        const value = this.getGlobalFilterValue(id);
        switch (type) {
            case "text":
                return value;
            case "date":
                return (
                    value &&
                    (typeof value === "string" ||
                        value.yearOffset !== undefined ||
                        value.period ||
                        value.from ||
                        value.to)
                );
            case "relation":
                return value && value.length;
        }
    },
    /**
     * Set the current value to empty values which functionally deactivate the filter
     *
     * @param {string} id Id of the filter
     */
    _clearGlobalFilterValue(id) {
        const { type, rangeType } = this.getters.getGlobalFilter(id);
        let value;
        switch (type) {
            case "text":
                value = "";
                break;
            case "date":
                value = { preventAutomaticValue: true };
                break;
            case "relation":
                value = [];
                break;
        }
        this.values[id] = { value, rangeType };
    },
    /**
     * Get the domain relative to a date field
     *
     * @private
     *
     * @param {GlobalFilter} filter
     * @param {FieldMatching} fieldMatching
     *
     * @returns {Domain}
     */
    _getDateDomain(filter, fieldMatching) {
        let granularity;
        const value = this.getGlobalFilterValue(filter.id);
        if (!value || !fieldMatching.chain) {
            return new Domain();
        }
        const field = fieldMatching.chain;
        const type = fieldMatching.type;
        const offset = fieldMatching.offset || 0;
        const now = DateTime.local();

        if (filter.rangeType === "from_to") {
            if (value.from && value.to) {
                return new Domain(["&", [field, ">=", value.from], [field, "<=", value.to]]);
            }
            if (value.from) {
                return new Domain([[field, ">=", value.from]]);
            }
            if (value.to) {
                return new Domain([[field, "<=", value.to]]);
            }
            return new Domain();
        }

        if (filter.rangeType === "relative") {
            return getRelativeDateDomain(now, offset, value, field, type);
        }
        if (value.yearOffset === undefined) {
            return new Domain();
        }

        const setParam = { year: now.year };
        const yearOffset = value.yearOffset || 0;
        const plusParam = {
            years: filter.rangeType === "year" ? yearOffset + offset : yearOffset,
        };
        if (!value.period || value.period === "empty") {
            granularity = "year";
        } else {
            switch (filter.rangeType) {
                case "month":
                    granularity = "month";
                    setParam.month = MONTHS[value.period].value;
                    plusParam.month = offset;
                    break;
                case "quarter":
                    granularity = "quarter";
                    setParam.quarter = QUARTER_OPTIONS[value.period].setParam.quarter;
                    plusParam.quarter = offset;
                    break;
            }
        }
        return constructDateRange({
            referenceMoment: now,
            fieldName: field,
            fieldType: type,
            granularity,
            setParam,
            plusParam,
        }).domain;
    },
});
