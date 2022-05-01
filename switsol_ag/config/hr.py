# -*- coding: utf-8 -*-
from __future__ import unicode_literals
from frappe import _


def get_data():
    return [
        {
            "label": _("Reports"),
            "icon": "icon-list",
            "items": [
                {
                    "type": "report",
                    "doctype": "Employee",
                    "name": "Employee Year Report",
                    "is_query_report": True
                },
                {
                    "type": "report",
                    "doctype": "Employee",
                    "name": "Employee Month Report",
                    "is_query_report": True
                },
                {
                    "type": "report",
                    "doctype": "Employee",
                    "name": "Employee Day Report",
                    "is_query_report": True
                }
            ]
        }
    ]
