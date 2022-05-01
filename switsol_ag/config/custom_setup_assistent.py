# -*- coding: utf-8 -*-
from __future__ import unicode_literals
from frappe import _


def get_data():
    return [
        {
            "label": _("Custom Setup Assistent"),
            "items": [
                {
                    "type": "doctype",
                    "name": "General User Information",
                    "label": _("General User Information")
                },
                {
                    "type": "doctype",
                    "name": "General Company Information",
                    "label": _("General Company Information")
                },
                {
                    "type": "doctype",
                    "name": "Payment Options",
                    "label": _("Payment Options")
                },
                {
                    "type": "doctype",
                    "name": "Payment Terms",
                    "label": _("Payment Terms")
                },
                {
                    "type": "doctype",
                    "name": "Working hour rates",
                    "label": _("Working hour rates")
                },
                {
                    "type": "doctype",
                    "name": "Email Server",
                    "label": _("Email Server")
                },
            ]
        },
        {
            "label": _("Text modules CRM"),
            "items": [
                {
                    "type": "doctype",
                    "name": "Quotation Information",
                    "description": _("Quotation Information"),
                },
                {
                    "type": "doctype",
                    "name": "Sales Order Information",
                    "description": _("Sales Order Information"),
                },
                {
                    "type": "doctype",
                    "name": "Sales Invoice Information",
                    "description": _("Sales Invoice Information"),
                },
            ]
        },
        {
            "label": _("Text modules Stock / Warehouse"),
            "items": [
                {
                    "type": "doctype",
                    "name": "Material Request Information",
                    "description": _("Material Request Information"),
                },
                {
                    "type": "doctype",
                    "name": "General Terms",
                    "label": _("General Terms")
                },
            ]
        }
    ]
