
from __future__ import unicode_literals
import frappe
import math
from datetime import datetime, timedelta
from frappe.utils import cstr, cint
from frappe import msgprint, _

from erpnext.hr.doctype.process_payroll.process_payroll import get_month_details
from switsol_ag.employee import apply_pensum, can_view_employee_report


MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
          'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
MINUTES_IN_HOUR = 60


def execute(filters=None):
    if not filters:
        filters = {}

    columns = get_columns()

    fiscal_year = filters.get('fiscal_year')

    employment_types = _get_employment_types(fiscal_year)
    employees = _get_employee_details(fiscal_year)

    activity_types = _get_activity_types(fiscal_year)
    # form tree and add future hours
    today = datetime.utcnow()
    tomorrow = today + timedelta(days=1)
    current_month_details = get_month_details(fiscal_year, today.month)

    data = []
    for employment_type in employment_types:
        data.append(employment_type)

        children = filter(lambda x: x['employment_type'] == employment_type['name'], employees)
        for child in children:
            _add_future(child, employment_type, today.date(), tomorrow.date(),
                        current_month_details, fiscal_year)

            child['parent'] = employment_type['name']
            child['expected'] = round_hours(apply_pensum(employment_type['total'], child['pensum']))
            delta = child['total'] - child['expected']

            child['delta'] = format_delta(delta)
            data.append(child)
            children_2 = filter(lambda x: x['parent'] == child['name'], activity_types)
            for child_2 in children_2:
                data.append(child_2)
    return columns, data


def format_delta(delta):
    if delta > 0:
        return '+{0:.2f}'.format(delta)
    elif delta < 0:
        return '{0:.2f}'.format(delta)
    else:
        return ''


def _get_employment_types(fiscal_year):
    employment_types = []

    year_start_date, year_end_date = frappe.db.get_value(
        'Fiscal Year', fiscal_year, ['year_start_date', 'year_end_date'])

    # we should use name not employment_type_name because of translation
    types = frappe.get_all('Employment Type',
                           fields=['name', 'worktime'],
                           order_by='name')
    for employment_type in types:
        employment_type['delta'] = ''
        employment_type['indent'] = 0

        total = 0
        for i in range(12):
            month_details = get_month_details(fiscal_year, i + 1)
            total_days_in_month = month_details['month_days']
            holidays = get_holidays(fiscal_year,
                                    month_details['month_start_date'],
                                    month_details['month_end_date'])
            total_days_in_month -= len(holidays)
            hours = (total_days_in_month * float(employment_type['worktime']) /
                     MINUTES_IN_HOUR)
            # round to 0.5
            employment_type[i] = round_hours(hours)
            total += employment_type[i]
        employment_type['expected'] = total
        employment_type['total'] = total
        employment_types.append(employment_type)
    return employment_types


def _get_employee_details(fiscal_year):
    employees = [e['name'] for e in frappe.get_all('Employee', fields=['name'])
                 if can_view_employee_report(e['name'])]
    if not employees:
        return []
    time_sheets = frappe.db.sql("""
        select name, start_date, employee
        from tabTimesheet
        where employee in ({0})""".format(", ".join(["%s"] * len(employees))), employees, as_dict=1)
    # time_sheets_employees = [time['employee'] for time in time_sheets if time['start_date'].year == int(fiscal_year)]
    working_details = []
    if time_sheets:
        for i in employees:
            time_sheets_emp = [time['name'] for time in time_sheets if time['start_date'] and time['start_date'].year == int(fiscal_year) and time['employee'] == i]
            if time_sheets_emp:
                working_details.extend(frappe.db.sql("""
                    select sum(d.hours) as sum, month(d.from_time) as month, d.activity_type, year(d.from_time) as year,
                            e.pensum, e.employment_type, t.employee as employee, d.from_time as from_time
                        from `tabTimesheet Detail` as d
                        left join `tabTimesheet` as t on d.parent = t.name
                        left join `tabEmployee` as e on t.employee = e.name
                        where d.parent in ({0}) and
                            t.docstatus != 0 and t.docstatus != 2
                        group by month(d.from_time), d.activity_type
                        """.format(", ".join(["%s"] * len(time_sheets_emp))), time_sheets_emp, as_dict=1))
    employees = []
    names = set([w['employee'] for w in working_details])
    if names:
        for name in names:
            employee_work_details = filter(lambda x: x['employee'] == name,
                                           working_details)

            row = {'name': '{} ({})'.format(name, employee_work_details[0]['pensum']),
                   'employee': name,
                   'indent': 1,
                   'year': fiscal_year,
                   'employment_type': employee_work_details[0]['employment_type'],
                   'pensum': employee_work_details[0]['pensum']}
            total = 0
            monthes = {}
            for month_details in employee_work_details:
                month = int(month_details['month'])
                row[month - 1] = round_hours(month_details['sum'])
                if not monthes.get(month):
                    monthes[month] = round_hours(row[month - 1])
                else:
                    row[month - 1] = round_hours(monthes.get(month)) + round_hours(month_details['sum'])
                total = row[month - 1]
            row['total'] = total
            employees.append(row)

    return employees


