$( document ).ready(function() {
	//global regex
	prolog = new RegExp("\<\?xml\s+version="[0-9]*.[0-9]*"\s*\?\>");
	komentar = new RegExp("((\<\!\-\-)([^\-\-\>])*(\-\-\>))*");
	//nije gotovo
	pocetak_taga = new RegExp("(\<[a-zA-Z_]+[a-zA-Z_0-9]*(\ )*\>)");
	//global variables
	firstLine = false;
	commentStart = false;
	endOfDocument = false;
	documentLength = 0;
	lines;
	currentLine = 0;

	output = $("#output_area");
	$("#test").on('click', function() {
		var inputXML = $("#input_area").val();
		lines = inputXML.split('\n');
		documentLength = lines.length;
		checkLine(lines[0]);
			//for(i = 0;i < lines.length;i++){
    		//code here using lines[i] which will give you each line
    		//output.append(lines[i]+'\n');
    		//checkLine(lines[i]);
		//}
	});	
});


function checkLine(line){
	if(commentStart) seekCommentEnd(line);
	checkForComment(line);

	if(prolog.test(line))
	{

	}
}

function checkForComment(line)
{
	var comment = new RegExp("<!--*");
	if(comment.test(line)){
		commentStart = true;
		seekCommentEnd(line);
	}
}

function seekCommentEnd(line)
{
	var commentEnd = new RegExp("-->")
	if(commentStart)
	{
		if(commentEnd.test(line)){
			commentStart = false;
			checkLine(lines[currentLine]);
		}
		else{
			currentLine++;
			checkLine(lines[currentLine]);
		}
	}
}



/*
1. Učitaj liniju
2. Provjeri je li linija = komentar
3. Provjeri je li zatvoren komentar i dokle god nije (je li zatvoren 
u istom retku ili u n-tom retku, čekaj da se zatvori) <-- funkcija koja provjerava to
4. seekCommentEnd
5. flag --> prolog ?   postoji : ne postoji
6. Ako postoji,provjeri je li dobar prolog,ako nije alert
7. Ispitaj XML tag, ukoliko nije ni komentar ni prolog i spremi mu sve atribute u neki OBJEKT IL AREJ
8. Traži kraj XML taga i jesu li svi zatvoreni koji su otvoreni. (tag unutar tag-a)
*/

//TO DO
// provjeri je li komentar unutar tag-a <tag <!-- --> > u funkciji checkForComment