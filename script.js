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
	
	xml.forEach(function(line) {
		if(komentar.test(line) || line[0] != "<")
			return;
		
		if(!has_prolog) {
			if(!prolog.test(line) && !pocetak_taga.test(line))
				console.log("Error u prologu");
			has_prolog = true;
		}
		
		console.log(pocetak_taga.test(line));
		if(pocetak_taga.test(line)) {
			//tag_name = line.substring(1,line.indexOf(' '));
			//console.log(line.indexOf(' '));
			//push na stog
		}
		
		if(kraj_taga.test(line)) {
			//pop sa stoga (provjerit što vraća i jel dobar tag zatvoren)
		}
		console.log(line);
	});
}

/*
1. Učitaj liniju
2. Provjeri je li linija = komentar
3. Provjeri je li zatvoren komentar i dokle god nije (je li zatvoren u istom retku ili u n-tom retku, čekaj da se zatvori) <-- funkcija koja provjerava to
4. seekCommentEnd
5. flag --> prolog ?   postoji : ne postoji
6. Ako postoji,provjeri je li dobar prolog,ako nije alert
7. Ispitaj XML tag, ukoliko nije ni komentar ni prolog i spremi mu sve atribute u neki OBJEKT IL AREJ
8. Traži kraj XML taga i jesu li svi zatvoreni koji su otvoreni. (tag unutar tag-a)
*/

//TO DO
// provjeri je li komentar unutar tag-a <tag <!-- --> > u funkciji checkForComment