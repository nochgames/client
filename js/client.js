/**
 * Created by fatman on 28/02/16.
 */

/*
======================================================================================
UI scripts
======================================================================================
*/

function validateInputFields(inputField) {
    if (inputField.val() == "" || inputField.val().length > 15) {
        inputField.addClass('error__div');
        return false;
    } else {
        inputField.removeClass('error__div');
        return true;
    }
}
function hideOverlay() {
    var overlay = $('#overlay');
    if (overlay.is(":visible")) {
        overlay.hide();
    } else {
        overlay.show();
    }
}
$('#btn__hide').click(function () {
    hideOverlay();
});

$('#btn__go').click(function(){
    var login__input = $('#login__input');


    if (!validateInputFields(login__input)) return;
    $('#overlay').hide();
    $('#btn__hide').hide();
    ////////

    var color = $('#btn__go').css("background-color");    
    if (color == "rgb(255, 165, 0)"){
        color = "rgb(" + Math.round(Math.random() * 255) + ',' +  Math.round(Math.random()) * 255 + ',' +  Math.round(Math.random()) * 255 + ')';
    }
    //alert(color)
    var rgb = [];
    var tmp = "";
    for (var k = 0;k < color.length ;++k){

        if (color[k] <= "9" && color[k] >= "0"){
            tmp+= color[k];
            //alert(color[k])
        }
        if (color[k]==","||color[k] == ")") {
            rgb.push(parseInt(tmp,10));
            //alert(tmp)
            tmp=""
        }
    } //alert(rgb);
    if (rgb[0]> 200 && rgb[1] > 200 && rgb[2] > 200 ){
        for (var i=0;i<3;i++){
            rgb[i]-=20
        }
    }
    else if (rgb[0] < 30 && rgb[1] < 30 && rgb[2] < 30){
        for ( i = 0;i<3;i++){
            rgb[i]+=20
        }
    }
    //alert(rgb)
    var rgb_new ="rgb("+String(rgb[0]) + "," + String(rgb[1]) + "," + String(rgb[2]) + ")";
    //alert(rgb_new);
    $("#btn__go").css("background-color",rgb_new);
    //alert($("#btn__go").css("background-color"));

    Game.addMainPlayer(login__input.val(), rgb_new);
});

/*
======================================================================================
Game and rendering logic
======================================================================================
*/

const collectionOfImages = [
    {
        prefix: "3layer/q",
        count: 30
    }, {
        prefix: "2layer/",
        count: 35
    }, {
        prefix: "1layer/q",
        count: 29
    }, {
        prefix: "clouds/",
        count: 29
    }
];

class BackGround {
    constructor(pixiApp) {
        this.collectionBackgroundItem = new BackGroundItemCollection(pixiApp);
        this.prevPlayerPosition = {
            x: dataStorage.mainPlayerPosition.x,
            y: dataStorage.mainPlayerPosition.y
        };
        this.prevCoefScale = dataStorage.coefficient;
    }

    tick() {
        var deltaPlayerPosition = {
                x: dataStorage.mainPlayerPosition.x - this.prevPlayerPosition.x,
                y: dataStorage.mainPlayerPosition.y - this.prevPlayerPosition.y
            },
            deltaCoefScale =  this.prevCoefScale - dataStorage.coefficient;

        this.collectionBackgroundItem.tick(deltaPlayerPosition, deltaCoefScale);
        this.prevPlayerPosition = {
            x: dataStorage.mainPlayerPosition.x,
            y: dataStorage.mainPlayerPosition.y
        };
        this.prevCoefScale = dataStorage.coefficient;
        //requestAnimationFrame( this.tick.bind(this) );
    }

    clear() {
    	this.collectionBackgroundItem.clear();
    }
}

class BackGroundItemCollection {
    static get collectionOfImages() {
        return collectionOfImages;
    }

    constructor(pixiApp) {
        this.collectionOfLevels = [ [], [], [], [] ];
        this.coefForMovie = [1.2, 0.9, 0.6, 0.3];
        this.coefForSize = [1.5, 1, 0.5, 2];
        this.conuts = [];
        this.container = new PIXI.Container();
        pixiApp.stage.addChild(this.container);

        this.checkBackGroundElementQuantity(()=>{return this.getRandomPositionInside()});
    }

    tick(deltaPlayerPosition, deltaCoefScale) {
        if (deltaCoefScale) {
            this.zoomGame(deltaCoefScale);
        }
    	this.checkBackGroundElementQuantity(()=>{return this.getRandomPositionOutside()});

        for (var i = 0; i < this.collectionOfLevels.length; i++) {
            for (var j = 0; j < this.collectionOfLevels[i].length; j++) {
                this.holdIfGetOut(this.collectionOfLevels[i][j]);
                this.collectionOfLevels[i][j].tick(deltaPlayerPosition);
                //drawManager.drawBackgroundItem(this.collectionOfLevels[i][j]);
            }
        }
    }

