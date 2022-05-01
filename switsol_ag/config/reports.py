# -*- coding: utf-8 -*-
from __future__ import unicode_literals
from frappe import _


def get_data():
    return [
        {
            "label": _("Reports"),
            "icon": "fa fa-list",
            "items": [
                {
                    "type": "report",
                    "name": "Special Report",
                    "doctype": "Report",
                    "is_query_report": True
                },
                {
                    "type": "report",
                    "name": "Open Invoice",
                    "doctype": "Report",
                    "is_query_report": True
                },
                {
                    "type": "report",
                    "name": "Personal Task List",
                    "doctype": "Report",
                    "is_query_report": True
                },
            ]
        },
    ]
