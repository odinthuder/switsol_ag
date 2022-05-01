// Copyright (c) 2017, Switsol AG and contributors
// For license information, please see license.txt

frappe.provide("erpnext.hr");

frappe.ui.form.on("Employment Type", "onload", function(frm) {
	frm.set_df_property("worktime", "description", getTimeFromMins(frm.doc.worktime));
});

// update description for worktime
frappe.ui.form.on("Employment Type", "worktime", function(frm) {
	frm.set_df_property("worktime", "description", getTimeFromMins(frm.doc.worktime));
});

function getTimeFromMins(mins) {
    var h = mins / 60 | 0,
        m = mins % 60 | 0;

    return h + " " + __("Hours") + ', '  + m + " " + __("Minutes");
}
