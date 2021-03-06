// Copyright (c) 2015, Frappe Technologies Pvt. Ltd. and Contributors
// MIT License. See license.txt

frappe.views.ReportFactory = frappe.views.Factory.extend({
	make: function(route) {
		new frappe.views.ReportViewPage(route[1], route[2]);
	}
});

frappe.views.ReportViewPage = Class.extend({
	init: function(doctype, docname) {
		if(!frappe.model.can_get_report(doctype)) {
			frappe.show_not_permitted(frappe.get_route_str());
			return;
		};

		this.doctype = doctype;
		this.docname = docname;
		this.page_name = frappe.get_route_str();
		this.make_page();

		var me = this;
		frappe.model.with_doctype(this.doctype, function() {
			me.make_report_view();
			if(me.docname) {

				frappe.model.with_doc('Report', me.docname, function(r) {
					me.parent.reportview.set_columns_and_filters(
						JSON.parse(frappe.get_doc("Report", me.docname).json));
					me.parent.reportview.set_route_filters();
					me.parent.reportview.run();
				});
			} else {
				me.parent.reportview.set_route_filters(true);
				me.parent.reportview.run();
			}
		});
	},
	make_page: function() {
		var me = this;
		this.parent = frappe.container.add_page(this.page_name);
		frappe.ui.make_app_page({parent:this.parent, single_column:true});
		this.page = this.parent.page;

		frappe.container.change_to(this.page_name);

		$(this.parent).on('show', function(){
			if(me.parent.reportview.set_route_filters())
				me.parent.reportview.run();
		});
	},
	make_report_view: function() {
		this.page.set_title(__(this.doctype));
		var module = locals.DocType[this.doctype].module;
		frappe.breadcrumbs.add(module, this.doctype);

		if(frappe.model.can_write(this.doctype)) {
			this.page.footer.html('<p class="text-muted">'+__("Tip: Double click cell to edit")+'</p>').removeClass("hide");
		}

		this.parent.reportview = new frappe.views.ReportView({
			doctype: this.doctype,
			docname: this.docname,
			parent: this.parent
		});
	}
});

