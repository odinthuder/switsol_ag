// Copyright (c) 2017, Switsol AG and contributors
// For license information, please see license.txt

cur_frm.cscript.custom_refresh = function() {
	if(!cur_frm.doc.background_image) {
		cur_frm.set_value("background_image","/files/erp-desktop-background.jpg");
	}
	cur_frm.refresh_fields();
}
