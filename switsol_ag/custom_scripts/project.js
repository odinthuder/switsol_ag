// Copyright (c) 2017, Switsol AG and contributors
// For license information, please see license.txt

frappe.ui.form.on("Project", {
	onload: function(frm) {
		var so = frappe.meta.get_docfield("Project", "sales_order");
		so.get_route_options_for_new_doc = function(field) {
			if(frm.is_new()) return;
			return {
				"customer": frm.doc.customer,
				"project_name": frm.doc.name
			}
		}
	},
	sales_order: function(frm) {
		if(!frm.doc.customer && frm.doc.sales_order) {
			frappe.model.get_value("Sales Order", frm.doc.sales_order, "customer", function(r) {
				frm.set_value("customer", r.customer);
			});
		}
	}
});