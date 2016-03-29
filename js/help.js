var GameHelp = function(){
	this.layout = document.getElementById("help");
	this.help = document.createElement('div');
	this.space_button = document.createElement('p');

	this.help.style.color = "white";
	this.help.style.zIndex = "10";

	this.space_button.style.color = "red";
	this.space_button.style.textAlign = "center";
	this.layout.appendChild(this.help); 
};

GameHelp.prototype = {
	flyFaster: function (lang,width) {
		if (!lang){
			lang = "eng";
		}
		if (!width){
			width = 250;
		}
		this.help.style.width = width + "px";
		if (lang == "eng"){
			this.help.innerHTML = 
			"Hold the space button<br/>to excite your atom.<br/>Release when ready<br/>to shoot with a photon."
			this.space_button.innerHTML = "&lt;press space button&gt"
		}
		else {
			this.help.innerHTML = 
			"Удерживайте пробел,<br/>чтобы возбудить атом.<br/>Отпустите клавишу<br/>для стрельбы фотоном."
			this.space_button.innerHTML = "&lt;нажмите на пробел&gt"
		}
		this.help.appendChild(this.space_button);
		//$(this.layout).hide(1000);
    	$(this.layout).show(1000);
    },
    dontDie: function (lang,width) {
		if (!lang){
			lang = "eng";
		}
		if (!width){
			width = 250;
		}
		this.help.style.width = width + "px";
		if (lang == "eng"){
			this.help.innerHTML = 
			"Avoid much bigger<br/>enemy's molecules<br/>and map border.<br/>It may absorb your atom."
			this.space_button.innerHTML = "&lt;press space button&gt"
		}
		else {
			this.help.innerHTML = 
			"Избегайте много больших<br/>молекул соперников и<br/>края карты. Они могут<br/>поглотить ваш атом.<br/>"
			this.space_button.innerHTML = "&lt;нажмите на пробел&gt"
		}
        
		this.help.appendChild(this.space_button);
		//$(this.layout).hide(1000);
    	$(this.layout).show(1000);
    },


	changeHelp: function(func){
		$(this.layout).hide(1000,func);
	},

	hideHelp: function(func){
		$(this.layout).hide(1000);
	}

};






	// function fly_faster(){
	// 	var overlay = document.getElementById("help");
	// 	var help = document.createElement('div');
	// 	help.style.width = "250px"
	// 	help.innerHTML = "Gather up a big molecule to absorb smaller players! Avoid the border of map and connections with much bigger enemie's molecules!";
	// 	help.style.color = "white";
	// 	help.style.zIndex = "10";
	// 	var space = document.createElement('p');
	// 	space.style.color = "red";
	// 	space.style.textAlign = "center";
	// 	space.innerHTML = "&lt;press space button&gt"
	// 	help.appendChild(space);
	// 	overlay.appendChild(help);
	// 	$(overlay).show(2000);
	// }

