// Copyright (c) 2017, Switsol AG and contributors
// For license information, please see license.txt

cur_frm.cscript.custom_refresh = function() {
	if(cur_frm.doc.__islocal) {
		cur_frm.set_value("language","de");
	}
	cur_frm.refresh_fields();
}
