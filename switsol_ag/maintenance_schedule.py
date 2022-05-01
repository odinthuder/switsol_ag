# Copyright (c) 2017, Switsol AG and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe


def autoname(self, method=None):
    self.name = '{} ({})'.format(self.contract_number, self.customer_name)
