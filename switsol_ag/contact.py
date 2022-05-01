# Copyright (c) 2017, Switsol AG and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe


def validate(self, method=None):
    if self.first_name:
        self.first_name = self.first_name.strip()
    if self.last_name:
        self.last_name = self.last_name.strip()
