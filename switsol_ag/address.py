# Copyright (c) 2017, Switsol AG and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.utils import get_link_to_form


def validate(self, method=None):
    self.pincode = self.postal_code.strip() if self.postal_code else ""
    if self.customer and self.is_primary_address:
        frappe.db.set_value("Customer", self.customer, "pincode", self.postal_code)


@frappe.whitelist()
def postal_code_query(doctype, txt, searchfield, start, page_len, filters):
    return frappe.db.sql("""select postal_code
        from `tabCity Postal Code`
        where parent=%s
        and postal_code like %s
        order by postal_code desc
        limit %s, %s""".format(frappe.db.escape(searchfield)), (filters.get("town"), "%{0}%".format(txt), start, page_len))


@frappe.whitelist()
def city_query(doctype, txt, searchfield, start, page_len, filters):
    return frappe.db.sql("""select cp.parent
        from `tabCity Postal Code` cp
        where cp.postal_code=%s
        order by parent desc
        limit %s, %s""".format(frappe.db.escape(searchfield)), (filters.get("postal_code"), start, page_len))


@frappe.whitelist()
def add_customers(customer, address):
    customer_name = frappe.db.sql("""select customer_name
        from tabCustomer
        where name=%s""", customer, as_dict=1)
    address = frappe.db.sql("""select name, customers
        from tabAddress
        where name=%s""", address, as_dict=1)
    if customer_name and address:
        customers = customer_name[0].customer_name + " " + get_link_to_form("Customer", customer, customer)
        if address[0].customers:
            customers_name = [i.split('<a')[0].strip() for i in address[0].customers.split('\n')]
            if customer_name[0].customer_name not in customers_name:
                customers = address[0].customers + "\n" + customer_name[0].customer_name + " " + get_link_to_form("Customer", customer, customer)
            else:
                customers = address[0].customers
        frappe.db.set_value("Address", address[0].name, "customers", customers)
        frappe.db.commit()


@frappe.whitelist()
def remove_customers(customer, address):
    customer_name = frappe.db.sql("""select customer_name
        from tabCustomer
        where name=%s""", customer, as_dict=1)
    address = frappe.db.sql("""select name, customers
        from tabAddress
        where name=%s""", address, as_dict=1)
    if customer_name and address:
        if address[0].customers:
            customers = address[0].customers.split('\n')
            for i in customers:
                if i.find(customer_name[0].customer_name) != -1:
                    customers.remove(i)
            frappe.db.set_value("Address", address[0].name, "customers", '\n'.join(customers))
            frappe.db.commit()


@frappe.whitelist()
def make_address(company_name):
    ad = frappe.new_doc("Address")
    ad.customer = company_name
    ad.address_title = company_name
    return ad
