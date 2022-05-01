# -*- coding: utf-8 -*-
from __future__ import unicode_literals
from frappe import _


def get_data():
    return [
        {
            "label": _("Switsol AG"),
            "items": [
                {
                    "type": "doctype",
                    "name": "Description Text",
                    "label": _("Description Text")
                },
                {
                    "type": "doctype",
                    "name": "Payment",
                    "label": _("Payment")
                },
                {
                    "type": "doctype",
                    "name": "Predefined Text Container",
                    "label": _("Predefined Text Container")
                },
                {
                    "type": "doctype",
                    "name": "Letter",
                    "label": _("Letter")
                },
                {
                    "type": "doctype",
                    "name": "Letter Text",
                    "label": _("Letter Text")
                },
            ]
        }
    ]
