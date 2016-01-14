$( document ).ready(function() {
	//global regex
	prolog = /<\?xml(( version=\"[0-9](.[0-9])*\")| (encoding=\"[a-zA-Z_][a-zA-Z0-9_]*\")| standalone=\"(yes|no)\")*\?>/i;
	komentar = /(<\!\-\-).*(\-\-\>)/;
	pocetak_taga = /<[a-zA-Z_][a-zA-Z0-9_]*( [a-zA-Z_][a-zA-Z0-9_]*\=\"[a-zA-Z0-9_]*\")*>/;
	self_closing = /<[a-zA-Z_][a-zA-Z0-9_]*( [a-zA-Z_][a-zA-Z0-9_]*\=\"[a-zA-Z0-9_]*\")*\/>/;
	kraj_taga = /<\/[a-zA-Z_][a-zA-Z0-9_]*>/;

	$("#test").on('click', function() {
		var inputXML = $("#input_area").val();
		text = inputXML.replace(/(\r\n|\n|\r)/gm,"");
		prepare(text);
	});	
});

function prepare(xml) {
	var final_xml = "";
	for (i = 0; i < xml.length; i++) {
		final_xml += xml[i];
		if(xml[i] == ">")
			final_xml += "\n";	
		if(xml[i+1] == "<")
			final_xml += "\n";
	}
	
	final_lines = "";
	lines = final_xml.split('\n');
	lines.forEach(function(line) {
		if(line[0] == "<") { 
			final_lines += line + "\n";
		}
	});
	check(final_lines);
}

function check(xml) {
	xml = xml.split('\n');
	has_prolog = false;
	attribute_stack = [];
	error_stack = [];
	
	output = $("#output_area");

	xml.forEach(function(line) {

		anything = false;
		
		if(komentar.test(line) || line[0] != "<")
			return;
		
		if(!has_prolog) {
			if(!prolog.test(line) && !pocetak_taga.test(line))
				error_stack.push("Pogreška u prologu.");
			has_prolog = true;
			anything = true;
		}
		
		if(pocetak_taga.test(line)) {
			if(line.indexOf(' ') == -1) {
				tag_name = line.substring(1,line.indexOf('>'));
			} else {
				tag_name = line.substring(1,line.indexOf(' '));
			}
			attribute_stack.push(tag_name);
			anything = true;
		}
		
		if(kraj_taga.test(line)) {
			tag_name = line.substring(2,line.indexOf('>'));

			popped_tag = attribute_stack.pop();

			if(tag_name != popped_tag) {
				error_stack.push("Tag : '" + popped_tag + "' nije nikada zatvoren.");
			}
			anything = true;
		}

		if(self_closing.test(line))
			anything = true;

		if(!anything) {
			error_stack.push("Tag: '"+line+"' ne odgovara niti jednoj od mogućih opcija.");
		}

	});

	if(attribute_stack.length != 0) {
		error = attribute_stack.length == 1 ? "Tag: " : "Tagovi: ";
		attribute_stack.forEach(function(er) {
			error += "'" + er + "', ";
		});
		error = error.substring(0,error.length-2);
		error += attribute_stack.length == 1 ? " nije nikada zatvoren." : " nisu nikada zatvoreni.";
		error_stack.push(error);
	}

	//output errors
	panel = $("#debug-panel");
	output = $("#output_area");
	output.val("");
	if(error_stack.length != 0) {
		panel.removeClass('panel-success').addClass('panel-danger');
		error_stack.forEach(function(el) {
			val = output.val();
			output.val(val + el + "\r\n");
		});
	} else {
		panel.removeClass('panel-danger').addClass('panel-success');
		output.val("No errors found.");
	}
	

}