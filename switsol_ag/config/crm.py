from frappe import _

def get_data():
	return [
		{
			"label": _("Communication"),
			"icon": "icon-star",
			"items": [
				{
					"type": "doctype",
					"name": "Letter",
					"description": _(""),
				},
			]
		},
	]