    holdIfGetOut(itemBackground) {
        if (itemBackground.graphics.position.x <= - dataStorage.size.width / 4) {
            itemBackground.graphics.position.x += 3 / 2 * dataStorage.size.width;
        } else if (itemBackground.graphics.position.x >= dataStorage.size.width * 5 / 4) {
            itemBackground.graphics.position.x -= 3 / 2 * dataStorage.size.width;
        } else if (itemBackground.graphics.position.y <= - dataStorage.size.height / 4) {
            itemBackground.graphics.position.y += 3 / 2 * dataStorage.size.height;
        } else if (itemBackground.graphics.position.y >= dataStorage.size.height * 5 / 4) {
            itemBackground.graphics.position.y -= 3 / 2 * dataStorage.size.height;
        }
    }

    getRandomImage(level) {
        var randomIndexImage = Math.floor(Math.random() * (collectionOfImages[level].count - 1) + 1);
        let baseCatalog = "/";
        return baseCatalog + collectionOfImages[level].prefix + randomIndexImage + ".png";
    }

    deleteParticles(level, quantity) {
    	var j = this.collectionOfLevels[level].length;
    	var particlesToDelete = quantity;
    	while (j-- && particlesToDelete) {
    		var itemBackground = this.collectionOfLevels[level][j];
    		if ((itemBackground.graphics.position.x <= - dataStorage.size.width / 4)
                || (itemBackground.graphics.position.x >= dataStorage.size.width * 5 / 4)
                || (itemBackground.graphics.position.y <= - dataStorage.size.height / 4)
                || (itemBackground.graphics.position.y >= dataStorage.size.height * 5 / 4)) {
                this.deleteNode(level, j);
            	--particlesToDelete;
            }
    	}
    }

    getRandomPositionInside() {
    	let minX = - dataStorage.size.width / 4;
    	let minY = - dataStorage.size.height / 4;
        let maxX = dataStorage.size.width * 5 / 4; 
        let maxY = dataStorage.size.height * 5 / 4;
    	return {
                x: Math.floor(Math.random() * (maxX - minX)) + minX,
                y: Math.floor(Math.random() * (maxY - minY)) + minY
            };
}

    getRandomPositionOutside() {
    	var randomPosition = {};
    	let vertical = Math.random() > 0.5;

    	if (vertical) {
    		randomPosition.x = dataStorage.middle.x - dataStorage.size.width 
    			* 9 / 16 * (Math.random() > 0.5 ? 1 : -1);

    		randomPosition.y = Math.random() * dataStorage.middle.y + 
    			(Math.random() > 0.5 ? 1 : -1) * dataStorage.backgroundSize.height * 0.5;
    	} else {
    		randomPosition.y = dataStorage.middle.y - dataStorage.size.height 
    			* 9 / 16 * (Math.random() > 0.5 ? 1 : -1);

    		randomPosition.x = Math.random() * dataStorage.middle.x + 
    			(Math.random() > 0.5 ? 1 : -1) * dataStorage.backgroundSize.width * 0.5;
    	}
    	return randomPosition;
    }

    addParticles(level, quantity, getRandomPosition) {
    	for (var j = 0; j < quantity; ++j) {
    		this.collectionOfLevels[level].push(new BackgroundItem(
            	getRandomPosition(), this.getRandomImage(level), this.coefForMovie[level], this.coefForSize[level], this.container));
    	}
    }

    checkBackGroundElementQuantity(getRandomPosition) {
    	for (var i = 0; i < this.collectionOfLevels.length; i++) {
            if (this.collectionOfLevels[i].length > dataStorage.densityOfLevel[i]) {
            	this.deleteParticles(i, this.collectionOfLevels[i].length - dataStorage.densityOfLevel[i]);
            } else if (this.collectionOfLevels[i].length < dataStorage.densityOfLevel[i]) {
            	this.addParticles(i, dataStorage.densityOfLevel[i] - this.collectionOfLevels[i].length, getRandomPosition);
            }
        }
    }

    zoomGame(deltaCoefScale) {
        for (var i = 0; i < this.collectionOfLevels.length; i++) {
            for (var j = 0; j < this.collectionOfLevels[i].length; j++) {
                this.collectionOfLevels[i][j].graphics.scale.set(dataStorage.coefficient * this.collectionOfLevels[i][j].coefForSize);
                this.collectionOfLevels[i][j].graphics.position.set(((this.collectionOfLevels[i][j].graphics.position.x - dataStorage.middle.x) /
                    (deltaCoefScale + dataStorage.coefficient)) * dataStorage.coefficient +
                    dataStorage.middle.x,
                    (this.collectionOfLevels[i][j].graphics.position.y - dataStorage.middle.y) /
                    (deltaCoefScale + dataStorage.coefficient) * dataStorage.coefficient +
                    dataStorage.middle.y);
            }
        }
    }

    deleteNode(layerIndex, itemIndex) {
        if (itemIndex < 0) return;
        this.collectionOfLevels[layerIndex][itemIndex].graphics.destroy();
        this.collectionOfLevels[layerIndex].splice(itemIndex, 1);
    }

    clear() {
    	for (var i = 0; i < this.collectionOfLevels.length; i++) {
            for (var j = 0; j < this.collectionOfLevels[i].length; j++) {
                this.collectionOfLevels[i][j].graphics.destroy();
            }
        }
    }
}

class RendererPIXI {

