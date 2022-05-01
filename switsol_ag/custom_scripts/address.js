// Copyright (c) 2017, Switsol AG and contributors
// For license information, please see license.txt
cur_frm.add_fetch("postal_code", "canton", "canton");
cur_frm.add_fetch("town", "canton", "canton")

frappe.ui.form.on("Address", {
	onload: function(frm) {
		frm.set_query("country", function() {
			return {
				filters: {
					"flag": 1
				}
			};
		});
		frm.set_query("postal_code", function(doc, cdt, cdn) {
			if(frm.doc.town) {
				return {
					query: "switsol_ag.address.postal_code_query",
					filters: {
						"town": frm.doc.town
					}
				}
			}
		});
		frm.set_query("town", function(doc, cdt, cdn) {
			if(frm.doc.postal_code) {
				return {
					query: "switsol_ag.address.city_query",
					filters: {
						"postal_code": frm.doc.postal_code
					}
				}
			}
		});
	},
	refresh: function(frm) {
		if(frappe.route_options) {
			cur_frm.set_value("address_title", frappe.route_options.address_title);
			cur_frm.set_value("customer", frappe.route_options.customer);
			cur_frm.set_value("address_type", "Billing");
			cur_frm.set_value("country", frappe.boot.sysdefaults.country);
		}
	},
	town: function(frm) {
		frappe.call({
			method:"frappe.client.get_list",
			args: {
				doctype:"City Postal Code",
				filters: [
					["parent","=", frm.doc.town]
				],
				fields: ["postal_code"]
			},
			callback: function(r) {
				if(r.message) {
					postal_codes = [];
					$.each(r.message, function(j, data) {
						postal_codes.push(data.postal_code);
					})
					if(postal_codes.length == 1) {
					 	frm.set_value("postal_code", postal_codes[0]);
					}
				}
			}
		})
	}
});

frappe.ui.form.on("Address", "add_customers", function(frm) {
	var dialog = new frappe.ui.Dialog({
		title: __("Add Reference"),
		fields: [
			{fieldtype: "Link", fieldname: "customer", label: __("Customer"), reqd: 1, options: "Customer"}
		]
	});

	dialog.set_primary_action(__("Add"), function() {
		var btn = this;
		var values = dialog.get_values();
		frappe.call({
			freeze: true,
			freeze_message: "Saving document in the background",
			type: "POST",
			method: "switsol_ag.address.add_customers",
			args: {
				address: frm.doc.name,
				customer: values.customer,
			},
			callback: function(r) {
				if(!r.exc) {
					cur_frm.reload_doc();
				}
			}
		});
		dialog.hide();
	});
	dialog.show();
});

frappe.ui.form.on("Address", "remove_customers", function(frm) {
	var dialog = new frappe.ui.Dialog({
		title: __("Delete Reference"),
		fields: [
			{fieldtype: "Link", fieldname: "customer", label: __("Customer"), reqd: 1, options: "Customer"}
		]
	});

	dialog.set_primary_action(__("Delete"), function() {
		var btn = this;
		var values = dialog.get_values();
		frappe.call({
			freeze: true,
			freeze_message: "Saving document in the background",
			type: "POST",
			method: "switsol_ag.address.remove_customers",
			args: {
				address: frm.doc.name,
				customer: values.customer,
			},
			callback: function(r) {
				if(!r.exc) {
					cur_frm.reload_doc();
				}
			}
		});
		dialog.hide();
	});
	dialog.show();
});
