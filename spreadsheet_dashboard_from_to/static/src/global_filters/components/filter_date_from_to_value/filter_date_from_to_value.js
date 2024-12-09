/** @odoo-module */

import { Component, onWillUpdateProps } from "@odoo/owl";
import { _t } from "@web/core/l10n/translation";
import { DatePicker } from "@web/core/datepicker/datepicker";
import { serializeDate, deserializeDate } from "@web/core/l10n/dates";

export class DateFromToValue extends Component {
  static template = "spreadsheet_edition.DateFromToValue";
  static components = { DatePicker };
  static props = {
    onFromToChanged: Function,
    from: { type: String, optional: true },
    to: { type: String, optional: true },
  };
  fromPlaceholder = _t("Date from...");
  toPlaceholder = _t("Date to...");
  setup() {
    this._setStateFromProps(this.props);
    onWillUpdateProps(this._setStateFromProps);
  }

  _setStateFromProps(props) {
    this.from = props.from;
    this.to = props.to;
  }
  onDateFromChanged(dateFrom) {
    this.from = dateFrom && serializeDate(dateFrom.startOf("day"));
    this.props.onFromToChanged({
      from: dateFrom && serializeDate(dateFrom.startOf("day")),
      to: this.props.to,
    });
  }

  onDateToChanged(dateTo) {
    this.to = dateTo && serializeDate(dateTo.endOf("day"));
    this.props.onFromToChanged({
      from: this.props.from,
      to: dateTo && serializeDate(dateTo.endOf("day")),
    });
  }
  get dateFrom() {
    return this.props.from && deserializeDate(this.props.from);
  }

  get dateTo() {
    return this.props.to && deserializeDate(this.props.to);
  }
}
