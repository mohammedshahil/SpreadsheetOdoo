/** @odoo-module */

import { _t, _lt } from "@web/core/l10n/translation";
import FilterEditorSidePanel from "@spreadsheet_edition/bundle/global_filters/filter_editor_side_panel";
import { patch } from "@web/core/utils/patch";
const { onMounted, onWillStart, useState } = owl;
import { useService } from "@web/core/utils/hooks";
import { RELATIVE_DATE_RANGE_TYPES } from "@spreadsheet/helpers/constants";

const RANGE_TYPES = [
  { type: "year", description: _lt("Year") },
  { type: "quarter", description: _lt("Quarter") },
  { type: "month", description: _lt("Month") },
  { type: "relative", description: _lt("Relative Period") },
  { type: "from_to", description: _t("From / To") },
];

patch(
  FilterEditorSidePanel.prototype,
  "spreadsheet_dashboard_from_to/static/src/global_filters/filter_editor_side_panel.js",
  {
    setup() {
      this.id = undefined;
      /** @type {State} */
      this.state = useState({
        saved: false,
        label: undefined,
        type: this.props.type,
        text: {
          defaultValue: undefined,
        },
        date: {
          defaultValue: {},
          defaultsToCurrentPeriod: false,
          type: "year", // "year" | "month" | "quarter" | "relative"
          options: [],
        },
        relation: {
          defaultValue: [],
          displayNames: [],
          relatedModel: {
            label: undefined,
            technical: undefined,
          },
        },
        fieldMatchings: [],
      });
      this._wrongFieldMatchingsSet = new Set();
      this.getters = this.env.model.getters;
      this.loadValues();
      this.orm = useService("orm");
      this.notification = useService("notification");

      this.relativeDateRangesTypes = RELATIVE_DATE_RANGE_TYPES;
      this.dateRangeTypes = RANGE_TYPES;
      onWillStart(this.onWillStart);
      onMounted(this.onMounted);
    },
  }
);
