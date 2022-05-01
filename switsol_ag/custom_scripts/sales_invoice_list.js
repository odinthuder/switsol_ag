// Copyright (c) 2017, Switsol AG and contributors
// For license information, please see license.txt

frappe.listview_settings["Sales Invoice"] = {
	colwidths: {"subject": 3, "indicator": 2},
	add_fields: ["customer", "customer_name", "base_grand_total", "outstanding_amount", "due_date", "company",
		"currency", "is_return"],
	get_indicator: function(doc) {
		if(cint(doc.is_return)==1) {
			return [__("Return"), "darkgrey", "is_return,=,Yes"];
		} else if(flt(doc.outstanding_amount)==0) {
			return [__("Paid"), "green", "outstanding_amount,=,0"]
		} else if (flt(doc.outstanding_amount) > 0 && doc.due_date > frappe.datetime.get_today()) {
			return [__("Unpaid"), "orange", "outstanding_amount,>,0|due_date,>,Today"]
		} else if (flt(doc.outstanding_amount) > 0 && doc.due_date <= frappe.datetime.get_today()) {
			return [__("Overdue"), "red", "outstanding_amount,>,0|due_date,<=,Today"]
		}
	},
	right_column: "grand_total"
};
