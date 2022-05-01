# Copyright (c) 2017, Switsol AG and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe

from frappe.model.document import Document


class Letter(Document):
    def on_submit(self):
        frappe.db.set(self, "status", "Sent")
