# Copyright (c) 2013, Switsol AG and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe

from frappe import _
from frappe.utils import now_datetime


def execute(filters=None):
    columns = get_column()
    data = prepare_data(filters)
    return columns, data


def get_column():
    return [
        _("Quotation") + ":Link/Quotation:120",
        _("Quotation Transaction Date") + ":Date:140",
        _("Sales Order") + ":Link/Sales Order:120",
        _("Sales Invoice") + ":Link/Sales Invoice:120",
        _("Customer") + ":Link/Customer:120",
        _("Answer") + ":Data:180", _("Received Order") + ":Data:180",
        _("Sales Order Status") + ":Data:180",
        _("Ordered") + ":Data:180", _("Delivery Date") + ":Date:180",
        _("Approx. Delivery Date from Supplier") + ":Date:180",
        _("Delivered") + ":Data:180",
        _("Sales Invoice Sent") + ":Data:180",
        _("Sales Invoice Status") + ":Data:180",
    ]


def get_data(filters):
    return frappe.db.sql("""
        select
            quotation.name as quotation_name,
            quotation.new_transaction_date as quote_date,
            customer.name as customer,
            quotation.status as quote_status,
            quotation.docstatus as quote_docstatus
        from
            `tabCustomer` customer, `tabQuotation` quotation
        where
            quotation.customer = customer.name
            and quotation.docstatus = 1
            and quotation.new_transaction_date between %s and %s
        order by
            quotation.name
        """, (filters.get("from_date"), filters.get("to_date")), as_dict=1)


def _get_sales_orders(filters, orders):
    return frappe.db.sql("""
        select
            so.name, so.docstatus, so.status, so.customer, so.new_transaction_date, so.new_delivery_date, so.per_delivered, so.supplier_delivery_date, customer.name as customer_name
        from
            `tabSales Order` so, `tabCustomer` customer
        where
            so.customer = customer.name
            and so.docstatus = 1
            and so.new_transaction_date between %s and %s
            and so.name not in (%s)
        order by
            so.name
        """ % ('%s', '%s', ', '.join(['%s'] * len(orders))), tuple([filters.get("from_date"), filters.get("to_date")] + orders), as_dict=1)


def _get_quotation_names(sales_order):
    quotation = frappe.db.sql("""
        select
            si.prevdoc_docname as name
        from
            `tabSales Order Item` si
        where
            si.parent=%s""", sales_order, as_dict=1)
    if quotation:
        quotation_details = frappe.db.sql("""
            select
                quotation.name as quotation_name,
                quotation.new_transaction_date as quote_date,
                quotation.status as quote_status,
                quotation.docstatus as quote_docstatus
            from
                `tabQuotation` quotation
            where
                quotation.name=%s
            """, quotation[0].name, as_dict=1)
        return quotation_details


def _get_sales_order_rows(filters, orders):
    data = []
    sales_orders = _get_sales_orders(filters, orders)
    for i in sales_orders:
        sales_order_docstatus = _("Yes") if i.docstatus == 1 else _("No")
        answer = _("Yes")
        sales_order_status = _("Yes") if i.new_delivery_date else _("No")
        sales_order_delivery_date = i.new_delivery_date
        sales_order_supplier_delivery = i.supplier_delivery_date
        delivery_docstatus = _("Yes") if i.per_delivered != 0 else _("No")
        invoice = get_sales_invoice(i.customer, i.name)
        invoice_docstatus = _("No")
        invoice_status = _("No")
        sales_invoice_name = ""
        if invoice:
            invoice_docstatus = _("Yes") if invoice[0].docstatus == 1 else _("No")
            invoice_status = _("Yes") if invoice[0].status == "Paid" else _("No")
            sales_invoice_name = invoice[0].name

        row = [
            "",
            i.new_transaction_date,
            i.name,
            sales_invoice_name,
            i.customer_name,
            answer,
            _("Yes"),
            sales_order_docstatus,
            sales_order_status,
            sales_order_delivery_date,
            sales_order_supplier_delivery,
            delivery_docstatus,
            invoice_docstatus,
            invoice_status
        ]
        data.append(row)
    return data


