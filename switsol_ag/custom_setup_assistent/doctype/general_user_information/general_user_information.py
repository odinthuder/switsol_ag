# Copyright (c) 2017, Switsol AG and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe

from frappe.model.document import Document
from frappe.utils import today


class GeneralUserInformation(Document):

    def validate(self):
        user = frappe.session.user
        frappe.db.set_value("User", user, "first_name", self.first_name)
        frappe.db.set_value("User", user, "last_name", self.last_name)
        if user != "Administrator":
            employee = frappe.db.sql(""""select name
                from tabEmployee
                where user_id=%s""", user, as_dict=True)
            full_name = " ".join(filter(None, [self.first_name, self.last_name]))
            if employee:
                full_name = " ".join(filter(None, [self.first_name, self.last_name]))
                frappe.db.set_value("Employee", employee[0].name, "employee_name", full_name)
                frappe.db.set_value("Employee", employee[0].name, "function", self.function)
                frappe.db.set_value("Employee", employee[0].name, "signature", self.signature)
            else:
                frappe.get_doc({
                    "doctype": "Employee",
                    "full_name": full_name,
                    "date_of_joining": today(),
                    "date_of_birth": today(),
                    "company": self.company,
                    "employment_type": self.employment_type
                }).insert(ignore_permissions=True)
