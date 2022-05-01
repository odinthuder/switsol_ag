// Copyright (c) 2017, Switsol AG and contributors
// For license information, please see license.txt

cur_frm.add_fetch('letter_text', 'predefined_text_container', 'body_text');

cur_frm.cscript.refresh = function(doc, cdt, cdn) {
   
}

cur_frm.cscript.employee_signature = function() {
	frappe.model.get_value("Employee", {"user_id": cur_frm.doc.employee_signature}, "signature", function(r) {
		if(r && !r.exception) {
			cur_frm.set_value("employee_signature_value", r.signature);
		} else {
			cur_frm.set_value("employee_signature_value", "");
		}
	});
}

cur_frm.cscript.chief_signature = function() {
	frappe.model.get_value("Employee", {"user_id": cur_frm.doc.chief_signature}, "signature", function(r) {
		if(r && !r.exception) {
			cur_frm.set_value("chief_signature_value", r.signature);
		} else {
			cur_frm.set_value("chief_signature_value", "");
		}
	});
}

cur_frm.cscript.clerk_name = function() {
	frappe.model.get_value("Employee", {"user_id": cur_frm.doc.clerk_name}, "signature", function(r) {
		if(r && !r.exception) {
			cur_frm.set_value("employee_signature", cur_frm.doc.clerk_name);
			cur_frm.set_value("employee_signature_value", r.signature);
		} else {
			cur_frm.set_value("employee_signature", "");
			cur_frm.set_value("employee_signature_value", "");
		}
	});
}

cur_frm.cscript.customer_address = function() {
	erpnext.utils.get_address_display(cur_frm, "customer_address");
}

cur_frm.cscript.customer = function() {
	erpnext.utils.get_party_details(cur_frm, null, null, function(){null});
}

cur_frm.cscript.custom_refresh = function() {
	if(cur_frm.doc.__islocal) {
		cur_frm.set_value("employee_signature", "");
		cur_frm.set_value("clerk_name", frappe.user.name);
	}
}