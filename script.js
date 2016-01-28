$( document ).ready(function() {
	//regexi kojima provjeravamo sintaksu u globalnom scopeu
	prolog = /<\?xml(( version=\"[0-9](.[0-9])*\")| (encoding=\"[a-zA-Z_][a-zA-Z0-9_]*\")| standalone=\"(yes|no)\")*\?>/i;
	nedozvoljena_sintaksa = /<(xml.*>|[a-zA-Z_-][a-zA-Z0-9_-]* xml="[a-zA-Z_-][a-zA-Z_-]*"( [a-zA-Z_-][a-zA-Z0-9_-]*="[a-zA-Z_-][a-zA-Z_-]*")*>)+/i;
	komentar = /(<\!\-\-).*(\-\-\>)/;
	otvoreni_tag = /<[a-zA-Z_][a-zA-Z0-9_-]*( [a-zA-Z_][a-zA-Z0-9_-]*\=\"[a-zA-Z0-9_-]*\")*>/;
	self_closing = /<[a-zA-Z_][a-zA-Z0-9_-]*( [a-zA-Z_][a-zA-Z0-9_-]*\=\"[a-zA-Z0-9_-]*\")*\/>/;
	zatvoreni_tag = /<\/[a-zA-Z_][a-zA-Z0-9_-]*>/;
	
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
		stog_atributa = [];
		prolog_provjeren = false;
		error_postoji = false;
		tag_otvoren = false;
		tekst_dozvoljen = false;

		/* Prolazak kroz pripremljeni xml */
		for (var i = 0; i < line.length; i++) 
		{	
			/* Zaustavljanje for petlje ukoliko postoji error */
			if(error_postoji) {
				i=line.length;
				continue;
			}

			/* Provjera ukoliko se iza otvorenog taga nalazi teks koji nije komentar ili otvoreni tag, te nije zatvoreni tag a mora biti da se javi greška */
			if(tag_otvoren && !otvoreni_tag.test(line[i]) && !(line[i].trim()==='') && !komentar.test(line[i])) {

				/* Provjera zbog errora budući da se može javiti error u posljednjoj liniji */
				if(i+1 < line.length) {
					/* 
					 * Ukoliko ne postoji zatvoreni tag javimo grešku kako se treba zatvoriti otvoreni tag
					*/
					if(!zatvoreni_tag.test(line[i+1])) {
						ispis("Očekuje se zatvaranje taga: "+line[i-1], true);
						error_postoji = true;
					}
					/* Smatramo tag zatvorenim */
					tag_otvoren = false;
				}
			}
			/* varijabla kojom provjeravama je li se išta dogodilo */
			bilo_sto = false;
			
			/* provjeravamo prolog samo ukoliko nije do sada provjeren */
			if(!prolog_provjeren) {
				/* Ukoliko nije dobar prolog vraćamo pogrešku 
				 * - također provjeravamo i je li to slučajno početak taga zato što prolog ne mora biti deklariran po sintaksi xml dokumenta 
				*/
				if(line[i][0] == '<' && !prolog.test(line[i]) && !otvoreni_tag.test(line[i])) {
					ispis("Pogreška u prologu.", true);
					error_postoji = true;
					continue;
				}
				if(prolog.test(line[i])) {
					bilo_sto = true;
				}
				prolog_provjeren = true;
			}
			
			/* Provjeravamo je li zadana linija pocetak taga, a ukoliko jest provjeravamo je li sintaksa dozovoljena */
			if(otvoreni_tag.test(line[i])) {
				if(nedozvoljena_sintaksa.test(line[i])) {
					ispis("Nevaljana sintaksa (pojava ključne riječi XML kao tag name ili property name.", true);
					error_postoji = true;
				}
				/* Uzimanje imena taga i pushanje na stog */
				if(line[i].indexOf(' ') == -1) {
					ime_taga = line[i].substring(1,line[i].indexOf('>'));
				} else {
					ime_taga = line[i].substring(1,line[i].indexOf(' '));
				}
				stog_atributa.push(ime_taga);

				/* Postavljanje globalnih varijabli */
				bilo_sto = true;
				tag_otvoren = true;
				tekst_dozvoljen = true;
			}
			
			/* Provjeravamo je li zadana linija kraj taga, a ukoliko jest provjeravamo je li sintaksa dozovoljena */
			if(zatvoreni_tag.test(line[i])) {
				/* Uzimanje taga sa stoga i imena trenutnog taga za usporedbu */
				ime_taga = line[i].substring(2,line[i].indexOf('>'));
				zadnji_tag = stog_atributa.pop();

				if(ime_taga != zadnji_tag) {
					/* Prirprema za ispis ukoliko je pogrešno slovo */
					pripremljeni_otvoreni = '';
					pripremljeni_zatvoreni = '';
					veci = zadnji_tag > ime_taga ? (zadnji_tag.length) : (ime_taga.length);

					for(i=0;i<veci;i++){
						if(ime_taga[i] == zadnji_tag[i]){
							pripremljeni_otvoreni+='<span class="ok">'+((zadnji_tag[i] != undefined) ? zadnji_tag[i] : '')+'</span>';
							pripremljeni_zatvoreni+='<span class="ok">'+((ime_taga[i] != undefined) ? ime_taga[i] : '')+'</span>';
						}else{
							pripremljeni_otvoreni+='<span class="ok">'+((zadnji_tag[i] != undefined) ? zadnji_tag[i] : '')+'</span>';
							pripremljeni_zatvoreni+='<span class="bad">'+((ime_taga[i] != undefined) ? ime_taga[i] : '')+'</span>';
						}
					}
					ispis("Očekuje se zatvaranje taga: <br> "+pripremljeni_otvoreni+"<br>"+pripremljeni_zatvoreni+"<br>", false);
					error_postoji = true;
				}

				/* Postavljanje globalnih varijabli */
				bilo_sto = true;
				tag_otvoren = false;
				tekst_dozvoljen = false;
			}

			/* Provjera je li linija self closing tag ili komentar, ukoliko jest program nastavlja dalje */
			if(self_closing.test(line[i]) || komentar.test(line[i]))
				bilo_sto = true;

			/* Provjera je li zadana linija bilo što od gore, ako nije tada je to nešto nedozvoljeno */
			if(!bilo_sto) {
				/* Ukoliko je ta linija tag, sintaksa nije dozvoljena */
				if(line[i][0] == "<") {
					error_postoji = true;
					ispis("Tag: '"+line[i]+"' nije ispravna sintaksa xml taga.", true);
				}
				/* Ako nije prazna linija i ukoliko na tom mjestu nije dozovoljeno da stoji tekst, a već je prethodno provjereno je li tag, ispisujemo grešku */
				else if(line[i].trim() !== '' && !tekst_dozvoljen) {
					error_postoji = true;
					ispis("Neispravna sintaksta: '"+line[i]+"' mora biti između oznaka.", true);
				}
				
			}
		}

		/* Ukoliko nemamo errora ali imamo atributa na stogu -> krajnji tag(ovi) nije/su zatvoreni, ispišemo ih i javljamo grešku */
		if(!error_postoji && stog_atributa.length > 0) {
			tag_to_ispis = "";
			for (var i = 0; i < stog_atributa.length; i++) {
				if(i != stog_atributa.length-1)
					tag_to_ispis += stog_atributa[i] + ", ";
				else
					tag_to_ispis += stog_atributa[i];
			};
			ispis("Slijedeći tagovi nisu zatvoreni: "+tag_to_ispis,true);
			error_postoji = true;

		/* Ukoliko nemamo errora, javljamo da je sve OK -> ispravan XML */
		} else if(!error_postoji) {
			polje_za_ispis = $("#izlaz");
			polje_za_ispis.html("");
			$("#debug-panel").removeClass('panel-danger').addClass('panel-success');
			polje_za_ispis.text("Ispravan XML.");
		}
	/* Ispis greške ukoliko nije uneseno ništa u polje */
	} else {
		ispis("Molimo unesite xml dokument.", true);
	}
	
}

/* Funkcija za ispisivanje grešaka */
function ispis(error, text) {
	polje_za_ispis = $("#izlaz");
	polje_za_ispis.html("");

	$("#debug-panel").removeClass('panel-success').addClass('panel-danger');
	if(text)
		polje_za_ispis.text(error);
	else
		polje_za_ispis.html(error);
}