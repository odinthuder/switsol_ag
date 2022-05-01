frappe.provide("switsol_ag.employee_month_report");

switsol_ag.employee_month_report = {
    filters: [
        {
            "fieldname":"employee",
            "label": __("Employee"),
            "fieldtype": "Link",
            "options": "Employee",
        },
        {
            "fieldname":"month",
            "label": __("Month"),
            "fieldtype": "Select",
            "options": "Jan\nFeb\nMar\nApr\nMay\nJun\nJul\nAug\nSep\nOct\nNov\nDec",
            "default": ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][
                frappe.datetime.str_to_obj(frappe.datetime.get_today()).getMonth()],
        },
        {
            "fieldname":"fiscal_year",
            "label": __("Fiscal Year"),
            "fieldtype": "Link",
            "options": "Fiscal Year",
            "default": sys_defaults.fiscal_year
        }
    ],
    formatter: function(row, cell, value, columnDef, dataContext, default_formatter) {
        value = default_formatter(row, cell, value, columnDef, dataContext);

        if (dataContext.type && columnDef.df.fieldname != "delta" &&
            (dataContext.type == "pensum" || dataContext.type == "total")) {
            var $value = (columnDef.df.fieldname == "date") ? $("<span/>").text(value) : $(value);
            $value.css("font-weight", "bold");
            value = $value.wrap("<p></p>").parent().html();
        }

        if (columnDef.df.fieldname == "date" && dataContext.is_holiday) {
            var $value = $("<span/>").addClass("text-danger").text(value)
            value = $value.wrap("<p></p>").parent().html();
        }

        if (columnDef.df.fieldname == "delta" && dataContext.delta) {
            var delta = parseFloat(dataContext.delta)
            var css_class = delta > 0 ? "text-success" : "text-danger";
            var $value = $("<span/>").addClass(css_class).text(value)
            value = $value.wrap("<p></p>").parent().html();
        }

        if (columnDef.df.fieldname == "total") {
            if  (dataContext.future) {
                var $value = $(value).addClass("text-primary").css("font-style", "italic");
                value = $value.wrap("<p></p>").parent().html();
            } else if (dataContext.type != "total"){
                value = repl("<a onclick='switsol_ag.employee_month_report.show_day_report(\"%(employee)s\", \"%(date)s\")'>\
                    %(value)s</a>", {employee: dataContext.employee,
                                     date: dataContext.date_object,
                                     value: value});
            }
        }

        return value;
    },

    show_day_report: function(employee, date) {
        frappe.route_options = {
            employee: employee,
            date: date
        };
        frappe.set_route("query-report", "Employee Day Report");
    }
}

frappe.query_reports["Employee Month Report"] = switsol_ag.employee_month_report;
