frappe.provide("switsol_ag.employee_year_report");

switsol_ag.employee_year_report = {
    filters: [
        {
            "fieldname":"fiscal_year",
            "label": __("Fiscal Year"),
            "fieldtype": "Link",
            "options": "Fiscal Year",
            "default": sys_defaults.fiscal_year
        }
    ],
    tree: true,
    name_field: "name",
    parent_field: "parent",
    initial_depth: 2,
    current_month: frappe.datetime.str_to_obj(frappe.datetime.get_today()).getMonth(),
    formatter: function(row, cell, value, columnDef, dataContext, default_formatter) {
        if (columnDef.df.fieldname == "name") {
            columnDef.df.is_tree = true;
        }

        value = default_formatter(row, cell, value, columnDef, dataContext);

        if (!dataContext.parent) {
            var $value = $(value).css("font-weight", "bold");
            value = $value.wrap("<p></p>").parent().html();
        }

        if (columnDef.df.fieldname == "delta" && dataContext.delta) {
            var delta = parseFloat(dataContext.delta)
            var css_class = delta > 0 ? "text-success" : "text-danger";
            var $value = $("<span></span>").addClass(css_class).text(value)
            value = $value.wrap("<p></p>").parent().html();
        }

        if (dataContext.indent == 1){
            if (columnDef.df.fieldname >= 0 && columnDef.df.fieldname <= this.current_month){
                value = repl("<a onclick='switsol_ag.employee_year_report.show_month_report(\"%(employee)s\", \"%(year)s\", \"%(month)s\")'>\
                  %(value)s</a>", {employee: dataContext["employee"],
                                   year: dataContext["year"],
                                   month: columnDef.df.fieldname,
                                   value: value});
            } else if (columnDef.df.fieldname > this.current_month){
                var $value = $(value).addClass("text-primary").css("font-style", "italic");
                value = $value.wrap("<p></p>").parent().html();
            }
        }
        if (dataContext.indent == 2) {
            if(columnDef.df.fieldname == "name") {
                value = default_formatter(row, cell, value, columnDef,dataContext["name"].substring(0, dataContext["name"].length - 2));
            }
        }
        return value;
    },

    MONTHS: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],

    show_month_report: function(employee, year, month) {
        frappe.route_options = {
            employee: employee,
            month: this.MONTHS[month],
            fiscal_year: year,
        };
        frappe.set_route("query-report", "Employee Month Report");
    }
}

frappe.query_reports["Employee Year Report"] = switsol_ag.employee_year_report;


