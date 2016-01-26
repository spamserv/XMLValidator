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
	check(final_xml);
}

function check(xml) {
	line = xml.split('\n');

	/* Globalne varijable */
	attribute_stack = [];
	has_prolog = false;
	error_exist = false;
	tag_opened = false;

	/* Prolazak kroz pripremljeni xml */
	for (var i = 0; i < line.length; i++) 
	{	
		/* Zaustavljanje for petlje */
		if(error_exist) {
			i=line.length;
			continue;
		}

		if(tag_opened && !pocetak_taga.test(line[i]) && !(line[i].trim()==='') && !komentar.test(line[i])) {

			if(i+1 < line.length) {
				if(!kraj_taga.test(line[i+1])) {
					tag_name = line[i-1].substring(1,line[i+1].indexOf('>')+1);
					output("Očekuje se zatvaranje taga: "+line[i-1], true);
					error_exist = true;
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
			if(!prolog.test(line[i]) && !pocetak_taga.test(line[i])) {
				output("Pogreška u prologu.", true);
				error_exist = true;
			}
			has_prolog = true;
			anything = true;
		}
		
		if(pocetak_taga.test(line[i])) {
			if(nedozvoljena_sintaksa.test(line[i])) {
				output("Nevaljana sintaksa (pojava ključne riječi XML kao tag name ili property name.", true);
				error_exist = true;
			}
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

			final_open = '';
			final_close = '';
			veci = popped_tag > tag_name ? (popped_tag.length) : (tag_name.length);
			if(tag_name != popped_tag) {
				for(i=0;i<veci;i++){
					if(tag_name[i] == popped_tag[i]){
						final_open+='<span class="ok">'+((popped_tag[i] != undefined) ? popped_tag[i] : '')+'</span>';
						final_close+='<span class="ok">'+((tag_name[i] != undefined) ? tag_name[i] : '')+'</span>';
					}else{
						final_open+='<span class="ok">'+((popped_tag[i] != undefined) ? popped_tag[i] : '')+'</span>';
						final_close+='<span class="bad">'+((tag_name[i] != undefined) ? tag_name[i] : '')+'</span>';
					}
				}
				output("Očekuje se zatvaranje taga: <br> "+final_open+"<br>"+final_close+"<br>", false);
				error_exist = true;
			}
			anything = true;
			tag_opened = false;
		}

		if(self_closing.test(line[i]))
			anything = true;

		if(!anything) {
			output("Tag: '"+line[i]+"' nije ispravna sintaksa xml taga.", true);
			error_exist = true;
		}

	}

	if(!error_exist) {
		output = $("#izlaz");
		output.html("");
		$("#debug-panel").removeClass('panel-danger').addClass('panel-success');
		output.text("Ispravan XML.");
	}
}

function output(error, text) {
	output = $("#izlaz");
	output.html("");

	$("#debug-panel").removeClass('panel-success').addClass('panel-danger');
	if(text)
		output.text(error);
	else
		output.html(error);

}