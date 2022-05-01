
from __future__ import unicode_literals
import frappe
from frappe import _
from frappe.utils.data import getdate, formatdate
from datetime import datetime

from switsol_ag.employee import apply_pensum, can_view_employee_report
from switsol_ag.switsol_ag.report.employee_year_report.employee_year_report import (
    round_hours, MINUTES_IN_HOUR, format_delta)


TIME_FORMAT = '%H:%M'


def execute(filters=None):
    if not filters:
        filters = {}

    columns = _get_columns()

    workday = getdate(filters.get('date'))
    employee_name = filters.get('employee')

    if not employee_name:
        return columns, []

    if not can_view_employee_report(employee_name):
        frappe.throw(_('Not Permitted'))

    employee = frappe.get_doc('Employee', employee_name)
    employment_type = frappe.get_doc('Employment Type',
                                     employee.employment_type)
    data = [_get_pensum_row(employee)]

    data.extend(_get_employee_details(employee, employment_type, workday))

    return columns, data


def _get_employee_details(employee, employment_type, workday):
    details = []

    today = datetime.utcnow().date()

    is_holiday = _is_holiday(workday)
    details.append(_get_date_row(workday, is_holiday))

    if is_holiday:
        expected = 0
    else:
        expected = round_hours(
            apply_pensum(float(employment_type.worktime) / MINUTES_IN_HOUR,
                         employee.pensum))

    # if workday > today:
        # total = expected
    # else:
    time_sheet = frappe.db.sql("""
        select name
        from tabTimesheet
        where employee=%s and start_date=%s""", (employee.name, workday), as_dict=True)
    if time_sheet:
        query = '''
            select project, customer, from_time, to_time, hours
            from `tabTimesheet Detail`
            where docstatus != 0 and docstatus != 2 and
                parent=%s and date(from_time)=%s
            order by from_time;
        '''
        time_log = frappe.db.sql(query, (time_sheet[0].name, workday), as_dict=True)
        total = 0
        for project_details in time_log:
            title_data = [project_details['project'],
                          project_details['customer']]
            title = ' / '.join(filter(None, title_data))
            title = title or "Without"
            row = {'workday': title,
                   'hours': round_hours(project_details['hours']),
                   'start': project_details['from_time'].strftime(TIME_FORMAT),
                   'end': project_details['to_time'].strftime(TIME_FORMAT)}
            details.append(row)
            total += row['hours']
    else:
        total = expected

    details.append({'workday': _('TOTAL'),
                    'hours': total or '',
                    'type': 'total',
                    'future': (workday > today)})
    details.append({'workday': _('SOLL Hours'),
                    'hours': expected or '',
                    'type': 'total'})
    details.append({'workday': _('Over/Under'),
                    'type': 'delta',
                    'hours': format_delta(total - expected)})

    return details


def _get_pensum_row(employee):
    return {'type': 'pensum',
            'workday': _('Pensum'),
            'hours': employee.pensum}


def _get_date_row(workday, is_holiday):
    return {'type': 'date',
            'holiday': is_holiday,
            'workday': _('Workday'),
            'hours': formatdate(workday)}


def _get_columns():
    return [{'fieldname': 'workday',
             'label': _('Workday'),
             'width': 220},

            {'fieldname': 'start',
             'label': _('Start'),
             'width': 140},

            {'fieldname': 'end',
             'label': _('End'),
             'width': 140},

            {'fieldname': 'hours',
             'label': _('Booked Hours'),
             'width': 140,
             'fieldtype': 'Float',
             'precision': 2}]


def _is_holiday(workday):
    is_holiday = frappe.db.sql('''
select count(*) from `tabHoliday` t1, `tabHoliday List` t2
    where t1.parent = t2.name
    and t1.holiday_date = %s''', workday)[0][0]

    return is_holiday == 1
