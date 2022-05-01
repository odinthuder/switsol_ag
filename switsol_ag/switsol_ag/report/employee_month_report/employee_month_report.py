
from __future__ import unicode_literals
import frappe
from frappe import _
from frappe.utils import cint
from datetime import date, datetime

from erpnext.hr.doctype.process_payroll.process_payroll import (
    get_month_details)
from switsol_ag.employee import apply_pensum, can_view_employee_report
from switsol_ag.switsol_ag.report.employee_year_report.employee_year_report import (
    get_holidays, round_hours, MINUTES_IN_HOUR, format_delta)


MONTH_LIST = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
              'August', 'September', 'October', 'November', 'December']

MONTH_VALUE = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
               'Oct', 'Nov', 'Dec']


def execute(filters=None):
    if not filters:
        filters = {}

    columns = _get_columns()

    month = filters.get('month')
    employee_name = filters.get('employee')
    fiscal_year = filters.get('fiscal_year')

    if not employee_name:
        return columns, []

    if not can_view_employee_report(employee_name):
        frappe.throw(_('Not Permitted'))

    employee = frappe.get_doc('Employee', employee_name)
    employment_type = frappe.get_doc('Employment Type',
                                     employee.employment_type)
    data = [_get_pensum_row(employee)]

    month_index = MONTH_VALUE.index(month)

    data.extend(_get_employee_details(employee, employment_type,
                                      month_index, fiscal_year))

    return columns, data


def _get_employee_details(employee, employment_type, month, fiscal_year):
    details = []
    time_sheet = frappe.db.sql("""
            select name
            from tabTimesheet
            where employee=%s and month(start_date)=%s""", (employee.name, month+1), as_dict=True)
    if time_sheet:
        query = '''
            select sum(l.hours) as sum, dayofmonth(l.from_time) as day
            from `tabTimesheet Detail` as l
            where l.docstatus != 0 and l.docstatus != 2 and
                l.parent = %s and year(l.from_time) = %s and
                month(l.from_time) = %s
            group by dayofmonth(l.from_time)
            order by dayofmonth(l.from_time);
        '''
    time_log = []
    for i in time_sheet:
        time_log.extend(frappe.db.sql(query,
                                 (i['name'], cint(fiscal_year), month + 1),
                                 as_dict=True))
    month_details = get_month_details(fiscal_year, month + 1)
    today = datetime.utcnow().date()
    holidays = get_holidays(fiscal_year, month_details['month_start_date'],
                            month_details['month_end_date'])
    expected = round_hours(
        apply_pensum(float(employment_type.worktime) / MINUTES_IN_HOUR,
                     employee.pensum))

    total_row = {'date': _('Total'),
                 'total': 0,
                 'expected': 0,
                 'delta': 0,
                 'type': 'total',
                 'future': False}

    for day in range(1, month_details['month_days'] + 1):
        row = {'date': '{} {}'.format(day, _(MONTH_LIST[month])),
               'employee': employee.name}

        current_date = date(cint(fiscal_year), month + 1, day)
        row['date_object'] = current_date

        row['is_holiday'] = str(current_date) in holidays
        row['expected'] = 0 if row['is_holiday'] else expected

        day_log = _get_day_total(time_log, day)

        if current_date > today:
            row['total'] = round_hours(day_log['sum']) if day_log else row['expected']
            row['future'] = False if day_log else True
        else:
            row['total'] = round_hours(day_log['sum']) if day_log else 0

        row['delta'] = format_delta(row['total'] - row['expected'])
        total_row['total'] += row['total']
        total_row['expected'] += row['expected']
        details.append(row)

    total_row['delta'] = format_delta(
        total_row['total'] - total_row['expected'])
    details.append(total_row)

    return _clear_empty(details)


def _clear_empty(details):
    for item in details:
        for k, v in item.items():
            if v == 0:
                item[k] = ''
    return details


def _get_day_total(time_log, day):
    for day_total in time_log:
        if day_total['day'] == day:
            return day_total
    return None


def _get_pensum_row(employee):
    return {'type': 'pensum',
            'date': _('Pensum'),
            'expected': employee.pensum}


def _get_columns():
    return [{'fieldname': 'date',
             'label': _('Date'),
             'width': 140},

            {'fieldname': 'expected',
             'label': _('SOLL Hours'),
             'width': 140,
             'fieldtype': 'Float',
             'precision': 2},

            {'fieldname': 'total',
             'label': _('IST Hours'),
             'width': 140,
             'fieldtype': 'Float',
             'precision': 2},

            {'fieldname': 'delta',
             'label': _('Over/Under'),
             'width': 140}]
