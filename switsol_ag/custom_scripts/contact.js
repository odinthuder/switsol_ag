cur_frm.cscript.gender = function(frm) {
	var greeting = "";
	if (cur_frm.doc.gender == "Male") {
		greeting = "Mr";
	} else if (cur_frm.doc.gender == "Female") {
		greeting = "Mrs";
	}
	cur_frm.doc.greeting = greeting;
	cur_frm.refresh_field("greeting");
}
