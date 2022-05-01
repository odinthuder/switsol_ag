// Copyright (c) 2017, Switsol AG and contributors
// For license information, please see license.txt

cur_frm.cscript.custom_refresh = function() {
	cur_frm.toggle_display("naming_series", 0);
	if(cur_frm.doc.__islocal) {
		frappe.model.get_value("Account", {"account_number": "1100"}, "name", function(r) {
			cur_frm.add_child("accounts", {"company": frappe.boot.sysdefaults.company, "account": r.name});
			cur_frm.refresh_field("accounts")
		});
		cur_frm.set_value("language","de")
	}
	if(!cur_frm.doc.territory && frappe.defaults.get_default('company') == "Gilgen Storen AG") {
		cur_frm.set_value("territory", "Schweiz");
	}
	cur_frm.refresh_fields();
}


frappe.ui.form.on("Customer", {
	onload: function(frm) {
		if(!cur_frm.doc.territory &&  frappe.boot.sysdefaults.company == "Gilgen Storen AG") {
			cur_frm.set_value("territory", "Schweiz");
		}
	},
})