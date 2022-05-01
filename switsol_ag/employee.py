# Copyright (c) 2017, Switsol AG and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.naming import make_autoname
from frappe import _


def autoname(self, method=None):
    naming_method = frappe.db.get_value("HR Settings", None, "emp_created_by")
    if not naming_method:
        frappe.throw(_("Please setup Employee Naming System in Human Resource > HR Settings"))
    else:
        if naming_method == "Naming Series":
            self.name = make_autoname(self.naming_series + '.####')
        elif naming_method == "Employee Number":
            self.name = self.employee_number

    self.employee = self.name
    self.name = self.employee_name


def apply_pensum(worktime, pensum):
    if not pensum or pensum == 'Abruf':
        percent = 100
    else:
        try:
            percent = int(pensum.replace('%', ''))
        except ValueError:
            percent = 100

    return (worktime * percent) / 100


def can_view_employee_report(employee):
    try:
        frappe.only_for("System Manager")
        return True
    except frappe.PermissionError:
        pass

    cache = frappe.cache()
    permissions = cache.get_value("employee_report_permissions")
    if not permissions:
        permissions = frappe.db.sql("""select name, reports_to, user_id from tabEmployee;""", as_dict=True)
        cache.set_value("employee_report_permissions", permissions, expires_in_sec=5 * 60)

    current = _get_permissions_by_name("user_id", frappe.get_user().name, permissions)
    if not current:
        return False

    if current["name"] == employee:
        return True

    return current["name"] in _get_all_reports_to(employee, permissions)


def _get_permissions_by_name(property_name, value, permissions):
    for perm in permissions:
        if perm[property_name] == value:
            return perm
    return None


def _get_all_reports_to(employee, permissions):
    result = []
    perms = _get_permissions_by_name("name", employee, permissions)
    while True:
        if not perms or not perms["reports_to"] or perms["reports_to"] in result:
            return result
        result.append(perms["reports_to"])
        perms = _get_permissions_by_name("name", perms["reports_to"], permissions)