frappe.views.ReportView = frappe.ui.Listing.extend({
	init: function(opts) {
		var me = this;
		$.extend(this, opts);
		this.can_delete = frappe.model.can_delete(me.doctype);
		this.tab_name = '`tab'+this.doctype+'`';
		this.setup();
	},

	set_init_columns: function() {
		// pre-select mandatory columns
		var columns = [['name'], ['owner']];
		$.each(frappe.meta.docfield_list[this.doctype], function(i, df) {
			if(df.in_filter && df.fieldname!='naming_series' && df.fieldtype!='Table') {
				columns.push([df.fieldname]);
			}
		});
		this.columns = columns;
	},

	setup: function() {
		var me = this;

		this.add_totals_row = 0;
		this.page = this.parent.page;
		this._body = $('<div>').appendTo(this.page.main);
		this.page_title = __('Report')+ ': ' + __(this.docname ? (this.doctype + ' - ' + this.docname) : this.doctype);
		this.page.set_title(this.page_title);
		this.init_list_settings();
		this.make({
			page: this.parent.page,
			method: 'frappe.desk.reportview.get',
			save_list_settings: true,
			get_args: this.get_args,
			parent: this._body,
			start: 0,
			show_filters: true,
			allow_delete: true,
		});

		this.make_new_and_refresh();
		this.make_delete();
		this.make_column_picker();
		this.make_sorter();
		this.make_totals_row_button();
		this.setup_print();
		this.make_export();
		this.setup_auto_email();
		this.set_init_columns();
		this.make_save();
		this.make_user_permissions();
		this.set_tag_and_status_filter();
		this.setup_listview_settings();

		// add to desktop
		this.page.add_menu_item(__("Add to Desktop"), function() {
			frappe.add_to_desktop(__('{0} Report', [me.doctype]), me.doctype);
		}, true);

	},

	make_new_and_refresh: function() {
		var me = this;
		this.page.set_primary_action(__("Refresh"), function() {
			me.run();
		});

		this.page.add_menu_item(__("New {0}", [__(this.doctype)]), function() {
			me.make_new_doc(me.doctype);
		}, true);

	},

	setup_auto_email: function() {
		var me = this;
		this.page.add_menu_item(__("Setup Auto Email"), function() {
			if(me.docname) {
				frappe.set_route('List', 'Auto Email Report', {'report' : me.docname});
			} else {
				frappe.msgprint({message:__('Please save the report first'), indicator: 'red'});
			}
		}, true);
	},

	set_init_columns: function() {
		// pre-select mandatory columns
		var me = this;
		var columns = [];
		if(this.list_settings.fields && !this.docname) {
			this.list_settings.fields.forEach(function(field) {
				var coldef = me.get_column_info_from_field(field);
				if(!in_list(['_seen', '_comments', '_user_tags', '_assign', '_liked_by', 'docstatus'], coldef[0])) {
					columns.push(coldef);
				}
			});
		};
		if(!columns.length) {
			var columns = [['name', this.doctype],];
			$.each(frappe.meta.docfield_list[this.doctype], function(i, df) {
				if((df.in_filter || df.in_list_view) && df.fieldname!='naming_series'
					&& !in_list(frappe.model.no_value_type, df.fieldtype)) {
					columns.push([df.fieldname, df.parent]);
				}
			});
		}

		this.columns = columns;
	},

	// preset columns and filters from saved info
	set_columns_and_filters: function(opts) {
		var me = this;
		this.filter_list.clear_filters();
		if(opts.columns) {
			this.columns = opts.columns;
		}
		if(opts.filters) {
			$.each(opts.filters, function(i, f) {
				// f = [doctype, fieldname, condition, value]
				var df = frappe.meta.get_docfield(f[0], f[1]);
				if (df && df.fieldtype == "Check") {
					var value = f[3] ? "Yes" : "No";
				} else {
					var value = f[3];
				}
				me.filter_list.add_filter(f[0], f[1], f[2], value);
			});
		}

		if(opts.add_total_row) {
			this.add_total_row = opts.add_total_row
		}

		// first sort
		if(opts.sort_by) this.sort_by_select.val(opts.sort_by);
		if(opts.sort_order) this.sort_order_select.val(opts.sort_order);

		// second sort
		if(opts.sort_by_next) this.sort_by_next_select.val(opts.sort_by_next);
		if(opts.sort_order_next) this.sort_order_next_select.val(opts.sort_order_next);

		this.add_totals_row = opts.add_totals_row;
	},

	set_route_filters: function(first_load) {
		var me = this;
		if(frappe.route_options && !this.list_settings.filters) {
			this.set_filters_from_route_options();
			return true;
		} else if(this.list_settings
			&& this.list_settings.filters
			&& !this.docname
			&& (this.list_settings.updated_on != this.list_settings_updated_on)) {
			// list settings (previous settings)
			this.filter_list.clear_filters();
			$.each(this.list_settings.filters, function(i, f) {
				me.filter_list.add_filter(f[0], f[1], f[2], f[3]);
			});
			return true;
		}
		this.list_settings_updated_on = this.list_settings.updated_on;
	},

	setup_print: function() {
		var me = this;
		this.page.add_menu_item(__("Print"), function() {
			var title =  __(me.docname || me.doctype);
			frappe.render_grid({grid:me.grid, title:title});
		}, true);
	},

	// build args for query
	get_args: function() {
		var me = this;
		return {
			doctype: this.doctype,
			fields: $.map(this.columns, function(v) { return me.get_full_column_name(v) }),
			order_by: this.get_order_by(),
			add_total_row: this.add_total_row,
			filters: this.filter_list.get_filters(),
			save_list_settings_fields: 1,
			with_childnames: 1,
		}
	},

	get_order_by: function() {
		var order_by = [];

		// first
		var sort_by_select = this.get_selected_table_and_column(this.sort_by_select);
		if (sort_by_select) {
			order_by.push(sort_by_select + " " + this.sort_order_select.val());
		}

		// second
		if(this.sort_by_next_select.val()) {
			order_by.push(this.get_selected_table_and_column(this.sort_by_next_select)
				+ ' ' + this.sort_order_next_select.val());
		}

		return order_by.join(", ");
	},

	get_selected_table_and_column: function(select) {
		return select.selected_doctype ?
			this.get_full_column_name([select.selected_fieldname, select.selected_doctype]) : "";
	},

	// get table_name.column_name
	get_full_column_name: function(v) {
		if(!v) return;
		return (v[1] ? ('`tab' + v[1] + '`') : this.tab_name) + '.`' + v[0] + '`';
	},

	get_column_info_from_field: function(t) {
		if(t.indexOf('.')===-1) {
			return [strip(t, '`'), this.doctype];
		} else {
			var parts = t.split('.');
			return [strip(parts[1], '`'), strip(parts[0], '`').substr(3)];
		}
	},

	// build columns for slickgrid
	build_columns: function() {
		var me = this;
		return $.map(this.columns, function(c) {
			var docfield = frappe.meta.docfield_map[c[1] || me.doctype][c[0]];
			if(!docfield) {
				var docfield = frappe.model.get_std_field(c[0]);
				if(docfield) {
					docfield.parent = me.doctype;
					if(c[0]=="name") {
						docfield.options = me.doctype;
					}
				}
			}
			if(!docfield) return;

			coldef = {
				id: c[0],
				field: c[0],
				docfield: docfield,
				name: __(docfield ? docfield.label : toTitle(c[0])),
				width: (docfield ? cint(docfield.width) : 120) || 120,
				formatter: function(row, cell, value, columnDef, dataContext, for_print) {
					var docfield = columnDef.docfield;
					docfield.fieldtype = {
						"_user_tags": "Tag",
						"_comments": "Comment",
						"_assign": "Assign",
						"_liked_by": "LikedBy",
					}[docfield.fieldname] || docfield.fieldtype;

					if(docfield.fieldtype==="Link" && docfield.fieldname!=="name") {

						// make a copy of docfield for reportview
						// as it needs to add a link_onclick property
						if(!columnDef.report_docfield) {
							columnDef.report_docfield = copy_dict(docfield);
						}
						docfield = columnDef.report_docfield;

						docfield.link_onclick =
							repl('frappe.container.page.reportview.filter_or_open("%(parent)s", "%(fieldname)s", "%(value)s")',
								{parent: docfield.parent, fieldname:docfield.fieldname, value:value});
					}
					return frappe.format(value, docfield, {for_print: for_print, always_show_decimals: true}, dataContext);
				}
			}
			return coldef;
		});
	},

	filter_or_open: function(parent, fieldname, value) {
		// set filter on click, if filter is set, open the document
		var filter_set = false;
		this.filter_list.get_filters().forEach(function(f) {
			if(f[1]===fieldname) {
				filter_set = true;
			}
		});

		if(!filter_set) {
			this.set_filter(fieldname, value, false, false, parent);
		} else {
			var df = frappe.meta.get_docfield(parent, fieldname);
			if(df.fieldtype==='Link') {
				frappe.set_route('Form', df.options, value);
			}
		}
	},

	// render data
	render_list: function() {
		var me = this;
		var columns = this.get_columns();

		this.set_totals_row();

		// add sr in data
		$.each(this.data, function(i, v) {
			// add index
			v._idx = i+1;
			v.id = v._idx;
		});

		var options = {
			enableCellNavigation: true,
			enableColumnReorder: false,
		};

		if(this.slickgrid_options) {
			$.extend(options, this.slickgrid_options);
		}

		this.col_defs = columns;
		this.dataView = new Slick.Data.DataView();
		this.set_data(this.data);

		var grid_wrapper = this.wrapper.find('.result-list').addClass("slick-wrapper");

		// set height if not auto
		if(!options.autoHeight)
			grid_wrapper.css('height', '500px');

		this.grid = new Slick.Grid(grid_wrapper
			.get(0), this.dataView,
			columns, options);

		if (!frappe.dom.is_touchscreen()) {
			this.grid.setSelectionModel(new Slick.CellSelectionModel());
			this.grid.registerPlugin(new Slick.CellExternalCopyManager({
				dataItemColumnValueExtractor: function(item, columnDef, value) {
					return item[columnDef.field];
				}
			}));
		}

		frappe.slickgrid_tools.add_property_setter_on_resize(this.grid);
		if(this.start!=0 && !options.autoHeight) {
			this.grid.scrollRowIntoView(this.data.length-1);
		}

		this.grid.onDblClick.subscribe(function(e, args) {
			var row = me.dataView.getItem(args.row);
			var cell = me.grid.getColumns()[args.cell];
			me.edit_cell(row, cell.docfield);
		});

		this.dataView.onRowsChanged.subscribe(function (e, args) {
			me.grid.invalidateRows(args.rows);
			me.grid.render();
		});

		this.grid.onHeaderClick.subscribe(function(e, args) {
			if(e.target.className === "slick-resizable-handle")
				return;


			var df = args.column.docfield,
				sort_by = df.parent + "." + df.fieldname;

			if(sort_by===me.sort_by_select.val()) {
				me.sort_order_select.val(me.sort_order_select.val()==="asc" ? "desc" : "asc");
			} else {
				me.sort_by_select.val(df.parent + "." + df.fieldname);
				me.sort_order_select.val("asc");
			}

			me.run();
		});
	},

	edit_cell: function(row, docfield) {
		if(docfield.fieldname !== "idx" &&
			frappe.model.std_fields_list.indexOf(docfield.fieldname)!==-1) {
			frappe.throw(__("Cannot edit standard fields"));
		} else if(frappe.boot.user.can_write.indexOf(this.doctype)===-1) {
			frappe.throw(__("No permission to edit"));
		}
		var me = this;
		var d = new frappe.ui.Dialog({
			title: __("Edit") + " " + __(docfield.label),
			fields: [docfield],
			primary_action_label: __("Update"),
			primary_action: function() {
				me.update_value(docfield, d, row);
			}
		});
		d.show();
		d.set_input(docfield.fieldname, row[docfield.fieldname]);
	},

	update_value: function(docfield, dialog, row) {
		// update value on the serverside
		var me = this;
		var args = {
			doctype: docfield.parent,
			name: row[docfield.parent===me.doctype ? "name" : docfield.parent+":name"],
			fieldname: docfield.fieldname,
			value: dialog.get_value(docfield.fieldname)
		};

		if (!args.name) {
			frappe.throw(__("ID field is required to edit values using Report. Please select the ID field using the Column Picker"));
		}

		frappe.call({
			method: "frappe.client.set_value",
			args: args,
			callback: function(r) {
				if(!r.exc) {
					dialog.hide();
					var doc = r.message;
					$.each(me.dataView.getItems(), function(i, item) {
						if (item.name === doc.name) {
							var new_item = $.extend({}, item);
							$.each(frappe.model.get_all_docs(doc), function(i, d) {
								// find the document of the current updated record
								// from locals (which is synced in the response)
								if(item[d.doctype + ":name"]===d.name) {
									for(k in d) {
										v = d[k];
										if(frappe.model.std_fields_list.indexOf(k)===-1
											&& item[k]!==undefined) {
											new_item[k] = v;
										}
									}
								}
							});
							me.dataView.updateItem(item.id, new_item);
						}
					});
				}
			}
		});
	},

	set_data: function() {
		this.dataView.beginUpdate();
		this.dataView.setItems(this.data);
		this.dataView.endUpdate();
	},

	get_columns: function() {
		var std_columns = [{id:'_idx', field:'_idx', name: 'Sr.', width: 40, maxWidth: 40}];
		if(this.can_delete) {
			std_columns = std_columns.concat([{
				id:'_check', field:'_check', name: "", width: 30, maxWidth: 30,
					formatter: function(row, cell, value, columnDef, dataContext) {
						return repl("<input type='checkbox' \
							data-row='%(row)s' %(checked)s>", {
								row: row,
								checked: (dataContext.selected ? "checked=\"checked\"" : "")
							});
					}
			}]);
		}
		return std_columns.concat(this.build_columns());
	},

	// setup column picker
	make_column_picker: function() {
		var me = this;
		this.column_picker = new frappe.ui.ColumnPicker(this);
		this.page.add_inner_button(__('Pick Columns'), function() {
			me.column_picker.show(me.columns);
		});
	},

	make_totals_row_button: function() {
		var me = this;

		this.page.add_inner_button(__('Show Totals'), function() {
			me.add_totals_row = 1 - (me.add_totals_row ? me.add_totals_row : 0);
			me.render_list();
		});
	},

	set_totals_row: function() {
		// remove existing totals row
		if(this.data.length && this.data[this.data.length-1]._totals_row) {
			this.data.pop();
		}

		if(this.add_totals_row) {
			var totals_row = {_totals_row: 1};
			if(this.data.length) {
				this.data.forEach(function(row, ri) {
					$.each(row, function(key, value) {
						if($.isNumeric(value)) {
							totals_row[key] = (totals_row[key] || 0) + value;
						}
					});
				});
			}
			this.data.push(totals_row);
		}
	},

	set_tag_and_status_filter: function() {
		var me = this;
		this.wrapper.find('.result-list').on("click", ".label-info", function() {
			if($(this).attr("data-label")) {
				me.set_filter("_user_tags", $(this).attr("data-label"));
			}
		});
		this.wrapper.find('.result-list').on("click", "[data-workflow-state]", function() {
			if($(this).attr("data-workflow-state")) {
				me.set_filter(me.state_fieldname,
					$(this).attr("data-workflow-state"));
			}
		});
	},

	// setup sorter
	make_sorter: function() {
		var me = this;
		this.sort_dialog = new frappe.ui.Dialog({title:'Sorting Preferences'});
		$(this.sort_dialog.body).html('<p class="help">Sort By</p>\
			<div class="sort-column"></div>\
			<div><select class="sort-order form-control" style="margin-top: 10px; width: 60%;">\
				<option value="asc">'+__('Ascending')+'</option>\
				<option value="desc">'+__('Descending')+'</option>\
			</select></div>\
			<hr><p class="help">'+__('Then By (optional)')+'</p>\
			<div class="sort-column-1"></div>\
			<div><select class="sort-order-1 form-control" style="margin-top: 10px; width: 60%;">\
				<option value="asc">'+__('Ascending')+'</option>\
				<option value="desc">'+__('Descending')+'</option>\
			</select></div><hr>\
			<div><button class="btn btn-primary">'+__('Update')+'</div>');

		// first
		this.sort_by_select = new frappe.ui.FieldSelect({
			parent: $(this.sort_dialog.body).find('.sort-column'),
			doctype: this.doctype
		});
		this.sort_by_select.$select.css('width', '60%');
		this.sort_order_select = $(this.sort_dialog.body).find('.sort-order');

		// second
		this.sort_by_next_select = new frappe.ui.FieldSelect({
			parent: $(this.sort_dialog.body).find('.sort-column-1'),
			doctype: this.doctype,
			with_blank: true
		});
		this.sort_by_next_select.$select.css('width', '60%');
		this.sort_order_next_select = $(this.sort_dialog.body).find('.sort-order-1');

		// initial values
		this.sort_by_select.set_value(this.doctype, 'modified');
		this.sort_order_select.val('desc');

		this.sort_by_next_select.clear();
		this.sort_order_next_select.val('desc');

		// button actions
		this.page.add_inner_button(__('Set Sort'), function() {
			me.sort_dialog.show();
		});

		$(this.sort_dialog.body).find('.btn-primary').click(function() {
			me.sort_dialog.hide();
			me.run();
		});
	},

	// setup export
	make_export: function() {
		var me = this;
		if(!frappe.model.can_export(this.doctype)) {
			return;
		}
		var export_btn = this.page.add_menu_item(__('Export'), function() {
			var args = me.get_args();
			args.cmd = 'frappe.desk.reportview.export_query'
			if(me.add_totals_row) {
				args.add_totals_row = 1;
			}
			open_url_post(frappe.request.url, args);
		}, true);
	},


	// save
	make_save: function() {
		var me = this;
		if(frappe.user.is_report_manager()) {
			this.page.add_menu_item(__('Save'), function() { me.save_report('save') }, true);
			this.page.add_menu_item(__('Save As'), function() { me.save_report('save_as') }, true);
		}
	},

	save_report: function(save_type) {
		var me = this;

		var _save_report = function(name) {
			// callback
			return frappe.call({
				method: 'frappe.desk.reportview.save_report',
				args: {
					name: name,
					doctype: me.doctype,
					json: JSON.stringify({
						filters: me.filter_list.get_filters(),
						columns: me.columns,
						sort_by: me.sort_by_select.val(),
						sort_order: me.sort_order_select.val(),
						sort_by_next: me.sort_by_next_select.val(),
						sort_order_next: me.sort_order_next_select.val(),
					})
				},
				callback: function(r) {
					if(r.exc) {
						msgprint(__("Report was not saved (there were errors)"));
						return;
					}
					if(r.message != me.docname)
						frappe.set_route('Report', me.doctype, r.message);
				}
			});

		}

		if(me.docname && save_type == "save") {
			_save_report(me.docname);
		} else {
			frappe.prompt({fieldname: 'name', label: __('New Report name'), reqd: 1, fieldtype: 'Data'}, function(data) {
				_save_report(data.name);
			}, __('Save As'));
		}

	},

	make_delete: function() {
		var me = this;
		if(this.can_delete) {
			$(this.parent).on("click", "input[type='checkbox'][data-row]", function() {
				me.data[$(this).attr("data-row")].selected
					= this.checked ? true : false;
			});

			this.page.add_menu_item(__("Delete"), function() {
				delete_list = $.map(me.get_checked_items(), function(d) { return d.name; });
				if(!delete_list.length)
					return;
				if(frappe.confirm(__("This is PERMANENT action and you cannot undo. Continue?"),
					function() {
						return frappe.call({
							method: 'frappe.desk.reportview.delete_items',
							args: {
								items: delete_list,
								doctype: me.doctype
							},
							callback: function() {
								me.refresh();
							}
						});
					}));

			}, true);
		}
	},

	make_user_permissions: function() {
		var me = this;
		if(this.docname && frappe.model.can_set_user_permissions("Report")) {
			this.page.add_menu_item(__("User Permissions Manager"), function() {
				frappe.route_options = {
					doctype: "Report",
					name: me.docname
				};
				frappe.set_route("user-permissions");
			}, true);
		}
	},

	setup_listview_settings: function() {
		if(frappe.listview_settings[this.doctype] && frappe.listview_settings[this.doctype].onload) {
			frappe.listview_settings[this.doctype].onload(this);
		}
	},

	get_checked_items: function() {
		var me = this;
		var selected_records = []

		$.each(me.data, function(i, d) {
			if(d.selected && d.name) {
				selected_records.push(d);
			}
		});

		return selected_records
	}
});

