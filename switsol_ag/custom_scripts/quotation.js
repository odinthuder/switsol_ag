// Copyright (c) 2017, Switsol AG and contributors
// For license information, please see license.txt

cur_frm.add_fetch("description_text_name", "description_text", "description_text");
cur_frm.add_fetch("predefined_text_container", "predefined_text_container", "items_description1");
cur_frm.add_fetch("payment_name", "payment_details", "payment_details");


frappe.ui.form.on("Quotation", {
	onload: function(frm) {
		cur_frm.set_query("predefined_text_container", function() {
			return {
				filters: {
					"using_doctype": cur_frm.doc.doctype
				}
			};
		});
		cur_frm.set_query("description_text_name", function() {
			return {
				filters: {
					"using_doctype": cur_frm.doc.doctype
				}
			};
		});
		if(frm.doc.company == "Gilgen Storen AG") {
			cur_frm.add_fetch("item_code", "width_asl_size", "width_asl_size");
			cur_frm.add_fetch("item_code", "width_hight_ht", "width_hight_ht");
			cur_frm.add_fetch("item_code", "width_hight_hl", "width_hight_hl");
			cur_frm.add_fetch("item_code", "location", "location");
			frm.set_query("company_address_name", function() {
				return {
					filters: {
						"customer": cur_frm.doc.company_name
					}
				}
			});
			if(!cur_frm.doc.taxes_and_charges) {
				cur_frm.set_value("taxes_and_charges", "MWST (8%)");
			}
			if(cur_frm.doc.partial_payment_2_name != "bei Montagebeginn") {
				cur_frm.set_value("partial_payment_2_name", "bei Montagebeginn");
			}
			if(cur_frm.doc.partial_payment_3_name != "nach Montage 10 Tage netto") {
				cur_frm.set_value("partial_payment_3_name", "nach Montage 10 Tage netto");
			}
			if(!cur_frm.doc.discount_1_name) {
				cur_frm.set_value("discount_1_name", "Rabatt");
			}
			if(!cur_frm.doc.discount_2_name) {
				cur_frm.set_value("discount_2_name", "Skonto");
			}
		}
	},
	company_address_name: function() {
		erpnext.utils.get_address_display(cur_frm, "company_address_name", "company_address");
	},
	company_name: function() {
		cur_frm.set_value("company_address_name", "");
	},
})


cur_frm.cscript.employee_signature = function() {
	frappe.model.get_value("Employee", {"user_id": cur_frm.doc.employee_signature}, "signature", function(r) {
		if(r && !r.exception) {
			cur_frm.set_value("employee_signature_value", r.signature);
		} else {
			cur_frm.set_value("employee_signature_value", "");
		}
	});
}

cur_frm.cscript.chief_signature = function() {
	frappe.model.get_value("Employee", {"user_id": cur_frm.doc.chief_signature}, "signature", function(r) {
		if(r && !r.exception) {
			cur_frm.set_value("chief_signature_value", r.signature);
		} else {
			cur_frm.set_value("chief_signature_value", "");
		}
	});
}

cur_frm.cscript.clerk_name = function() {
	frappe.model.get_value("Employee", {"user_id": cur_frm.doc.clerk_name}, "signature", function(r) {
		if(r && !r.exception) {
			if(cur_frm.doc.company == "Gilgen Storen AG") {
				cur_frm.set_value("chief_signature", cur_frm.doc.clerk_name);
				cur_frm.set_value("chief_signature_value", r.signature);
			} else {
				cur_frm.set_value("employee_signature", cur_frm.doc.clerk_name);
				cur_frm.set_value("employee_signature_value", r.signature);
			}
		} else {
			cur_frm.set_value("employee_signature", "");
			cur_frm.set_value("employee_signature_value", "");
			if(cur_frm.doc.company == "Gilgen Storen AG") {
				cur_frm.set_value("chief_signature", "");
				cur_frm.set_value("chief_signature_value", "");
			}
		}
	});
}

cur_frm.cscript.contact_person = function() {
	if(!cur_frm.doc.contact_person) {
		// cur_frm.set_value("contact_greeting", "Sehr geehrte Damen und Herren");
		frappe.model.get_value("Customer", cur_frm.doc.customer, ["greeting", "customer_name"], function(r) {
			if(r && !r.exception) {
				cur_frm.set_value("customer_name", r.customer_name);
				var surname = cur_frm.doc.customer.split(" ").slice(-1);
				if(cur_frm.doc.customer_name) {
					var surname = cur_frm.doc.customer_name.split(" ").slice(-1);
				}
				if(r.greeting == "Mrs") {
					var greeting = "Sehr geehrte Frau " + surname.join(" ");
					// var greeting = __("Dear Mrs,") + " " + surname.join(" ");
					cur_frm.set_value("contact_greeting", greeting);
				} else if(r.greeting == "Mr") {
					var greeting = "Sehr geehrter Herr " + surname.join(" ");
					// var greeting = __("Dear Mr,") + " " + surname.join(" ");
					cur_frm.set_value("contact_greeting", greeting);
				} else if(r.greeting == "Family") {
					var greeting = "Sehr geehrte Familie " + surname.join(" ");
					cur_frm.set_value("contact_greeting", greeting);
				}
			}
		});
	}
	erpnext.TransactionController.prototype.contact_person.call(this);
}

