$( document ).ready(function() {
	//global regex
	prolog = /<\?xml(( version=\"[0-9](.[0-9])*\")| (encoding=\"[a-zA-Z_][a-zA-Z0-9_]*\")| standalone=\"(yes|no)\")*\?>/i;
	nedozvoljena_sintaksa = /<(xml.*>|[a-zA-Z_-][a-zA-Z0-9_-]* xml="[a-zA-Z_-][a-zA-Z_-]*"( [a-zA-Z_-][a-zA-Z0-9_-]*="[a-zA-Z_-][a-zA-Z_-]*")*>)+/i;
	komentar = /(<\!\-\-).*(\-\-\>)/;
	pocetak_taga = /<[a-zA-Z_][a-zA-Z0-9_-]*( [a-zA-Z_][a-zA-Z0-9_-]*\=\"[a-zA-Z0-9_-]*\")*>/;
	self_closing = /<[a-zA-Z_][a-zA-Z0-9_-]*( [a-zA-Z_][a-zA-Z0-9_-]*\=\"[a-zA-Z0-9_-]*\")*\/>/;
	kraj_taga = /<\/[a-zA-Z_][a-zA-Z0-9_-]*>/;

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
	check(final_xml);
}

function check(xml) {
	line = xml.split('\n');
	has_prolog = false;
	attribute_stack = [];
	error_stack = [];
	
	output = $("#output_area");

	tag_opened = false;

	for (var i = 0; i < line.length; i++) 
	{	
		if(error_stack.length > 0) {
			i=line.length;
			attribute_stack = [];
			continue;
		}

		if(tag_opened && !pocetak_taga.test(line[i]) && !(line[i].trim()==='') && !komentar.test(line[i])) {

			if(i+1 < line.length) {
				if(!kraj_taga.test(line[i+1])) {
					error_stack.push("Očekuje se zatvaranje taga: "+line[i-1]);
				} else {
					tag_name = line[i+1].substring(2,line[i+1].indexOf('>'));
					popped_tag = attribute_stack.pop();
					attribute_stack.push(popped_tag);
				}

				tag_opened = false;
			}
		}

		anything = false;
		
		if(komentar.test(line[i]) || line[i][0] != "<")
			continue;
		
		if(!has_prolog) {
			if(!prolog.test(line[i]) && !pocetak_taga.test(line[i]))
				error_stack.push("Pogreška u prologu.");
			has_prolog = true;
			anything = true;
		}
		
		if(pocetak_taga.test(line[i])) {
			if(nedozvoljena_sintaksa.test(line[i]))
				error_stack.push("Nevaljana sintaksa (pojava ključne riječi XML kao tag name ili property name");
			if(line[i].indexOf(' ') == -1) {
				tag_name = line[i].substring(1,line[i].indexOf('>'));
			} else {
				tag_name = line[i].substring(1,line[i].indexOf(' '));
			}
			attribute_stack.push(tag_name);
			anything = true;
			tag_opened = true;
		}
		
		if(kraj_taga.test(line[i])) {
			tag_name = line[i].substring(2,line[i].indexOf('>'));

			popped_tag = attribute_stack.pop();

			if(tag_name != popped_tag) {
				error_stack.push("Očekuje se zatvaranje taga: <" + popped_tag + ">");
			}
			anything = true;
			tag_opened = false;
		}

		if(self_closing.test(line[i]))
			anything = true;

		if(!anything) {
			error_stack.push("Tag: '"+line[i]+"' nije ispravna sintaksa xml taga.");
		}

	}

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
		output.val("Ispravan XML.");
	}
	

}