# Copyright (c) 2017, Switsol AG and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.utils import get_link_to_form


def on_submit(self):
    if self.target:
        address = frappe.db.sql("""select name, customers
            from tabAddress
            where name in (select address from tabTarget where dossier_number=%s)
            and address_type='Object'""", self.target, as_dict=1)
        if address and self.customer:
            customer = self.customer_name + " " + get_link_to_form("Customer", self.customer, self.customer)
            if address[0].customers:
                customer = address[0].customers + "\n" + self.customer_name + " " + get_link_to_form("Customer", self.customer, self.customer)
            frappe.db.set_value("Address", address[0].name, "customers", customer)
            frappe.db.commit()


def on_cancel(self):
    if self.target:
        address = frappe.db.sql("""select name, customers
            from tabAddress
            where name in (select address from tabTarget where dossier_number=%s)
            and address_type='Object'""", self.target, as_dict=1)
        if address[0].customers and self.customer:
            customer_list = address[0].customers.split("\n")
            for i in address[0].customers.split("\n"):
                if i.find(self.customer) != -1:
                    customer_list.remove(i)
                    frappe.db.set_value("Address", address[0].name, "customers", '\n'.join(customer_list))
                    frappe.db.commit()