cur_frm.cscript.customer = function() {
	erpnext.utils.get_party_details(cur_frm, null, null, function() {
		if(cur_frm.doc.contact_person) {
			frappe.model.get_value("Contact", cur_frm.doc.contact_person, ["greeting", "last_name"], function(r) {
				if(r && !r.exception) {
					if(r.greeting == "Mrs") {
						var greeting = "Sehr geehrte Frau " + r.last_name;
						cur_frm.set_value("contact_greeting", greeting);
					} else if(r.greeting == "Mr") {
						var greeting = "Sehr geehrter Herr " + r.last_name;
						cur_frm.set_value("contact_greeting", greeting);
					} else if(r.greeting == "Family") {
						var greeting = "Sehr geehrte Familie " + r.last_name;
						cur_frm.set_value("contact_greeting", greeting);
					}
				}
			});
		}
	});
}


cur_frm.cscript.custom_refresh = function() {
	cur_frm.toggle_display("naming_series", 0);
	if(cur_frm.doc.__islocal && cur_frm.doc.company != "Gilgen Storen AG") {
		cur_frm.set_value("employee_signature","");
	}
	if(cur_frm.doc.company == "Gilgen Storen AG") {
		cur_frm.add_fetch("customer", "pricing_rate", "pricing_rate");
		cur_frm.add_fetch("customer", "hidden_discount_rate", "hidden_discount_rate");
		cur_frm.add_fetch("customer", "discount", "discount");
		cur_frm.add_fetch("customer", "skonto", "skonto");
		if(cur_frm.doc.pricing_rate) {
			$("div[data-fieldname=pricing_rate]").find('.like-disabled-input').css({'color': '#c0392b !important'});
		}
		if(cur_frm.doc.hidden_discount_rate) {
			$("div[data-fieldname=hidden_discount_rate]").find('.like-disabled-input').css({'color': '#c0392b !important'});
		}
		if(cur_frm.doc.discount) {
			$("div[data-fieldname=discount]").find('.like-disabled-input').css({'color': '#c0392b !important'});
		}
		if(cur_frm.doc.skonto) {
			$("div[data-fieldname=skonto]").find('.like-disabled-input').css({'color': '#c0392b !important'});
		}
		if(frappe.session.user != "Administrator" && !cur_frm.doc.clerk_name) {
			cur_frm.set_value("clerk_name", frappe.session.user);
			cur_frm.set_value("chief_signature", frappe.session.user);
			cur_frm.set_value("employee_signature","")
		}
		if(!cur_frm.doc.payment_name) {
			cur_frm.set_value("payment_name", "PostFinance")
		}
		if(!cur_frm.doc.taxes_and_charges) {
			cur_frm.set_value("taxes_and_charges", "MWST (8%)");
		}
		if(!cur_frm.doc.description_text) {
			frappe.model.get_value("Description Text", {"using_doctype": cur_frm.doc.doctype}, "title", function(r) {
				if(r && !r.exception) {
					cur_frm.set_value("description_text_name", r.title);
					cur_frm.set_value("description_text", r.description_text);
				}
			});
		}
		if(!cur_frm.doc.predefined_text_container) {
			frappe.model.get_value("Predefined Text Container", {"using_doctype": cur_frm.doc.doctype}, "title", function(r) {
				if(r && !r.exception) {
					cur_frm.set_value("predefined_text_container", r.title);
					cur_frm.set_value("items_description1", r.predefined_text_container);
				}
			});
		}
		if(!cur_frm.doc.quote_expiration_date) {
			cur_frm.set_value("quote_expiration_date", dateutil.add_months(dateutil.get_today(), 3));
		}
		if(cur_frm.doc.partial_payment_2_name != "bei Montagebeginn") {
			cur_frm.set_value("partial_payment_2_name", "bei Montagebeginn");
		}
		if(cur_frm.doc.partial_payment_3_name != "nach Montage 10 Tage netto") {
			cur_frm.set_value("partial_payment_3_name", "nach Montage 10 Tage netto");
		}
		if(!cur_frm.doc.discount_1_name) {
			cur_frm.set_value("discount_1_name", "Rabatt");
		}
		if(!cur_frm.doc.discount_2_name) {
			cur_frm.set_value("discount_2_name", "Skonto")
		}
	}
}

