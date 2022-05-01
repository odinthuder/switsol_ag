# Copyright (c) 2017, Switsol AG and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe

from frappe.model.document import Document


class PaymentTerms(Document):

    def validate(self):
        if self.delivery_period:
            frappe.db.set_value("Custom Field", "Quotation-delivery_period", "default", self.delivery_period)
            frappe.db.set_value("Custom Field", "Sales Order-delivery_period", "default", self.delivery_period)
            frappe.db.set_value("Custom Field", "Sales Invoice-delivery_period", "default", self.delivery_period)
        if self.payment_period:
            frappe.db.set_value("Custom Field", "Quotation-payment_period", "default", self.payment_period)
            frappe.db.set_value("Custom Field", "Sales Order-payment_period", "default", self.payment_period)
            frappe.db.set_value("Custom Field", "Sales Invoice-payment_period", "default", self.payment_period)