    constructor(onLoadCallback) {
        this.app = new PIXI.Application(window.innerWidth, window.innerHeight,
            {backgroundColor : 0x000000, transparent: true,
            view: document.getElementById('pixiCanvas')});

        this.preloadImages(onLoadCallback);
    }

    setUp() {
        document.body.appendChild(this.app.view);
    }

    preloadImages(onLoad) {
        let baseCatalog = "/";

        for (let i = 0; i < BackGroundItemCollection.collectionOfImages.length; i++) {
            for (let j = 1; j <= BackGroundItemCollection.collectionOfImages[i].count; j++) {
                PIXI.loader.add(baseCatalog + BackGroundItemCollection.collectionOfImages[i].prefix + j + ".png");
            }
        }
        PIXI.loader.load((loader, res) => {
            onLoad(loader, res);
            this.setUp();
        });
    }
}

var RendererCanvas = function(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    var self = this;
    window.addEventListener('resize', function() {
        self.canvas.width = window.innerWidth;
        self.canvas.height = window.innerHeight;
    });
};

RendererCanvas.prototype = {
    setLineWidth: function(lineWidth) {
        this.ctx.lineWidth = lineWidth;
    },

    setStrokeColor: function(color) {
        this.ctx.strokeStyle = color;
    },

    setFillStyle: function(color) {
        this.ctx.fillStyle = color;
    },

    drawBorderPart: function(x, y, width, height, angle) {
        this.ctx.beginPath();
        this.ctx.save();

        this.ctx.translate(x, y);
        this.ctx.rotate(angle);

        this.ctx.rect(width*0.04, -height / 2, width / 2, height);

        this.ctx.stroke();
        this.ctx.restore();
    },

    drawCircle: function(x, y, radius) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, 2 * Math.PI);
        this.ctx.stroke();
        this.ctx.fill();
    },

    drawCircle2Colors: function(x, y, radius, color1, color2, angle) {
        this.ctx.beginPath();
        this.ctx.strokeStyle = color1;
        this.ctx.arc(x, y, radius, - Math.PI / 2, angle - Math.PI / 2);
        this.ctx.stroke();
        this.ctx.closePath();
        this.ctx.strokeStyle = color2;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, angle - Math.PI / 2, 2 * Math.PI - Math.PI / 2);
        this.ctx.stroke();
        this.ctx.closePath();
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, 2 * Math.PI);
        this.ctx.fill();
        this.ctx.closePath();
    },

    printText: function(x, y, font, text) {
        this.ctx.font = font;
        this.ctx.fillText(text, x, y);
    },

    drawLine: function(posA, posB) {
        this.ctx.beginPath();
        this.ctx.moveTo(posA.x, posA.y);
        this.ctx.lineTo(posB.x, posB.y);
        this.ctx.stroke();
    },

    clearScreen: function() {
        this.ctx.clearRect(0, 0, dataStorage.size.width, dataStorage.size.height);
    }
};

class BackgroundItem {

    static get MAX_VELOCITY() {
        return 0.7;
    }
    static get MAX_RAD_VELOCITY() {
        return 0.01;
    }
    static get COEF_STEP() {
        return 0.3;
    }

    constructor(position, imageName, coefForMove, coefForSize, parent) {
        let maxVelocity = BackgroundItem.MAX_VELOCITY * coefForMove;
        let minVelocity = BackgroundItem.MAX_VELOCITY * (coefForMove - BackgroundItem.COEF_STEP);
        this.velocity = {
            //не округляется потому, что скорости слишком малы < 1
            x: (Math.random() * (maxVelocity - minVelocity) + minVelocity) * (Math.random() > 0.5 ? 1: -1),
            y: (Math.random() * (maxVelocity - minVelocity) + minVelocity) * (Math.random() > 0.5 ? 1: -1)
        };
        let angle = Math.random() * (2 * BackgroundItem.MAX_RAD_VELOCITY) -
            BackgroundItem.MAX_RAD_VELOCITY * coefForMove;
        this.radVelocity = (Math.random() * (2 * BackgroundItem.MAX_RAD_VELOCITY) -
            BackgroundItem.MAX_RAD_VELOCITY) * coefForMove;

        this.graphics = new PIXI.Sprite.fromImage(imageName);
        this.graphics.rotation = angle;
        this.graphics.position.set(position.x, position.y);
        this.coefForSize = coefForSize;
        this.graphics.scale.set(dataStorage.coefficient * coefForSize);

        parent.addChild(this.graphics);
    }

    selfMovie() {
        this.graphics.position.x += dataStorage.coefficient * this.velocity.x;
        this.graphics.position.y += dataStorage.coefficient * this.velocity.y;
        this.graphics.rotation += dataStorage.coefficient * this.radVelocity;
    }
    playerMovie(deltaPlayerPosition) {
        this.graphics.position.x -= dataStorage.coefficient * deltaPlayerPosition.x;
        this.graphics.position.y -= dataStorage.coefficient * deltaPlayerPosition.y;
    }
    ceilPos() {
        this.graphics.position.x = this.graphics.position.x << 0;
        this.graphics.position.y = this.graphics.position.y << 0;
    }
    tick(deltaPlayerPosition) {
        this.selfMovie();
        this.playerMovie(deltaPlayerPosition);
        //this.ceilPos();
    }
}
    