cur_frm.cscript.add_company_address = function() {
	var dialog = new frappe.ui.Dialog({
		title: __("Add Company Address"),
		fields: [
			{
				"label": __("Address"),
				"fieldname": "address",
				"fieldtype": "Link",
				"options": "Address",
				"only_select": true,
				"get_query": function () {
					return {
						filters: [
							["Address", "customer", "=", cur_frm.doc.company_name],
						]
					}
				},
				"reqd": 1
			}
		],
		secondary_action_label: (__("Create"))
	});

	dialog.set_primary_action(__("Add"), function() {
		args = dialog.get_values();
		if(!args) return;
		dialog.hide();
		cur_frm.set_value("company_address_name", args.address);
		cur_frm.refresh_field("company_address_name");
	});
	dialog.$wrapper.find(".btn-modal-close").click(function() {
		var new_address = frappe.model.make_new_doc_and_get_name("Address");
		frappe.route_options = {"address_title": cur_frm.doc.company_name, "address_line1": "test", "customer": cur_frm.doc.company_name}
		frappe.set_route("Form", "Address", new_address);
	})
	dialog.show();
}

cur_frm.cscript.discount_1_value = function() {
	discount_amount = calculate_discount();
	cur_frm.set_value("grand_total", flt(cur_frm.doc.total) - flt(discount_amount));
	cur_frm.set_value("discount_amount", discount_amount)
	$.each(cur_frm.doc["items"] || [], function(i, item) {
		distributed_amount = flt(item.rate*flt(cur_frm.doc.discount_1_value) / 100);
		item.net_amount = flt(item.net_amount - distributed_amount, precision("net_amount", item));
		item.net_rate = flt(item.net_rate / item.qty, precision("net_rate", item));
		item.amount = flt(item.amount - distributed_amount, precision("amount", item));
	});
	cur_frm.refresh_field("items");
}

cur_frm.cscript.discount_2_value = function() {
	discount_amount = calculate_discount();
	cur_frm.set_value("grand_total", flt(cur_frm.doc.total) - flt(discount_amount));
	cur_frm.set_value("discount_amount", discount_amount)
	$.each(cur_frm.doc["items"] || [], function(i, item) {
		discount = 0.0;
		if(cur_frm.doc.discount_1_value) {
			discount += cur_frm.doc.discount_1_value;
		}
		distributed_amount = flt(item.rate*flt(discount + cur_frm.doc.discount_2_value) / 100);
		item.net_amount = flt(item.net_amount - distributed_amount, precision("net_amount", item));
		item.net_rate = flt(item.net_rate / item.qty, precision("net_rate", item));
		item.amount = flt(item.amount - distributed_amount, precision("amount", item));
	});
	cur_frm.refresh_field("items");
}

cur_frm.cscript.discount_3_value = function() {
	discount_amount = calculate_discount();
	cur_frm.set_value("grand_total", flt(cur_frm.doc.total) - flt(discount_amount));
	cur_frm.set_value("discount_amount", discount_amount)
	$.each(cur_frm.doc["items"] || [], function(i, item) {
		distributed_amount = flt(item.rate*flt(cur_frm.doc.discount_3_value) / 100);
		item.net_amount = flt(item.net_amount - distributed_amount, precision("net_amount", item));
		item.net_rate = flt(item.net_rate / item.qty, precision("net_rate", item));
		item.amount = flt(item.amount - distributed_amount, precision("amount", item));
	});
	cur_frm.refresh_field("items");
}

calculate_discount = function() {
	var total = flt(cur_frm.doc.total);
	var discount_amount = 0;
	if (cur_frm.doc.discount_1_value || cur_frm.doc.discount_2_value || cur_frm.doc.discount_3_value) {
		cur_frm.set_value("discount_1_rate", 0);
		cur_frm.set_value("discount_2_rate", 0);
		var current_total = total;
		if(cur_frm.doc.discount_1_value) {
			discount_amount = flt(total*flt(cur_frm.doc.discount_1_value) / 100, 
				precision("discount_amount"));
			current_total -= discount_amount;
			cur_frm.set_value("discount_1_rate", discount_amount);
		}
		if(cur_frm.doc.discount_2_value) {
			discount_amount = flt(current_total*flt(cur_frm.doc.discount_2_value) / 100, 
				precision("discount_amount"));
			current_total -= discount_amount;
			cur_frm.set_value("discount_2_rate", discount_amount);
		}
		if(cur_frm.doc.discount_3_value) {
			current_total -= flt(cur_frm.doc.discount_3_value);
		}
		discount_amount = total - current_total;
	}
	else {
		discount_amount = flt(total*flt(cur_frm.doc.additional_discount_percentage) / 100, 
			precision("discount_amount"));
	}
	return discount_amount
}

cur_frm.cscript.hide_original_price = function(frm, cdt, cdn) {
	rate(frm, cdt, cdn);
	cur_frm.refresh_fields();
}

cur_frm.cscript.rate = function(frm, cdt, cdn) {
	rate(frm, cdt, cdn);
}

rate = function(frm, cdt, cdn) {
	var item = frappe.get_doc(cdt, cdn);
	frappe.model.round_floats_in(item, ["rate", "price_list_rate"]);
	if(item.price_list_rate && !item.hide_original_price) {
		item.discount_percentage = flt((1 - item.rate / item.price_list_rate) * 100.0, precision("discount_percentage", item));
	} else {
		item.discount_percentage = 0.0;
	}
}
