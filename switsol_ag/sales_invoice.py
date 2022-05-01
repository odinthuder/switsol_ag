# Copyright (c) 2017, Switsol AG and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe

from frappe import _
from frappe.utils.data import flt, add_to_date


def validate(self, method=None):
    validate_contract_time(self)
    validate_discount(self)
    validate_due_date(self)
    improve_remarks(self)
    calculate_item_values(self)
    calculate_discount(self)
    calculate_discount_per_item(self)
    round_to(self)


def validate_contract_time(self):
    if (self.contact_start_date and self.contact_end_date and self.contact_end_date <= self.contact_start_date):
        frappe.throw(_("Contract End Date must be greater than Contract Start Date"))


def validate_due_date(self):
    self.due_date = add_to_date(self.transaction_date, days=self.payment_period)


def validate_discount(self):
    discount = [item for item in self.items if item.discount_percentage]
    if discount:
        frappe.db.set(self, "check_discount", 1)
    else:
        frappe.db.set(self, "check_discount", 0)


def improve_remarks(self):
    if self.remarks == "No Remarks":
        self.remarks = _("No Remarks")


def calculate_item_values(self):
    items_with_installation_date = []
    for item in self.get("items"):
        self.round_floats_in(item)
        if item.installation_date:
            self.is_date_row = 1
            items_with_installation_date.append(item)
        if not item.hide_original_price:
            if item.discount_percentage == 100:
                item.rate = 0.0
            elif not item.rate:
                item.rate = flt(item.price_list_rate * (1.0 - (item.discount_percentage / 100.0)), item.precision("rate"))

            item.net_rate = item.rate
            item.amount = flt(item.rate * item.qty, item.precision("amount"))
            item.net_amount = item.amount

            item.item_tax_amount = 0.0
        else:
            item.discount_percentage = 0.0
    if not len(items_with_installation_date):
        self.is_date_row = 0


def round_to(self):
    correction = 0.5 if self.grand_total >= 0 else -0.5
    round_total = int(self.grand_total / 0.05 + correction) * 0.05
    self.rounded_total_enip = "{:.2f}".format(round_total)


def calculate_discount(self):
    current_total = self.total
    total_discount = 0.0
    if self.discount_1_value:
        discount_amount = flt(current_total * flt(self.discount_1_value) / 100, self.precision("discount_amount"));
        current_total -= flt(discount_amount)
        total_discount += discount_amount
    if self.discount_2_value:
        discount_amount = flt(current_total * flt(self.discount_2_value) / 100, self.precision("discount_amount"));
        current_total -= flt(discount_amount)
        total_discount += discount_amount
    if self.discount_3_value:
        current_total -= flt(self.discount_3_value)
        total_discount += flt(self.discount_3_value)
    if current_total != self.total:
        frappe.db.set(self, "discount_amount", total_discount)
    return self


def calculate_discount_per_item(self):
    for i in self.get("items"):
        if self.discount_1_value:
            discount_1_value = i.net_amount * self.discount_1_value / 100
            i.net_amount -= discount_1_value
            # i.base_net_amount -= discount_1_value
        if self.discount_2_value:
            discount_2_value = i.net_amount * self.discount_2_value / 100
            i.net_amount -= discount_2_value
            # i.base_net_amount -= discount_2_value