var dataStorage = (function() {
    var coefficient,
        targetCoefficient = coefficient = 0.2,
        inputData = {},
        send = false,
        outputData = { "mouseX": 0, "mouseY": 0},
        leaderBoard = {},
        mainPlayer = null,

        size = { width: window.innerWidth,
                    height: window.innerHeight},
    middle = { x: size.width / 2, y: size.height / 2},
    longDimension = size.height > size.width ?
                        size.height : size.width,
    brickSize = { width: 0.1464 * longDimension * coefficient,
                        height: 0.1464 * longDimension * 5 * coefficient,
                        lineWidth: 0.00293 * longDimension * coefficient},

    bondWidth = 0.00366 * longDimension * coefficient,
    bondOffset = 0.008 * longDimension * coefficient,

    elementInformation = {
        "N": { radius: 0.0227 * longDimension * coefficient,
                lineWidth: 0 },
        "F": { radius: 0.0264 * longDimension * coefficient,
            lineWidth: 0 },
        "Ne": { radius: 0.0139 * longDimension * coefficient,
            lineWidth: 0 },
        "O": { radius: 0.0220 * longDimension * coefficient,
            lineWidth: 0 },
        "B": { radius: 0.0359 * longDimension * coefficient,
            lineWidth: 0 },
        "Be": { radius: 0.0410 * longDimension * coefficient,
            lineWidth: 0 },
        "Li": { radius: 0.0527 * longDimension * coefficient,
            lineWidth: 0 },
        "He": { radius: 0.0132 * longDimension * coefficient,
            lineWidth: 0 },
        "C": { radius: 0.0293 * longDimension * coefficient,
            lineWidth: 0 },
        "H": { radius: 0.0190 * longDimension * coefficient,
            lineWidth: 0 },
        "p": { radius: 0.0073 * longDimension * coefficient,
            lineWidth: 0 },
        "n": { radius: 0.0073 * longDimension * coefficient,
            lineWidth: 0 },
        "ph": { radius: 0.0073 * longDimension * coefficient,
            lineWidth: 0 }
    },

    densityOfLevels = [500000, 300000, 150000, 120000];

    for (var key in elementInformation) {
        elementInformation[key].lineWidth = 0.00659 * longDimension /
            elementInformation["C"].radius * elementInformation[key].radius * coefficient;
    }

    window.addEventListener('resize', function() {
        size = { width: window.innerWidth,
            height: window.innerHeight };
        middle = { x: size.width / 2, y: size.height / 2 };

        var oldLongDimension = longDimension;

        longDimension = size.height > size.width ?
                        size.height : size.width;
        for (var key in elementInformation) {
            elementInformation[key].radius *= longDimension / oldLongDimension;
            elementInformation[key].lineWidth *= longDimension / oldLongDimension;
        }

        brickSize.width *= longDimension / oldLongDimension;
        brickSize.height *= longDimension / oldLongDimension;
        brickSize.lineWidth *= longDimension / oldLongDimension;

        bondWidth *= longDimension / oldLongDimension;

        bondOffset *= longDimension / oldLongDimension;


    });

    return {
        updateInput: function(data) {
            if ('players' in data) inputData = data;
        },

        updateOutput: function(mouseX, mouseY) {
            outputData.mouseX = mouseX;
            outputData.mouseY = mouseY;
        },

        updateDataScale: function(oldCoefficient) {
            for (var key in elementInformation) {
                elementInformation[key].radius *= coefficient / oldCoefficient;
                elementInformation[key].lineWidth *= coefficient / oldCoefficient;
            }

            brickSize.width *= coefficient / oldCoefficient;
            brickSize.height *= coefficient / oldCoefficient;
            brickSize.lineWidth *= coefficient / oldCoefficient;

            bondWidth *= coefficient / oldCoefficient;

            bondOffset *= coefficient / oldCoefficient;
        },

        setBrickSize: function (width, height) {
            brickSize = { width: width / 1366 * longDimension * coefficient,
                height: height / 1366 * longDimension * coefficient,
                lineWidth: 0.00293 * longDimension * coefficient};
        },

        setMainPlayer: function(player) {
            mainPlayer = player;
        },

        doSend: function() {
            send = true;
        },

        dontSend: function() {
            send = false;
        },

        sendData: function() {
            return send;
        },

        get backgroundSize() {
        	return {width: size.width * 1.5,
        		height: size.height * 1.5};
        },

        get densityOfLevel() {
        	let square = dataStorage.backgroundSize.width * 
        		dataStorage.backgroundSize.height / 
        		dataStorage.coefficient / dataStorage.coefficient;

        	var densities = [];
        	for (var i = 0; i < densityOfLevels.length; ++i) {
        		densities.push(Math.round(square / densityOfLevels[i]));
        	}
        	return densities;
        },

        get bondWidth() {
            return bondWidth;
        },

        get bondOffset() {
            return bondOffset;
        },

        get mainPlayerPosition() {
            if (mainPlayer)
                return mainPlayer.position;
        },

        get outputData() {
            return outputData;
        },
        
        get coefficient() {
            return coefficient;
        },

        get size() {
            return size;
        },

        get middle() {
            return middle;
        },

        get brickSize() {
            return brickSize;
        },

        get elementInformation() {
            return elementInformation;
        },

        setTargetCoefficient: function(newCoefficient) {
            targetCoefficient = (newCoefficient).toFixed(2);
        },

        updateCurrentCoefficient: function() {
            if (targetCoefficient < coefficient) {
                var oldCoefficient = coefficient;
                coefficient -= 0.01;
                this.updateDataScale(oldCoefficient);

            }
            if (targetCoefficient > coefficient) {
                var oldCoefficient = coefficient;
                coefficient += 0.01;
                this.updateDataScale(oldCoefficient);
            }
        },

        scale: function(position) {
            return { x: (position.x - middle.x) * coefficient
                    / 1366 * longDimension
                + middle.x << 0, y: (position.y - middle.y)
                * coefficient / 1366 * longDimension + middle.y << 0
            }
        }
    }
})();