frappe.ui.ColumnPicker = Class.extend({
	init: function(list) {
		this.list = list;
		this.doctype = list.doctype;
	},
	clear: function() {
		this.columns = [];
		$(this.dialog.body).html('<div class="text-muted">'+__("Drag to sort columns")+'</div>\
			<div class="column-list"></div>\
			<div><button class="btn btn-default btn-sm btn-add">'+__("Add Column")+'</button></div>');

	},
	show: function(columns) {
		var me = this;
		if(!this.dialog) {
			this.dialog = new frappe.ui.Dialog({
				title: __("Pick Columns"),
				width: '400',
				primary_action_label: __("Update"),
				primary_action: function() {
					me.update_column_selection();
				}
			});
			this.dialog.$wrapper.addClass("column-picker-dialog");
		}

		this.clear();

		this.column_list = $(this.dialog.body).find('.column-list');

		// show existing
		$.each(columns, function(i, c) {
			me.add_column(c);
		});

		new Sortable(this.column_list.get(0), {
			onUpdate: function(event) {
				me.columns = [];
				$.each($(me.dialog.body).find('.column-list .column-list-item'),
					function(i, ele) {
						me.columns.push($(ele).data("fieldselect"))
					});
			}
		});

		// add column
		$(this.dialog.body).find('.btn-add').click(function() {
			me.add_column(['name']);
		});

		this.dialog.show();
	},
	add_column: function(c) {
		if(!c) return;
		var me = this;

		var w = $('<div class="column-list-item">\
				<i class="fa fa-sort text-muted drag-handle"></i>\
				<a class="close">&times;</a>\
			</div>')
			.appendTo(this.column_list);

		var fieldselect = new frappe.ui.FieldSelect({parent:w, doctype:this.doctype});
		fieldselect.val((c[1] || this.doctype) + "." + c[0]);

		w.data("fieldselect", fieldselect);

		w.find('.close').data("fieldselect", fieldselect)
			.click(function() {
				delete me.columns[me.columns.indexOf($(this).data('fieldselect'))];
				$(this).parent().remove();
			});

		this.columns.push(fieldselect);
	},
	update_column_selection: function() {
		this.dialog.hide();
		// selected columns as list of [column_name, table_name]
		var columns = $.map(this.columns, function(v) {
			return (v && v.selected_fieldname && v.selected_doctype)
				? [[v.selected_fieldname, v.selected_doctype]]
				: null;
		});

		this.list.columns = columns;
		this.list.run();
	}
});