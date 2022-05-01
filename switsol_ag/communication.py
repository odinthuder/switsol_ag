# Copyright (c) 2017, Switsol AG and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe


def validate(self, method=None):
    if self.timeline_doctype == "Customer" and self.timeline_name:
        self.customer = self.timeline_name
