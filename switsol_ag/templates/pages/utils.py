import frappe
from frappe import _


def update_website_context(context):
    via_hooks = frappe.get_hooks("website_context")
    for key in via_hooks:
        context[key] = via_hooks[key]
        if key not in ("top_bar_items", "footer_items", "post_login") and isinstance(context[key], (list, tuple)):
            context[key] = context[key][-1]

    if not frappe.local.conf.get("website_context"):
        frappe.local.conf['website_context'] = {}
    frappe.local.conf['website_context'].update(context)
