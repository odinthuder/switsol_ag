// Copyright (c) 2017, Switsol AG and contributors
// For license information, please see license.txt

frappe.ui.form.on("Maintenance Visit", {
	onload: function(frm) {
		var status = frm.doc.status;
		if(!frm.doc.status) {
			status = "Draft";
		}
		set_multiple(dt, dn, {status:__(status)});
	}
});
