import frappe
from frappe import _


def update_website_context(context):
    if not frappe.local.conf.get("website_context"):
        frappe.local.conf['website_context'] = {}
    frappe.local.conf['website_context'].update(context)
