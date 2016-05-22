var GameHelp = function(){
	this.layout = document.getElementById("help");
	this.help = document.createElement('div');
	this.space_button = document.createElement('p');

	this.help.style.color = "white";
	this.help.style.zIndex = "10";

	this.space_button.style.color = "red";
	this.space_button.style.textAlign = "center";
	this.layout.appendChild(this.help); 

	this.help.style.width = "100%";
};

GameHelp.prototype = {
	fly: function (lang,width) {
		if (!lang){
			lang = "eng";
		}
		// if (!width){
		// 	width = 250;
		// }
		// //this.help.style.width = "100%";
		if (lang == "eng"){
			this.help.innerHTML = 
			"Hold the space button to excite your atom. Release when ready to shoot with a photon."
			this.space_button.innerHTML = "&lt;press space button&gt"
		}
		else {
			this.help.innerHTML = 
			"Удерживайте левую клавишу мыши, чтобы передвигать свой атом!"
			this.space_button.innerHTML = "&lt;нажмите на пробел&gt"
		}
		// this.help.appendChild(this.space_button);
		//$(this.layout).hide(1000);
    	$(this.layout).show(1000);
    },

	shoot: function (lang,width) {
		if (!lang){
			lang = "eng";
		}
		// if (!width){
		// 	width = 250;
		// }
		// this.help.style.width = width + "px";
		if (lang == "eng"){
			this.help.innerHTML = 
			"Hold the space button to excite your atom. Release when ready to shoot with a photon."
			this.space_button.innerHTML = "&lt;press space button&gt"
		}
		else {
			this.help.innerHTML = 
			"Нажмите на пробел для стрельбы фотоном!"
			this.space_button.innerHTML = "&lt;нажмите на пробел&gt"
		}
		// this.help.appendChild(this.space_button);
		//$(this.layout).hide(1000);
    	$(this.layout).show(1000);
    },
    dontDie: function (lang,width) {
		if (!lang){
			lang = "eng";
		}
		// if (!width){
		// 	width = 250;
		// }
		// this.help.style.width = width + "px";
		if (lang == "eng"){
			this.help.innerHTML = 
			"Avoid much bigger enemy's molecules and map border. It may absorb your atom."
			this.space_button.innerHTML = "&lt;press space button&gt"
		}
		else {
			this.help.innerHTML = 
			"Поглощайте меньшие молекулы противников"
			this.space_button.innerHTML = "&lt;нажмите на пробел&gt"
		}
        
		// this.help.appendChild(this.space_button);
		//$(this.layout).hide(1000);
    	$(this.layout).show(1000);
    },

    changeHelp: function(func){
    	$(this.layout).hide(1000,func);
    },
    hideHelp: function(){
    	$(this.layout).hide(1000);
    }

};
