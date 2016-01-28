$( document ).ready(function() {
	//regexi kojima provjeravamo sintaksu u globalnom scopeu
	prolog = /<\?xml(( version=\"[0-9](.[0-9])*\")| (encoding=\"[a-zA-Z_][a-zA-Z0-9_]*\")| standalone=\"(yes|no)\")*\?>/i;
	nedozvoljena_sintaksa = /<(xml.*>|[a-zA-Z_-][a-zA-Z0-9_-]* xml="[a-zA-Z_-][a-zA-Z_-]*"( [a-zA-Z_-][a-zA-Z0-9_-]*="[a-zA-Z_-][a-zA-Z_-]*")*>)+/i;
	komentar = /(<\!\-\-).*(\-\-\>)/;
	pocetak_taga = /<[a-zA-Z_][a-zA-Z0-9_-]*( [a-zA-Z_][a-zA-Z0-9_-]*\=\"[a-zA-Z0-9_-]*\")*>/;
	self_closing = /<[a-zA-Z_][a-zA-Z0-9_-]*( [a-zA-Z_][a-zA-Z0-9_-]*\=\"[a-zA-Z0-9_-]*\")*\/>/;
	kraj_taga = /<\/[a-zA-Z_][a-zA-Z0-9_-]*>/;
	
	/* klik na dugme -> početak provjere, odnosno priprema dokumenta te provjera */
	$("#test").on('click', function() {
		/* uzimanje vrijednosti iz tekstualnog polja */
		var inputXML = $("#input_area").val();
		prepare(inputXML);
	});	
});

/* Funkcija za pripremu unešenog dokumenta, stavlja svaki tag, ili nešto što nije tag u novu liniju */
function prepare(xml) {
	/* micanje svih tabova, novih redova -> sve je u jednoj liniji */
	xml = xml.replace(/(\r\n|\n|\r)/gm,"");

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
	
	/* Provjera je li išta uneseno u textbox */
	if(xml.trim() !== '') {
		/* Djelimo uređeni dokument na linije */
		line = xml.split('\n');

		/* Globalne varijable */
		attribute_stack = [];
		prolog_checked = false;
		error_exist = false;
		tag_opened = false;
		tekst_dozvoljen = false;

		/* Prolazak kroz pripremljeni xml */
		for (var i = 0; i < line.length; i++) 
		{	
			/* Zaustavljanje for petlje ukoliko postoji error */
			if(error_exist) {
				i=line.length;
				continue;
			}

			/* Provjera ukoliko se iza otvorenog taga nalazi teks koji nije komentar ili otvoreni tag, te nije zatvoreni tag a mora biti da se javi greška */
			if(tag_opened && !pocetak_taga.test(line[i]) && !(line[i].trim()==='') && !komentar.test(line[i])) {

				/* Provjera zbog errora budući da se može javiti error u posljednjoj liniji */
				if(i+1 < line.length) {
					/* 
					 * Ukoliko ne postoji zatvoreni tag javimo grešku kako se treba zatvoriti otvoreni tag
					*/
					if(!kraj_taga.test(line[i+1])) {
						tag_name = line[i-1].substring(1,line[i+1].indexOf('>')+1);
						output("Očekuje se zatvaranje taga: "+line[i-1], true);
						error_exist = true;
					}
					/* Smatramo tag zatvorenim */
					tag_opened = false;
				}
			}
			/* varijabla kojom provjeravama je li se išta dogodilo */
			anything = false;
			
			/* provjeravamo prolog samo ukoliko nije do sada provjeren */
			if(!prolog_checked) {
				/* Ukoliko nije dobar prolog vraćamo pogrešku 
				 * - također provjeravamo i je li to slučajno početak taga zato što prolog ne mora biti deklariran po sintaksi xml dokumenta 
				*/
				if(line[i][0] == '<' && !prolog.test(line[i]) && !pocetak_taga.test(line[i])) {
					output("Pogreška u prologu.", true);
					error_exist = true;
					continue;
				}
				if(prolog.test(line[i])) {
					anything = true;
				}
				prolog_checked = true;
			}
			
			/* Provjeravamo je li zadana linija pocetak taga, a ukoliko jest provjeravamo je li sintaksa dozovoljena */
			if(pocetak_taga.test(line[i])) {
				if(nedozvoljena_sintaksa.test(line[i])) {
					output("Nevaljana sintaksa (pojava ključne riječi XML kao tag name ili property name.", true);
					error_exist = true;
				}
				/* Uzimanje imena taga i pushanje na stog */
				if(line[i].indexOf(' ') == -1) {
					tag_name = line[i].substring(1,line[i].indexOf('>'));
				} else {
					tag_name = line[i].substring(1,line[i].indexOf(' '));
				}
				attribute_stack.push(tag_name);

				/* Postavljanje globalnih varijabli */
				anything = true;
				tag_opened = true;
				tekst_dozvoljen = true;
			}
			
			/* Provjeravamo je li zadana linija kraj taga, a ukoliko jest provjeravamo je li sintaksa dozovoljena */
			if(kraj_taga.test(line[i])) {
				/* Uzimanje taga sa stoga i imena trenutnog taga za usporedbu */
				tag_name = line[i].substring(2,line[i].indexOf('>'));
				popped_tag = attribute_stack.pop();

				/* Prirprema za output ukoliko je pogrešno slovo */
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

				/* Postavljanje globalnih varijabli */
				anything = true;
				tag_opened = false;
				tekst_dozvoljen = false;
			}

			/* Provjera je li linija self closing tag ili komentar, ukoliko jest program nastavlja dalje */
			if(self_closing.test(line[i]) || komentar.test(line[i]))
				anything = true;

			/* Provjera je li zadana linija bilo što od gore, ako nije tada je to nešto nedozvoljeno */
			if(!anything) {
				/* Ukoliko je ta linija tag, sintaksa nije dozvoljena */
				if(line[i][0] == "<") {
					error_exist = true;
					output("Tag: '"+line[i]+"' nije ispravna sintaksa xml taga.", true);
				}
				/* Ako nije prazna linija i ukoliko na tom mjestu nije dozovoljeno da stoji tekst, a već je prethodno provjereno je li tag, ispisujemo grešku */
				else if(line[i].trim() !== '' && !tekst_dozvoljen) {
					error_exist = true;
					output("Neispravna sintaksta: '"+line[i]+"' mora biti između oznaka.", true);
				}
				
			}
		}

		/* Ukoliko nemamo errora ali imamo atributa na stogu -> krajnji tag(ovi) nije/su zatvoreni, ispišemo ih i javljamo grešku */
		if(!error_exist && attribute_stack.length > 0) {
			tag_to_output = "";
			for (var i = 0; i < attribute_stack.length; i++) {
				if(i != attribute_stack.length-1)
					tag_to_output += attribute_stack[i] + ", ";
				else
					tag_to_output += attribute_stack[i];
			};
			output("Slijedeći tagovi nisu zatvoreni: "+tag_to_output,true);
			error_exist = true;

		/* Ukoliko nemamo errora, javljamo da je sve OK -> ispravan XML */
		} else if(!error_exist) {
			output_field = $("#izlaz");
			output_field.html("");
			$("#debug-panel").removeClass('panel-danger').addClass('panel-success');
			output_field.text("Ispravan XML.");
		}
	/* Ispis greške ukoliko nije uneseno ništa u polje */
	} else {
		output("Molimo unesite xml dokument.", true);
	}
	
}

/* Funkcija za ispisivanje grešaka */
function output(error, text) {
	output_field = $("#izlaz");
	output_field.html("");

	$("#debug-panel").removeClass('panel-success').addClass('panel-danger');
	if(text)
		output_field.text(error);
	else
		output_field.html(error);

}