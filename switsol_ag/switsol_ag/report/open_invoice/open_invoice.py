# -*- coding: utf-8 -*-

# Copyright (c) 2013, Switsol AG and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe

from frappe import _


def execute(filters=None):
    columns = get_column()
    data = prepare_data(filters)
    return columns, data


def get_column():
    return [
        _("Sales Invoice") + ":Link/Sales Invoice:120",
        _("Customer") + ":Link/Customer:160",
        _("Status") + ":Data:120",
        _("Due Date") + ":Date:120",
        _("Reminder Status") + ":Data:180",
        _("Reminder Date 1") + ":Date:180",
        _("Reminder Date 2") + ":Date:180",
        _("Reminder Date 3") + ":Date:180",
    ]


def get_data(filters):
    conditions = "and status != 'Paid'"
    if filters.get("paid_invoices"):
        conditions = ""
    return frappe.db.sql("""
        select
            name,
            customer,
            status,
            due_date,
            reminder_status,
            reminder_count
        from
            `tabSales Invoice`
        where
            docstatus = 1
            and posting_date between %(from_date)s and %(to_date)s
            {conditions}
        order by
            name
        """.format(conditions=conditions), filters, as_dict=1)


def prepare_data(filters):
    data = []
    sales_invoices = get_data(filters)

    for d in sales_invoices:
        date_1 = ""
        date_2 = ""
        date_3 = ""
        dates = get_reminder_dates(d.name)
        date_1 = dates[0].date if len(dates) >= 1 else ""
        date_2 = dates[1].date if len(dates) >= 2 else ""
        date_3 = dates[2].date if len(dates) >= 3 else ""
        reminder_status = _get_reminder_status(d.name)
        row = [
            d.name,
            d.customer,
            _(d.status),
            d.due_date,
            reminder_status,
            date_1,
            date_2,
            date_3
        ]
        data.append(row)

    return data


def get_date_reminder_comment(customer, reminder_count, sales_invoice):
    subject_en = "{0}.".format(int(reminder_count - 1)) + "&nbsp" + _("Reminder") + "&nbsp" + _("had been sent for Sales Invoice :") + " " + sales_invoice
    subject_de = "{0}.".format(int(reminder_count - 1)) + "&nbsp" + _("Zahlungserinnerung") + "&nbsp" + _("für folgende Rechnung gesendet :") + " " + sales_invoice
    date = frappe.db.sql("""select
        date_format(creation, '%%Y-%%m-%%d')
        from tabCommunication
        where
            reference_name=%s
            and subject=%s or subject=%s""", (customer, subject_en, subject_de))
    if date:
        return date[0][0]


def get_date_reminder_email(customer, reminder_count, sales_invoice):
    subject_en = "{0}.".format(int(reminder_count - 1)) + " " + _("Reminder") + " " + sales_invoice
    subject_de = "{0}.".format(int(reminder_count - 1)) + " " + _("Zahlungserinnerung") + " " + sales_invoice
    date = frappe.db.sql("""select
        date_format(creation, '%%Y-%%m-%%d')
        from `tabEmail Queue`
        where
            message like '%%%s%%' or message like '%%%s%%' """ % (subject_en, subject_de))
    if date:
        return date[0][0]


def _get_reminder_status(sales_invoice):
    reminder = ""
    reminder_status = frappe.db.sql("""select
        reminder_status
        from `tabReminder Log`
        where parent=%s
        order by reminder_status""", sales_invoice, as_dict=1)
    if len(reminder_status) == 1:
        reminder = reminder_status[0].reminder_status
    if len(reminder_status) == 2:
        reminder = reminder_status[1].reminder_status
    if len(reminder_status) == 3:
        reminder = reminder_status[2].reminder_status
    return reminder


def get_reminder_dates(sales_invoice):
    return frappe.db.sql("""select
        date
        from `tabReminder Log`
        where parent=%s""", sales_invoice, as_dict=1)
