// Copyright (c) 2016, Switsol AG and contributors
// For license information, please see license.txt

frappe.query_reports["Open Invoice"] = {
	"filters": [
		{
			"fieldname":"company",
			"label": __("Company"),
			"fieldtype": "Link",
			"options": "Company",
			"default": frappe.defaults.get_user_default("Company"),
			"reqd": 1
		},
		{
			"fieldname":"from_date",
			"label": __("From Date"),
			"fieldtype": "Date",
			"default": frappe.defaults.get_user_default("year_start_date"),
			"reqd": 1
		},
		{
			"fieldname":"to_date",
			"label": __("To Date"),
			"fieldtype": "Date",
			"default": frappe.defaults.get_user_default("year_end_date"),
			"reqd": 1
		},
		{
			"fieldname":"paid_invoices",
			"label": __("Bezahlte Rechnungen einblenden"),
			"fieldtype": "Check",
			"default": 0,
			"reqd": 0
		},
	],
	formatter:function (row, cell, value, columnDef, dataContext, default_formatter) {
		value = default_formatter(row, cell, value, columnDef, dataContext);
		if(value == __("Paid")) {
			value = '<span class="green">' + value + '</span>';
		}
		return value;
	},
}
