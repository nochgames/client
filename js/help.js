

	function fly_faster(){
		var overlay = document.getElementById("help");
		var help = document.createElement('div');
		help.style.width = "250px"
		help.innerHTML = "Gather up a big molecule to absorb smaller players! Avoid the border of map and connections with much bigger enemie's molecules!";
		help.style.color = "white";
		help.style.zIndex = "10";
		var space = document.createElement('p');
		space.style.color = "red";
		space.style.textAlign = "center";
		space.innerHTML = "&lt;press space button&gt"
		help.appendChild(space);
		overlay.appendChild(help);
		$(overlay).show(2000);
	}

