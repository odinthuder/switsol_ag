# Copyright (c) 2017, Switsol AG and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe

from frappe.model.document import Document


class QuotationInformation(Document):

    def validate(self):
        if self.discount_1_name:
            frappe.db.set_value("Custom Field", "Quotation-discount_1_name", "default", self.discount_1_name)
        if self.discount_2_name:
            frappe.db.set_value("Custom Field", "Quotation-discount_2_name", "default", self.discount_2_name)
        if self.discount_3_name:
            frappe.db.set_value("Custom Field", "Quotation-discount_1_name", "default", self.discount_3_name)
        if self.discount_1_value:
            frappe.db.set_value("Custom Field", "Quotation-discount_1_value", "default", self.discount_1_value)
        if self.discount_2_value:
            frappe.db.set_value("Custom Field", "Quotation-discount_2_value", "default", self.discount_2_value)
        if self.discount_3_value:
            frappe.db.set_value("Custom Field", "Quotation-discount_1_value", "default", self.discount_3_value)
        if self.partial_payment_1_name:
            frappe.db.set_value("Custom Field", "Quotation-partial_payment_1_name", "default", self.partial_payment_1_name)
        if self.partial_payment_2_name:
            frappe.db.set_value("Custom Field", "Quotation-partial_payment_2_name", "default", self.partial_payment_2_name)
        if self.partial_payment_3_name:
            frappe.db.set_value("Custom Field", "Quotation-partial_payment_3_name", "default", self.partial_payment_3_name)
        if self.partial_payment_4_name:
            frappe.db.set_value("Custom Field", "Quotation-partial_payment_4_name", "default", self.partial_payment_4_name)
        if self.partial_payment_1_value:
            frappe.db.set_value("Custom Field", "Quotation-partial_payment_1_value", "default", self.partial_payment_1_value)
        if self.partial_payment_2_value:
            frappe.db.set_value("Custom Field", "Quotation-partial_payment_2_value", "default", self.partial_payment_2_value)
        if self.partial_payment_3_value:
            frappe.db.set_value("Custom Field", "Quotation-partial_payment_3_value", "default", self.partial_payment_3_value)
        if self.partial_payment_4_value:
            frappe.db.set_value("Custom Field", "Quotation-partial_payment_4_value", "default", self.partial_payment_4_value)
