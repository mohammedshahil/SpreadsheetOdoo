/** @odoo-module */

import { RecordsSelector } from "@spreadsheet/global_filters/components/records_selector/records_selector";
import { DateFilterValue } from "@spreadsheet/global_filters/components/filter_date_value/filter_date_value";
import { DateFromToValue } from "../filter_date_from_to_value/filter_date_from_to_value";
import { FilterValue } from "@spreadsheet/global_filters/components/filter_value/filter_value";

FilterValue.components = { RecordsSelector, DateFromToValue, DateFilterValue };
