# Copyright (c) 2017, Switsol AG and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe

import json
from frappe import _


def after_insert(self, method=None):
    pass


@frappe.whitelist()
def get_items(selected_items):
	selected_items = json.loads(selected_items)
	variants = {}
	for item in selected_items:
		item_templates = frappe.db.sql("""select variant_of
			from 
				tabItem
			where 
				item_code = %s""", item.get("item_code"), as_dict=1)
		item_variants = frappe.db.sql("""select *
			from tabItem
			where
				variant_of=%s
				and item_code !=%s""", (item_templates[0].variant_of, item.get("item_code")), as_dict=1)
		if item_variants:
			variants[item_templates[0].variant_of] = item_variants
	return variants
