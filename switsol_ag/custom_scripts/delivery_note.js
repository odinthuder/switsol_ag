// Copyright (c) 2017, Switsol AG and contributors
// For license information, please see license.txt

cur_frm.cscript.hide_original_price = function(frm, cdt, cdn) {
	rate(frm, cdt, cdn);
	cur_frm.refresh_fields();
}

cur_frm.cscript.rate = function(frm, cdt, cdn) {
	rate(frm, cdt, cdn);
}

rate = function(frm, cdt, cdn) {
	var item = frappe.get_doc(cdt, cdn);
	frappe.model.round_floats_in(item, ["rate", "price_list_rate"]);
	if(item.price_list_rate && !item.hide_original_price) {
		item.discount_percentage = flt((1 - item.rate / item.price_list_rate) * 100.0, precision("discount_percentage", item));
	} else {
		item.discount_percentage = 0.0;
	}
}
