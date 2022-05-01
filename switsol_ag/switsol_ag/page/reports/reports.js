frappe.pages['reports'].on_page_load = function(wrapper) {
	var page = frappe.ui.make_app_page({
		parent: wrapper,
		title: __('Reports'),
		single_column: true
	});

	frappe.modules_page = page;
	frappe.module_links = {};
	page.section_data = {};

	page.wrapper.find('.page-head h1').css({'padding-left': '15px'});
	page.main.html(frappe.render_template('reports_modules_section'));
}
