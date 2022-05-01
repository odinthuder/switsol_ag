
frappe.query_reports["Employee Day Report"] = {
    filters: [
        {
            "fieldname":"employee",
            "label": __("Employee"),
            "fieldtype": "Link",
            "options": "Employee",
        },
        {
            "fieldname":"date",
            "label": __("Date"),
            "fieldtype": "Date",
            "default": frappe.datetime.get_today(),
        },
    ],
    formatter: function(row, cell, value, columnDef, dataContext, default_formatter) {
        value = default_formatter(row, cell, value, columnDef, dataContext);

        if (dataContext.type) {
            if (dataContext.type == "pensum" || dataContext.type == "date"){
                var $value = $("<div/>");
                $value.text(dataContext[columnDef.df.fieldname]);
                $value.css("font-weight", "bold");
                if (columnDef.df.fieldname == "hours"){
                    $value.css("text-align", "right");
                }
                if (dataContext.holiday && columnDef.df.fieldname == "hours") {
                    $value.addClass("text-danger")
                }
            } if (dataContext.type == "total" && dataContext.future && columnDef.df.fieldname == "hours") {
                var $value = $(value).addClass("text-primary").css("font-style", "italic");
            } else if (dataContext.type == "total" || (dataContext.type == "delta" && columnDef.df.fieldname == "workday")) {
                var $value = (columnDef.df.fieldname == "workday") ? $("<span/>").text(value) : $(value);
                $value.css("font-weight", "bold");
            } else if (dataContext.type == "delta") {
                var delta = parseFloat(dataContext.hours)
                var css_class = delta > 0 ? "text-success" : "text-danger";
                var $value = $(value).addClass(css_class)
            }
            value = $value.wrap("<p></p>").parent().html();
        }

        return value;
    }
}