var GameWebSocket = function(WS_URL) {
    console.log(WS_URL);
    this.socket = new WebSocket(WS_URL);
    this.gamemechanicsActions = {};

    var self = this;
    this.socket.addEventListener('message', function(event) {
        var data = JSON.parse(event.data);
        //console.log(data);
        dataStorage.updateInput(data);
        self.processData(data);
    });

    this.socket.addEventListener('open', function() {

        var resolution = {
            "x": dataStorage.size.width,
            "y": dataStorage.size.height
        };
        self.send(resolution);

        window.addEventListener('resize', function() {
            var resolution = {
                "x": window.innerWidth,
                "y": window.innerHeight
            };
            self.send(resolution);
        });

        console.log("Connected.");
    });

    this.socket.addEventListener('close', function() {
        console.log("Connection closed");
        //alert("Connection closed");
    });

    this.socket.addEventListener('error', function(error) {
        console.log("Connection error " + error.message);
        //alert("Connection error");
    });
};

GameWebSocket.prototype = {
    send: function (data) {
        try {
            this.socket.send(JSON.stringify(data));
        } catch (e) {
            //do nothing
        }
    },

    addGamemechanicsCallBack: function (key, callback) {
        if (this.gamemechanicsActions[key])
            throw new Error('One callback for one message ' +
                            'before we move to socket io');
        this.gamemechanicsActions[key] = callback;
    },

    processData: function (dataFromServer) {
        for (var key in this.gamemechanicsActions) {
            if (key in dataFromServer) {
                this.gamemechanicsActions[key](dataFromServer);
                break;
            }
        }
    }
};

var Player = function(color, element, angle, position) {
    this.color = color;
    this.element = element;
    this.angle = angle;
    this.position = position;
    this.indicatorAngle = 0;
    this.isInProgress = false;
    this.step = Math.PI * 2 / 60 / 4.4;
};

Player.prototype = {

    startIndicator: function() {
        this.isInProgress = true;
        this.indicatorAngle = 2 * Math.PI;
    },

    getIndicatorAngle: function() {
        if (this.isInProgress) {
            if (this.indicatorAngle <= 0) {
                this.isInProgress = false;
                this.indicatorAngle = 0;
            } else {
                return this.indicatorAngle -= this.step;
            }
        } else {
            return this.indicatorAngle;
        }
    }
};

var Garbage = function(position, element, color) {
    this.type = 'garbage';
    this.color = color;
    this.position = {};
    this.setPosition(position);
    this.element = element;
};

Garbage.prototype = {
    getPosition: function() {
        return { x: this.position.x, y: this.position.y };
    },
    getColor: function() {
        return this.color
    },
    setPosition: function(position) {
        this.position.x = position.x;
        this.position.y = position.y;
    }
};

var Noch = function(WS_URL, renderingTool) {

    this.callbacks = {};
    this.started = false;
    this.players = {};
    this.border = [];
    this.bonds = [];
    this.garbageAll = {};
    this.renderingTool = renderingTool;
    this.renderingToolPixi = rendererPixi.app;
    this.wsUrl = WS_URL;
    this.addSocket();
    this.letterSizeCoefficient = 1.5;
    this.name = null;
    this.color = null;
};

