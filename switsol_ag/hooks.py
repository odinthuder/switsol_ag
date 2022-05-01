# -*- coding: utf-8 -*-
from __future__ import unicode_literals
from . import __version__ as app_version

app_name = "switsol_ag"
app_title = "Switsol AG"
app_publisher = "Switsol AG"
app_description = "Switsol Changes"
app_icon = "octicon octicon-file-directory"
app_color = "red"
app_email = "natalia.myshuk@switsol.ch"
app_license = "MIT"

# Includes in <head>
# ------------------
fixtures = ["Custom Field", "Property Setter", "Print Format"]
# include js, css files in header of desk.html
app_include_css = "/assets/switsol_ag/css/switsol_ag.css"
app_include_js = [
    "assets/js/switsol_ag.min.js",
    # "assets/js/switsol_ag-editor.min.js",
    "assets/js/switsol_ag-form.min.js",
    "assets/js/switol_ag-report.min.js",
    "assets/js/switsol_ag-list.min.js",
    "assets/js/switsol_ag-desk.min.js",
    # "assets/js/form.min.js"
]
# include js, css files in header of web template
# web_include_css = "/assets/switsol/css/switsol.css"
# web_include_js = "/assets/js/switsol_ag-web.min.js"
web_include_js = "/assets/js/switsol_ag-web.min.js"

# Home Pages
# ----------

website_context = {
    "favicon": "/assets/switsol_ag/images/switsol.png",
    "splash_image": "/assets/switsol_ag/images/switsol.png"
}

update_website_context = "switsol_ag.templates.pages.utils.update_website_context"

# application home page (will override Website Settings)
# home_page = "login"

# website user home page (by Role)
# role_home_page = {
#	"Role": "home_page"
# }

# Website user home page (by function)
# get_website_user_home_page = "switsol_ag.utils.get_home_page"

# Generators
# ----------

# automatically create page for each record of this doctype
# website_generators = ["Web Page"]

# Installation
# ------------

# before_install = "switsol_ag.install.before_install"
# after_install = "switsol_ag.install.after_install"

# Desk Notifications
# ------------------
# See frappe.core.notifications.get_notification_config

# notification_config = "switsol_ag.notifications.get_notification_config"

# Permissions
# -----------
# Permissions evaluated in scripted ways

# permission_query_conditions = {
# 	"Event": "frappe.desk.doctype.event.event.get_permission_query_conditions",
# }
#
# has_permission = {
# 	"Event": "frappe.desk.doctype.event.event.has_permission",
# }

# Document Events
# ---------------
# Hook on document methods and events


doc_events = {
    "Quotation": {
        "validate": "switsol_ag.quotation.validate",
        "after_insert": "switsol_ag.quotation.after_insert"
    },
    "SellingController": {
        "on_cancel": "switsol_ag.selling_controler.on_cancel",
        "on_submit": "switsol_ag.selling_controler.on_submit"
    },
    "Address": {
        "validate": "switsol_ag.address.validate"
    },
    "Item": {
        "validate": "switsol_ag.item.after_insert"
    },
    "Sales Invoice": {
        "validate": "switsol_ag.sales_invoice.validate"
    },
    "Sales Order": {
        "validate": "switsol_ag.sales_order.validate",
        "after_insert": "switsol_ag.sales_order.after_insert"
    },
    "Maintenance Schedule": {
        "autoname": "switsol_ag.maintenance_schedule.autoname"
    },
    "Communication": {
        "validate": "switsol_ag.communication.validate"
    },
    "Employee": {
        "autoname": "switsol_ag.employee.autoname"
    },
    "Contact": {
        "validate": "switsol_ag.contact.validate"
    }
}
# 	"*": {
# 		"on_update": "method",
# 		"on_cancel": "method",
# 		"on_trash": "method"
#	}
# }

doctype_js = {
    "Quotation": ["custom_scripts/quotation.js"],
    "Sales Order": ["custom_scripts/sales_order.js"],
    "Sales Invoice": ["custom_scripts/sales_invoice.js"],
    "Delivery Note": ["custom_scripts/delivery_note.js"],
    "Address": ["custom_scripts/address.js"],
    "Project": ["custom_scripts/project.js"],
    "Contact": ["custom_scripts/contact.js"],
    "Purchase Invoice": ["custom_scripts/purchase_invoice.js"],
    "Maintenance Visit": ["custom_scripts/maintenance_visit.js"],
    "Customer": ["custom_scripts/customer.js"],
    "Supplier": ["custom_scripts/supplier.js"],
    "Employment Type": ["custom_scripts/employment_type.js"],
    "User": ["custom_scripts/user.js"]
}

doctype_list_js = {
    "Sales Invoice": ["custom_scripts/sales_invoice_list.js"],
    "Contact": ["custom_scripts/contact_list.js"],
    "Sales Order": ["custom_scripts/sales_order_list.js"],
    "Leave Application": ["custom_scripts/leave_application_list.js"]
}

# Scheduled Tasks
# ---------------

# scheduler_events = {
# 	"all": [
# 		"switsola_ag.tasks.all"
# 	],
# 	"daily": [
# 		"switsol_ag.tasks.daily"
# 	],
# 	"hourly": [
# 		"switsol_ag.tasks.hourly"
# 	],
# 	"weekly": [
# 		"switsol_ag.tasks.weekly"
# 	]
# 	"monthly": [
# 		"switsol_ag.tasks.monthly"
# 	]
# }

# Testing
# -------

# before_tests = "switsol_ag.install.before_tests"

# Overriding Whitelisted Methods
# ------------------------------
#
# override_whitelisted_methods = {
# 	"frappe.desk.doctype.event.event.get_events": "switsol_ag.event.get_events"
# }
