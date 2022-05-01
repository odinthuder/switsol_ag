# -*- coding: utf-8 -*-

# Copyright (c) 2017, Switsol AG and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe

from frappe import _
from frappe.utils import formatdate


def execute(filters=None):
    columns = get_column()
    data = prepare_data(filters)
    return columns, data


def get_column():
    return [
        _("Due Date") + ":Date:160",
        _("Expected Start Date") + ":Date:160",
        _("Responsible Person") + ":Link/User:240",
        _("Subject") + ":Data:120",
        _("Status") + ":Data:120",
        _("Name") + ":Data:120"
    ]


def get_data(filters):
    statuses = ["Open", "Waiting for Other Person", "Working"]
    if filters.get("done_tasks"):
        statuses.extend(["Done", "Closed", "Unnecessary"])
    responsible_person = ""
    if not filters.get("all_tasks"):
        responsible_person = frappe.session.user
    return frappe.db.sql("""
        select
            exp_end_date,
            exp_start_date,
            _assign,
            name,
            status,
            subject,
            description
        from
            `tabTask`
        where
            status in (%s)
            and ifnull(_assign,"") like %s
        order by
            exp_end_date
        """ % (', '.join(['%s'] * len(statuses)), '%s'), tuple(statuses + ["%%%s%%" % responsible_person]), as_dict=1)


def prepare_data(filters):
    data = []
    tasks = get_data(filters)

    for t in tasks:
        assign = frappe.db.sql("""select owner from tabToDo where reference_type='Task' and reference_name=%s""", t.name, as_dict=1)
        assign = [i.owner for i in assign]
        row = [
            formatdate(t.exp_end_date),
            formatdate(t.exp_start_date),
            ', '.join(assign),
            str(t.subject) + "\n" + str(t.description),
            _(t.status),
            t.name
        ]
        data.append(row)

    return data