Noch.prototype = {

    addSocket: function() {
        this.gameSocket = new GameWebSocket(this.wsUrl);
        this.configureSocket();
    },

    removeSocket: function() {
        this.gameSocket = null;
    },

    addCallback: function(key, callback) {
        this.callbacks[key] = callback;
    },

    removeCallback: function(key) {
        delete this.callbacks[key];
    },

    rotateCS: function (pos, angle) {
        var newPos = {};
        newPos.x = Math.ceil(pos.x * Math.cos(angle) +
                    pos.y * Math.sin(angle));
        newPos.y = Math.ceil(-pos.x * Math.sin(angle) +
                    pos.y * Math.cos(angle));
        return newPos;
    },

    drawGarbage: function() {

        for (var key in this.garbageAll) {

            var element = this.garbageAll[key].element;
            var radius = dataStorage.elementInformation[element].radius;
            this.renderingTool.setLineWidth(
                dataStorage.elementInformation[element].lineWidth);

            var length = (element.split('')).length;
            var fontSize = radius * this.letterSizeCoefficient / Math.sqrt(length);

            var pos = dataStorage.scale(this.toPlayerCS(this.garbageAll[key].position));

            this.drawElement(pos.x, pos.y, radius, this.garbageAll[key].color);
            this.drawLetter(pos.x, pos.y, fontSize, /*key*/element, radius, length);
            this.drawLetter(pos.x, pos.y, fontSize, /*key*/element, radius, length);
        }
    },

    drawPlayers: function() {
        for (var key in this.players) {
            this.renderingTool.setLineWidth(
                dataStorage.elementInformation[this.players[key].element].lineWidth);
            var length = (this.players[key].element.split('')).length;
            var radius = dataStorage.elementInformation[this.players[key].element].radius;
            var fontSize = radius * this.letterSizeCoefficient / Math.sqrt(length);
            var pos = dataStorage.scale(this.toPlayerCS(this.players[key].position));

            this.drawPlayer(pos.x, pos.y, radius, this.players[key].color, this.players[key].getIndicatorAngle());
            //this.drawElement(pos.x, pos.y, radius, this.players[key].color, this.players[key].element);
            this.drawLetter(pos.x, pos.y, fontSize, /*key*/this.players[key].element, radius, length);
            //this.indicatorProton.draw (pos.x, pos.y,
            // radiuses[players[key].element], ctx);
            //this.drawIndicatorNeutron(pos.x, pos.y, radius, this.players[key].color, key, ctx);
        }
    },

    drawBorder: function() {
        var brickSize = dataStorage.brickSize;
        this.renderingTool.setLineWidth(brickSize.lineWidth);
        this.renderingTool.setStrokeColor('white');

        for (var i = 0; i < this.border.length; ++i) {
            var pos = dataStorage.scale(this.toPlayerCS(this.border[i].position));
            this.renderingTool.drawBorderPart(
                pos.x, pos.y, brickSize.width, brickSize.height, this.border[i].angle);
        }
    },

    drawBondLine: function(bondLength, CSpos, angle, bondOffset) {
        var pos1 = {x:0,        y:bondOffset};
        var pos2 = {x:bondLength, y:bondOffset};

        pos1 = this.rotateCS(pos1, -angle);
        pos2 = this.rotateCS(pos2, -angle);
        pos1.x += CSpos.x;
        pos1.y += CSpos.y;
        pos2.x += CSpos.x;
        pos2.y += CSpos.y;

        this.renderingTool.drawLine(pos1, pos2);
    },

    drawBonds: function() {
        this.renderingTool.setLineWidth(dataStorage.bondWidth);
        this.renderingTool.setStrokeColor('white');

        var i = this.bonds.length;
        var objA, objB;

        while (i--) {
            objA = null;
            objB = null;

            if (this.players[this.bonds[i].idA]) {
                objA = this.toPlayerCS(this.players[this.bonds[i].idA].position);
            } else if (this.garbageAll[this.bonds[i].idA]) {
                objA = this.toPlayerCS(this.garbageAll[this.bonds[i].idA].getPosition());
            }
            if (this.players[this.bonds[i].idB]) {
                objB = this.toPlayerCS(this.players[this.bonds[i].idB].position);
            } else if (this.garbageAll[this.bonds[i].idB]) {
                objB = this.toPlayerCS(this.garbageAll[this.bonds[i].idB].getPosition());
            }

            if (objA && objB) {
                var pos1 = dataStorage.scale(objA);
                var pos2 = dataStorage.scale(objB);

                if (this.bonds[i].type == 2 || this.bonds[i].type == 3) {

                    var localPos = {};
                    localPos.x = pos2.x - pos1.x;
                    localPos.y = pos2.y - pos1.y;

                    var angle = Math.atan(localPos.y / localPos.x);

                    if (localPos.x < 0) {
                        angle += Math.PI;
                    } else if (localPos.x > 0 && localPos.y < 0) {
                        angle += 2 * Math.PI;
                    }

                    var length =
                        Math.sqrt(Math.pow(localPos.x, 2) + Math.pow(localPos.y, 2))

                    this.drawBondLine(length, pos1, angle, dataStorage.bondOffset);
                    this.drawBondLine(length, pos1, angle, -dataStorage.bondOffset);
                }

                if (this.bonds[i].type == 1 || this.bonds[i].type == 3) {
                    this.renderingTool.drawLine(pos1, pos2);
                }
            } else {
                //console.log('bond failed ' + this.bonds[i]);
                this.bonds.splice(i, 1);
            }
        }
    },

    drawElement: function(x, y, radius, color) {
        this.renderingTool.setFillStyle('#0b0b0b');
        this.renderingTool.setStrokeColor(color);
        this.renderingTool.drawCircle(x, y, radius);
    },

    drawPlayer: function(x, y, radius, color, angle) {
        this.renderingTool.setFillStyle('black');
        this.renderingTool.drawCircle2Colors(x, y, radius, "grey", color, angle);
    },

    drawLetter: function(x, y, fontSize, letter, radius, length) {
        this.renderingTool.setFillStyle('white');

        var xReducer = 5,
            yReducer = 6;

        var font = fontSize + "px Archive";
        x = x - radius / 2 - (length - 1) * radius / xReducer;
        y = y + radius / 2 + - (length - 1) * radius / yReducer;

        this.renderingTool.printText(x, y, font, letter);
    },

    onMouseMove: function(event) {
        dataStorage.updateOutput(event.clientX, event.clientY);
    },

    onMouseDown: function() {
        dataStorage.doSend();
    },

    onMouseUp: function() {
        dataStorage.dontSend();
    },

    addMainPlayer: function(name, color) {
        //this.mainPlayer = null;
        this.gameSocket.send({
            "startGame": true,
            "color": color,
            "name": name
        });

        this.name = name;
        this.color = color;

        document.addEventListener('mousemove', this.onMouseMove);
        var self = this;

        //help
        if (!self.help){
            function start_help(){
                setCookie("help", "already", {
                    expires: 316*24*12
                });
                self.help =  new GameHelp();
                self.helper = 'fly';
                self.help.fly("ru",250);
                self.fly_anim = new CircleAnimation(fly_help,115);
                self.fly_anim.start();
            }
            if (!getCookie('help')){
                setTimeout(start_help,2000);
            }
        }
        ////
        document.addEventListener('mousedown', function() {
            dataStorage.doSend();
            if (self.helper == 'fly') {
                self.helper = 'shoot';
                self.fly_anim.stop();
                self.help.changeHelp(function() { self.help.shoot("ru",250); });
                self.shoot_anim = new CircleAnimation(shoot_help,30);
                self.shoot_anim.start();
                // circle_animation(shoot_help,115);
            }
        });

        document.addEventListener('mousedown', this.onMouseDown);

        document.addEventListener('mouseup', this.onMouseUp);

        document.addEventListener('touchstart', function() {
            dataStorage.doSend();
        });
        document.addEventListener('touchend', function() {
            dataStorage.doSend();
        });
        document.addEventListener('keydown', function(event) {
            if (event.keyCode == 32) {
                self.shoot(event, "ph");
                if (self.helper == 'shoot'){
                    self.helper = 'dontDie';
                    self.shoot_anim.stop();
                    self.help.changeHelp(function() { self.help.dontDie("ru",250); });
                    self.dontDie_anim = new CircleAnimation(dontDie_help,30);
                    self.dontDie_anim.start();
                    setTimeout(function() {self.dontDie_anim.stop(); self.help.hideHelp();},5000);
                }
            }
            /*if (event.keyCode == 78) {
                self.shoot(event, "n");
            }*/
        });
    },

    gameOver: function() {
        //TODO: remove player on gameover
        
        dataStorage.dontSend();
        this.removeSocket();

        document.removeEventListener('mousemove', this.onMouseMove);

        document.removeEventListener('mousedown', this.onMouseDown);

        document.removeEventListener('mouseup', this.onMouseUp);

        var self = this;
        var restart = function() {
            delete self.players[self.mainPlayer.sid];
            self.addSocket();

            self.players = {};
            self.border = [];
            self.bonds = [];
            self.garbageAll = {};

            var waiting = setInterval(function() {
                if (self.gameSocket.socket.readyState === WebSocket.OPEN) {
                    self.addMainPlayer(self.name, self.color);
                    document.removeEventListener('keydown', restart);
                    $("#last_for_close_dead_window").hide(500);
                    clearInterval(waiting);
                }
            }, 200);

        };
        setTimeout(function() {
            document.body.addEventListener('keydown', restart);
        }, 2000);
    },

    shoot: function(event, particle) {
        event.preventDefault();
        if (this.gameSocket) {
            var shot = {
                "shotX": dataStorage.outputData.mouseX,
                "shotY": dataStorage.outputData.mouseY,
                "particle": particle
            };
            this.gameSocket.send(shot);
        }
    },

    toPlayerCS: function(position) {
        return { x: position.x - this.mainPlayer.position.x +
            dataStorage.middle.x,
            y: position.y - this.mainPlayer.position.y +
            dataStorage.middle.y };
    },

    configureSocket: function() {
        var self = this;

        this.gameSocket.addGamemechanicsCallBack('coefficient', function(newData) {
            dataStorage.setTargetCoefficient(newData.coefficient);
        });

        this.gameSocket.addGamemechanicsCallBack('sid', function(newData) {
            self.mainPlayer = new Player(newData.c, newData.e, 2 * Math.PI, dataStorage.mainPlayerPosition);
            dataStorage.setMainPlayer(self.mainPlayer);
            self.mainPlayer.sid = newData.sid;
            self.players[newData.sid] = self.mainPlayer;
        });

        this.gameSocket.addGamemechanicsCallBack('bp', function(newData) {
            if (self.garbageAll[newData.bp]) {
                self.garbageAll[newData.bp].color = 'white';
            }
        });
        this.gameSocket.addGamemechanicsCallBack('bg', function(newData) {
            if (self.garbageAll[newData.bg]) {
                self.garbageAll[newData.bg].color = newData.c;
            }
        });

        this.gameSocket.addGamemechanicsCallBack('sp', function(newData) {
            dataStorage.setBrickSize(newData.bh, newData.bl);
            self.mainPlayer = { position: {x: newData.sp.x, y: newData.sp.y } };
            dataStorage.setMainPlayer({ position: {x: newData.sp.x, y: newData.sp.y } });
            if (self.background)
            	self.background.clear();
            self.background = new BackGround(self.renderingToolPixi);
            //requestAnimationFrame(self.background.tick.bind(self.background));
        });

        this.gameSocket.addGamemechanicsCallBack('np', function(newData) {
            self.players[newData.np] = new Player(newData.c, newData.e, 2 * Math.PI, newData.p);
        });

        this.gameSocket.addGamemechanicsCallBack('ne', function(newData) {
            self.players[newData.id].element = newData.ne;
        });

        this.gameSocket.addGamemechanicsCallBack('dp', function(newData) {
            if (newData.dp != self.mainPlayer.sid) {
                console.log('player died ' + newData.dp);
                delete self.players[newData.dp];
            }

        });

        this.gameSocket.addGamemechanicsCallBack('dead', function(newData) {
            //alert("you're dead lol");
            simple_animation(death_pic,70);
            self.gameOver();
        });

        this.gameSocket.addGamemechanicsCallBack('che', function(newData) {
            var object = self.garbageAll[newData.che] ? self.garbageAll[newData.che] : self.players[newData.che];
            if (object) {
                object.element = newData.e;
            }
        });

        this.gameSocket.addGamemechanicsCallBack('ng', function(newData) {
            self.garbageAll[newData.ng] = new Garbage(newData.p, newData.e, newData.av);
        });

        this.gameSocket.addGamemechanicsCallBack('shph', function(newData) {
            if (self.players[newData.shph]) {
                self.players[newData.shph].startIndicator();
            }
        });

        this.gameSocket.addGamemechanicsCallBack('sb', function(newData) {
            reload_table(newData.sb);
        });

        this.gameSocket.addGamemechanicsCallBack('nb', function(newData) {
            self.border.push({ position: newData.p, angle: newData.a });
        });

        this.gameSocket.addGamemechanicsCallBack('gbav', function(newData) {
            if(self.garbageAll[newData.gbav] && self.garbageAll[newData.gbav].color != 'white') {
                self.garbageAll[newData.gbav].color = 'green';
            }
        });

        this.gameSocket.addGamemechanicsCallBack('gbnav', function(newData) {
            if(self.garbageAll[newData.gbnav] && self.garbageAll[newData.gbnav].color != 'white') {
                self.garbageAll[newData.gbnav].color = 'grey';
            }
        });

        this.gameSocket.addGamemechanicsCallBack('dg', function(newData) {
            delete self.garbageAll[newData.dg];
        });

        this.gameSocket.addGamemechanicsCallBack('b1', function(newData) {
            if (self.bonds.indexOf({ idA: newData.b1, idB: newData.b2 }) == -1) {
                self.bonds.push({ idA: newData.b1, idB: newData.b2, type: parseInt(newData.t) });
            }
        });

        this.gameSocket.addGamemechanicsCallBack('db1', function(newData) {

            var i = self.bonds.length;

            while (i--) {
                if (self.bonds[i].idA == newData.db1 && self.bonds[i].idB == newData.db2) {
                    self.bonds.splice(i, 1);
                }
            }
        });

        this.gameSocket.addGamemechanicsCallBack('gba', function(newData) {
            if (newData.players && newData.players.length) {
                for (var i = 0; i < newData.players.length; i += 3) {
                    //if(!self.players[newData.players[i]]) console.log(newData.players[i]);
                    self.players[newData.players[i]].position.x = newData.players[i + 1];
                    self.players[newData.players[i]].position.y = newData.players[i + 2];
                }
            }

            for (var i = 0; i < newData.gba.length; i += 3) {
                if (self.garbageAll[newData.gba[i]]) {
                    self.garbageAll[newData.gba[i]].setPosition({ x: newData.gba[i + 1], y: newData.gba[i + 2]});
                } else {
                    //console.log("garbage probably hasn't arrived yet");
                    //console.log(newData.gba[i]);
                    //console.log(self.garbageAll);
                }
            }
        });
    },

    update: function() {
        if (dataStorage.sendData() && this.gameSocket) {
            this.gameSocket.send(dataStorage.outputData);
        }
        dataStorage.updateCurrentCoefficient();
        dataStorage.updateCurrentCoefficient();
    },

    draw: function() {
        this.renderingTool.clearScreen();
        this.drawBonds();
        this.drawGarbage();
        this.drawPlayers();
        this.drawBorder();
    },

    run: function() {

        if (this.background) {
            this.background.tick();
        }
        this.update();
        this.draw();
        for (var key in this.callbacks) {
            this.callbacks[key]();
        }

        requestAnimationFrame(this.run.bind(this));
    }
};

/*
=======================================================================
Start of the game
=======================================================================
*/

hideOverlay();

var Game;

let start = ()=> {
    var renderer = new RendererCanvas('canvas');

    let url = 'http://' + location.hostname + ':' + location.port + '/api/ports';
    $.get(url, function (port) {

        if (port !== -1) {
            hideOverlay();
            Game = new Noch('ws://' + location.hostname + ':' + port, renderer);
            Game.run();
        } else {
            alert('All servers are full');
        }
    });
};

let rendererPixi = new RendererPIXI(start);