def _get_activity_types(fiscal_year):
    employees = [e['name'] for e in frappe.get_all('Employee', fields=['name'])
                 if can_view_employee_report(e['name'])]
    if not employees:
        return []

    time_sheets = frappe.db.sql("""
        select name, start_date
        from tabTimesheet
        where employee in ({0})""".format(", ".join(["%s"] * len(employees))), employees, as_dict=1)
    time_sheets = [time['name'] for time in time_sheets if time['start_date'] and time['start_date'].year == int(fiscal_year)]
    working_details = []
    for i in employees:
        work_details = frappe.db.sql("""
            select sum(d.hours) as sum, month(d.from_time) as month, d.activity_type, year(d.from_time) as year,
                e.pensum, e.employment_type, t.employee as employee, d.from_time as from_time
            from `tabTimesheet Detail` as d
            left join `tabTimesheet` as t on d.parent = t.name
            left join `tabEmployee` as e on t.employee = e.name
            where t.employee=%s and
                t.docstatus != 0 and t.docstatus != 2 and
                d.parent in (%s)
            group by month(d.from_time), d.activity_type
            """ % ('%s', ', '.join(['%s'] * len(time_sheets))), tuple([i] + time_sheets),as_dict=1)
        working_details.extend(work_details)

    rowes = {}
    for i in working_details:
        if not rowes.get(i.get('activity_type') + i.get('employee')):
            row = {
                'name': '{} ({})'.format(i['activity_type'], i['employee']),
                'indent': 2,
                'year': fiscal_year,
                i['from_time'].month - 1: round_hours(i['sum']),
                'employment_type': i['employment_type'],
                'pensum': i['pensum'],
                'parent': '{} ({})'.format(i['employee'], i['pensum'])}
            rowes[i.get('activity_type') + i.get('employee')] = row
        else:
            rowes[i.get('activity_type') + i.get('employee')][i['from_time'].month-1] = round_hours(i['sum'])
    return rowes.values()


def _add_future(employee, employment_type, today, tomorrow,
                current_month_details, fiscal_year):
    # in python months are from 1 to 12
    for future in range(today.month, 12):
        employee[future] = round_hours(
            apply_pensum(employment_type[future], employee['pensum']))
        employee['total'] += employee[future]

    # for current month add all future working days
    if tomorrow.month == today.month:
        delta = current_month_details['month_end_date'] - tomorrow
        holidays = get_holidays(fiscal_year,
                                tomorrow,
                                current_month_details['month_end_date'])
        # we need to include tomorrow and month end, so we add 1 day
        days_left = delta.days + 1 - len(holidays)
        hours = (days_left * float(employment_type['worktime']) /
                 MINUTES_IN_HOUR)
        time_sheets = frappe.db.sql("""
            select name, start_date, total_hours
            from tabTimesheet
            where employee =%s
            and month(start_date)=%s""", (employee['employee'], today.month), as_dict=1)
        if time_sheets:
            for i in time_sheets:
                if i.start_date and i.start_date.day > today.day:
                    hours -= (float(employment_type['worktime']) / MINUTES_IN_HOUR - i.total_hours)
                else:
                    hours += i.total_hours
        hours = round_hours(apply_pensum(hours, employee['pensum']))
        employee['total'] += hours
        # employee[tomorrow.month - 1] = (round_hours(employee.get(tomorrow.month - 1, 0) + hours))
        employee[tomorrow.month - 1] = hours


def round_hours(hours):
    return math.ceil(hours * 10.0) / 10


def get_columns():
    columns = [{'fieldname': 'name',
                'label': _('Employment Type'),
                'width': 180}]

    for i, month in enumerate(MONTHS):
        columns.append({'fieldname': str(i),
                        'label': _(month),
                        'width': 52,
                        'fieldtype': 'Float',
                        'precision': 2})

    columns.append({'fieldname': 'expected',
                    'label': _('SOLL Hours'),
                    'width': 84,
                    'fieldtype': 'Float',
                    'precision': 2})

    columns.append({'fieldname': 'total',
                    'label': _('IST Hours'),
                    'width': 94,
                    'fieldtype': 'Float',
                    'precision': 2})
    columns.append({'fieldname': 'delta',
                    'label': _('Over/Under'),
                    'width': 98})

    return columns


def get_holidays(fiscal_year, start_date, end_date):
    holidays = frappe.db.sql('''
select t1.holiday_date from `tabHoliday` t1, `tabHoliday List` t2
    where t1.parent = t2.name
    and t1.holiday_date between %s and %s''', (start_date, end_date))

    return [cstr(i[0]) for i in holidays]
