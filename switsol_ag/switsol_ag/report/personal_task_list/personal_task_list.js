// Copyright (c) 2016, Switsol AG and contributors
// For license information, please see license.txt

frappe.query_reports["Personal Task List"] = {
	"filters": [
		{
			"fieldname": "all_tasks",
			"label": __("Alle Aufgaben (auch fremde) anzeigen"),
			"fieldtype": "Check",
			"default": 0,
			"reqd": 0
		},
		{
			"fieldname": "done_tasks",
			"label": __("Erledigte Aufgaben anzeigen"),
			"fieldtype": "Check",
			"default": 0,
			"reqd": 0
		},
	],
	formatter: function (row, cell, value, columnDef, dataContext, default_formatter) {
		value = default_formatter(row, cell, value, columnDef, dataContext);
		if(columnDef.id == __("Name")) {
			if(dataContext["Name"]) {
				value = "<a href=" + frappe.urllib.get_base_url() + "/desk#Form/Task/" + encodeURIComponent(dataContext["Name"])+" >" + dataContext["Name"] + "</a>";
			}
		}
		if(columnDef.id == __("Fälligkeitsdatum")) {
			if(dataContext["Name"]) {
				value = "<a href=" + frappe.urllib.get_base_url() + "/desk#Form/Task/" + encodeURIComponent(dataContext["Name"])+" >" + dataContext[__("Fälligkeitsdatum")] + "</a>";
			}
		}
		if(columnDef.id == __("Due Date")) {
			if(dataContext["Name"]) {
				value = "<a href=" + frappe.urllib.get_base_url() + "/desk#Form/Task/" + encodeURIComponent(dataContext["Name"])+" >" + dataContext[__("Due Date")] + "</a>";
			}
		}
		if(columnDef.id == __("Expected Start Date")) {
			if(dataContext["Name"]) {
				value = "<a href=" + frappe.urllib.get_base_url() + "/desk#Form/Task/" + encodeURIComponent(dataContext["Name"])+" >" + dataContext[__("Expected Start Date")] + "</a>";
			}
		}
		if(columnDef.id == __("Responsible Person")) {
			if(dataContext["Name"]) {
				value = "<a href=" + frappe.urllib.get_base_url() + "/desk#Form/Task/" + encodeURIComponent(dataContext["Name"])+" >" + dataContext[__("Responsible Person")] + "</a>";
			}
		}
		if(columnDef.id == __("Subject")) {
			if(dataContext["Name"]) {
				value = "<a href=" + frappe.urllib.get_base_url() + "/desk#Form/Task/" + encodeURIComponent(dataContext["Name"])+" >" + dataContext[__("Subject")] + "</a>";
			}
		}
		if(columnDef.id == __("Status")) {
			if(dataContext["Name"]) {
				value = "<a href=" + frappe.urllib.get_base_url() + "/desk#Form/Task/" + encodeURIComponent(dataContext["Name"])+" >" + dataContext[__("Status")] + "</a>";
			}
		}
		return value;
	},
}
