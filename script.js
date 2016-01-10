$( document ).ready(function() {
	//global regex
	prolog = new RegExp("<\?xml(.)*\?>");
	komentar = new RegExp("(\<\!\-\-).*(\-\-\>)");
	//fali xml ime taga u svim oblicima
	pocetak_taga = new RegExp("\<[a-zA-Z]+[a-zA-Z0-9]*( [a-zA-Z]+[a-zA-Z0-9_]*\=\"[a-zA-Z0-9_]*\")*\>");
	self_closing = new RegExp("\<[a-zA-Z]+[a-zA-Z0-9]*( [a-zA-Z]+[a-zA-Z0-9_]*\=\"[a-zA-Z0-9_]*\")*\/\>");
	kraj_taga = new RegExp("\<\/[a-zA-Z]+[a-zA-Z0-9]*>");
	//global variables
	firstLine = false;
	commentStart = false;
	endOfDocument = false;
	documentLength = 0;
	currentLine = 0;

	output = $("#output_area");
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
		
		if(komentar.test(line) || line[0] != "<")
			return;
		
		if(!has_prolog) {
			if(!prolog.test(line) && !pocetak_taga.test(line))
				error_stack.push("Pogreska u prologu.");
			has_prolog = true;
		}
		
		if(pocetak_taga.test(line)) {
			if(line.indexOf(' ') == -1) {
				tag_name = line.substring(1,line.indexOf('>'));
			} else {
				tag_name = line.substring(1,line.indexOf(' '));
			}
			attribute_stack.push(tag_name);
		}
		
		if(kraj_taga.test(line)) {
			tag_name = line.substring(2,line.indexOf('>'));

			popped_tag = attribute_stack.pop();

			if(tag_name != popped_tag) {
				error_stack.push("TAG : '" + tag_name + "' nije nikada otvoren.");
			}

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

	console.log(attribute_stack);
	console.log(error_stack);
}