def prepare_data(filters):
    data = []
    customers = get_data(filters)
    orders = [""]
    invoices = [""]
    for d in customers:
        answer = _("Yes")
        if d.quote_status in ("Submitted", "Replied"):
            today = now_datetime().date()
            answer = _("No")
            if (today - d.quote_date).days >= 14:
                answer = _("Repeat")
        order = get_sales_order(d.customer, d.quotation_name)
        received_order = _("Yes") if order else _("No")
        sales_order_status = _("No")
        sales_order_docstatus = _("No")
        delivery_docstatus = _("No")
        sales_order_name = ""
        sales_order_delivery_date = ""
        sales_order_supplier_delivery = ""
        if order:
            orders.append(order[0].name)
            sales_order_name = order[0].name
            sales_order_status = _("Yes") if order[0].new_delivery_date else _("No")
            sales_order_docstatus = _("Yes") if order[0].docstatus == 1 else _("No")
            delivery_docstatus = _("Yes") if order[0].per_delivered != 0 else _("No")
            sales_order_delivery_date = order[0].new_delivery_date if order else ""
            sales_order_supplier_delivery = order[0].supplier_delivery_date if order else ""
        invoice = ""
        # delivery_note = ""
        if order:
            invoice = get_sales_invoice(d.customer, order[0].name)
            # delivery_note = get_delivery_note(d.customer, order[0].name)
        invoice_docstatus = _("No")
        invoice_status = _("No")
        sales_invoice_name = ""
        if invoice:
            invoice_docstatus = _("Yes") if invoice[0].docstatus == 1 else _("No")
            invoice_status = _("Yes") if invoice[0].status == "Paid" else _("No")
            sales_invoice_name = invoice[0].name
            invoices.append(invoice[0].name)

        row = [
            d.quotation_name,
            d.quote_date,
            sales_order_name,
            sales_invoice_name,
            d.customer,
            answer,
            received_order,
            sales_order_docstatus,
            sales_order_status,
            sales_order_delivery_date,
            sales_order_supplier_delivery,
            delivery_docstatus,
            invoice_docstatus,
            invoice_status
        ]
        data.append(row)
    sales_orders_rows = _get_sales_order_rows(filters, orders)
    data.extend(sales_orders_rows)
    sales_invoices_rows = _get_sales_invoices_rows(filters, orders)
    data.extend(sales_invoices_rows)
    return data


def get_sales_order(customer, quote):
    return frappe.db.sql("""select si.parent,
        so.name, so.docstatus, so.status, so.new_delivery_date, so.per_delivered, so.supplier_delivery_date
        from `tabSales Order` so, `tabSales Order Item` si
        where
            so.customer=%s
            and si.prevdoc_docname=%s
            and so.name=si.parent
        order by so.creation desc""", (customer, quote), as_dict=1)


def get_sales_invoice(customer, sales_order):
    return frappe.db.sql("""select sii.parent,
        si.name, si.docstatus, si.status
        from `tabSales Invoice` si, `tabSales Invoice Item` sii
        where
            si.customer=%s
            and sii.sales_order=%s
            and si.name=sii.parent""", (customer, sales_order), as_dict=1)


def get_delivery_note(customer, sales_order):
    return frappe.db.sql("""select dn.parent
        from `tabDelivery Note` dn, `tabDelivery Note Item` dni
        where
            dn.customer=%s
            and dni.against_sales_order=%s
            and dn.name=dni.parent""", (customer, sales_order), as_dict=1)


def _get_sales_invoices(filters, invoices):
    return frappe.db.sql("""
        select
            si.name, si.docstatus, si.status, si.customer, customer.name as customer_name
        from
            `tabSales Invoice` si, `tabCustomer` customer
        where
            si.docstatus = 1
            and si.customer = customer.name
            and si.posting_date between %s and %s
            and si.name not in (%s)
        order by
            si.name
        """ % ('%s', '%s', ', '.join(['%s'] * len(invoices))), tuple([filters.get("from_date"), filters.get("to_date")] + invoices), as_dict=1)


def _get_sales_invoices_rows(filters, invoices):
    data = []
    sales_invoices = _get_sales_invoices(filters, invoices)
    for i in sales_invoices:
        invoice_docstatus = _("Yes") if i.docstatus == 1 else _("No")
        invoice_status = _("Yes") if i.status == "Paid" else _("No")

        row = [
            "",
            "",
            "",
            i.name,
            i.customer_name,
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            invoice_docstatus,
            invoice_status
        ]
        data.append(row)
    return data
