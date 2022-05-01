// Copyright (c) 2017, Switsol AG and contributors
// For license information, please see license.txt

cur_frm.cscript.refresh = function(doc, cdt, cdn) {
	frappe.db.get_value("Employee", {"user_id": frappe.session.user}, "company", function(r) {
		if(r) {
			cur_frm.set_value("logged_user_company", r.company);
		}
	});
}
