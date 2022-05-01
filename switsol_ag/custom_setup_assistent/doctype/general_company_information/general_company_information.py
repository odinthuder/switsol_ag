# Copyright (c) 2017, Switsol AG and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe

from frappe.model.document import Document
# from erpnext.utilities.doctype.address.address import get_address_display


class GeneralCompanyInformation(Document):

    def validate(self):
        pass
        # user = frappe.session.user
        # if user != "Administrator":
        #     company = frappe.db.sql("""select company
        #         from tabEmployee
        #         where user_id=%s""", user, as_dict=True)
        #     if company:
        #         frappe.db.set_value("Company", company[0].company, "name", self.company_name)
        #         frappe.db.set_value("Company", company[0].company, "phone_no", self.phone_no)
        #         frappe.db.set_value("Company", company[0].company, "fax", self.fax)
        #         frappe.db.set_value("Company", company[0].company, "email", self.email)
        #         frappe.db.set_value("Company", company[0].company, "website", self.website)
        #         frappe.db.set_value("Company", company[0].company, "default_currency", self.default_currency)
        #         address_dict = frappe._dict({
        #             "country": self.country,
        #             "address_line1": self.street,
        #             "pincode": self.pincode,
        #             "city": self.city
        #         })
        #         frappe.db.set_value("Company", company[0].company, "address", get_address_display(address_dict))
