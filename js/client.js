/**
 * Created by fatman on 28/02/16.
 */

/*
======================================================================================
UI scripts
======================================================================================
*/

function validateInputFields(inputField) {
    if (inputField.val() == "") {
        inputField.addClass('error__div');
        return false;
    } else {
        inputField.removeClass('error__div');
        return true;
    }
}

$('#btn__go').click(function(){
    var login__input = $('#login__input');


    if (!validateInputFields(login__input)) return;
    $('#overlay').hide();
    ////////
    var color = $('#btn__go').css("background-color");
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
    Game.addMainPlayer(login__input, rgb_new);
});

/*
======================================================================================
Game and rendering logic
======================================================================================
*/

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

    drawRectangle: function(x, y, width, height, angle) {
        this.ctx.beginPath();
        this.ctx.save();

        this.ctx.translate(x, y);
        this.ctx.rotate(angle);

        this.ctx.rect(-width / 2, - height / 2, width / 2, height);

        this.ctx.stroke();
        this.ctx.restore();
    },

    drawCircle: function(x, y, radius) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, 2 * Math.PI);
        this.ctx.stroke();
        this.ctx.fill();
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

var Background = function () {
    this.collectionBackgroundItem = new CollectionBackgroundItem();
    this.prevPlayerPosition = {
        x: dataStorage.mainPlayerPosition.x,
        y: dataStorage.mainPlayerPosition.y
    };
    this.prevCoefScale = dataStorage.coefficient;
};
Background.prototype = {
    tick: function () {
        var deltaPlayerPosition = {
                x: dataStorage.mainPlayerPosition.x - this.prevPlayerPosition.x,
                y: dataStorage.mainPlayerPosition.y - this.prevPlayerPosition.y
            },
            deltaCoefScale =  this.prevCoefScale - dataStorage.coefficient;

        drawManager.clearScreen();
        this.collectionBackgroundItem.tick(deltaPlayerPosition, deltaCoefScale);
        drawManager.updateScreen();
        this.prevPlayerPosition = {
            x: dataStorage.mainPlayerPosition.x,
            y: dataStorage.mainPlayerPosition.y
        };
        this.prevCoefScale = dataStorage.coefficient;
        //requestAnimationFrame( this.tick.bind(this) );
    }
};

var CollectionBackgroundItem = function () {
    this.collectionOfLevels = [ [], [], [], [] ];
    this.densityOfLevel = [60000, 100000, 240000, 60000];
    this.coefForMovie = [0.8, 0.5, 0.2, 0.1];
    this.fillingArea(- dataStorage.size.width / 4, - dataStorage.size.height / 4,
                        dataStorage.size.width * 5 / 4, dataStorage.size.height * 5 / 4);
};
CollectionBackgroundItem.prototype = {
    //constructor: CollectionBackgroundItem,
    fillingArea: function (minX, minY, maxX, maxY) {
        var baseCatalog = "/",
            collectionOfImages = [
                {
                    prefix: "3layer/q",
                    count: 30
                }, {
                    prefix: "2layer/",
                    count: 35
                }, {
                    prefix: "1layer/",
                    count: 30
                }, {
                    prefix: "clouds/",
                    count: 29
                }
            ];
        for (var i = this.collectionOfLevels.length - 1; i >= 0; i--) {
            //потому что нужно захватить еще и не отображаемые поля
            var count = Math.floor((maxX - minX) * (maxY - minY) / (this.densityOfLevel[i] * dataStorage.coefficient)),
                oldLengthCollection = this.collectionOfLevels[i].length;

            while (this.collectionOfLevels[i].length < count + oldLengthCollection) {
                //пришлось манипулировать с единицами так, как номера картинок начинаются с 1, а не с 0
                var randomIndexImage = Math.floor(Math.random() * (collectionOfImages[i].count - 1) + 1),
                    randomImageSrc = baseCatalog + collectionOfImages[i].prefix + randomIndexImage + ".png",
                    randomPosition = {
                        x: Math.floor(Math.random() * (maxX - minX)) + minX,
                        y: Math.floor(Math.random() * (maxY - minY)) + minY
                    };
                this.collectionOfLevels[i].push(new BackgroundItem(randomPosition, randomImageSrc, this.coefForMovie[i]));
            }
        }
    },
    tick: function (deltaPlayerPosition, deltaCoefScale) {
        if (deltaCoefScale) {
            this.zoomGame(deltaCoefScale);
        }

        for (var i = 0; i < this.collectionOfLevels.length; i++) {
            for (var j = 0; j < this.collectionOfLevels[i].length; j++) {
                this.holdIfGetOut(this.collectionOfLevels[i][j]);
                if (deltaPlayerPosition) {
                    this.collectionOfLevels[i][j].tick(deltaPlayerPosition);
                }
                drawManager.drawBackgroundItem(this.collectionOfLevels[i][j]);
            }
        }
    },
    holdIfGetOut: function (itemBackground) {
        if (itemBackground.position.x <= - dataStorage.size.width / 4) {
            itemBackground.position.x += 3 / 2 * dataStorage.size.width;
        } else if (itemBackground.position.x >= dataStorage.size.width * 5 / 4) {
            itemBackground.position.x -= 3 / 2 * dataStorage.size.width;
        } else if (itemBackground.position.y <= - dataStorage.size.height / 4) {
            itemBackground.position.y += 3 / 2 * dataStorage.size.height;
        } else if (itemBackground.position.y >= dataStorage.size.height * 5 / 4) {
            itemBackground.position.y -= 3 / 2 * dataStorage.size.height;
        }
    },
    zoomGame: function (deltaCoefScale) {
        for (var i = 0; i < this.collectionOfLevels.length; i++) {
            for (var j = 0; j < this.collectionOfLevels[i].length; j++) {
                this.collectionOfLevels[i][j].position = {
                    x: ((this.collectionOfLevels[i][j].position.x - dataStorage.middle.x) /
                        (deltaCoefScale + dataStorage.coefficient)) * dataStorage.coefficient +
                        dataStorage.middle.x,
                    y: ((this.collectionOfLevels[i][j].position.y - dataStorage.middle.y) /
                        (deltaCoefScale + dataStorage.coefficient)) * dataStorage.coefficient +
                        dataStorage.middle.y
                };
            }
        }
        if (deltaCoefScale > 0) {
            //уменьшение
            var newMinX = - dataStorage.size.width / 4,
                newMinY = - dataStorage.size.height / 4,
                newMaxX = dataStorage.size.width * 5 / 4,
                newMaxY = dataStorage.size.height * 5 / 4,
                oldMinX = ((- dataStorage.size.width / 4 -
                    dataStorage.middle.x) / (deltaCoefScale + dataStorage.coefficient))
                    * dataStorage.coefficient + dataStorage.middle.x,
                oldMinY = ((- dataStorage.size.height / 4 -
                    dataStorage.middle.y) / (deltaCoefScale + dataStorage.coefficient))
                    * dataStorage.coefficient + dataStorage.middle.y,
                oldMaxX = ((dataStorage.size.width * 5 / 4 -
                    dataStorage.middle.x) / (deltaCoefScale + dataStorage.coefficient)) *
                    dataStorage.coefficient + dataStorage.middle.x,
                oldMaxY = ((dataStorage.size.height * 5 / 4 -
                    dataStorage.middle.y) / (deltaCoefScale + dataStorage.coefficient)) *
                    dataStorage.coefficient + dataStorage.middle.y;
            this.fillingArea(newMinX, oldMinY, oldMinX, oldMaxY);
            this.fillingArea(newMinX, oldMaxY, newMaxX, newMaxY);
            this.fillingArea(newMinX, newMinY, newMaxX, oldMinY);
            this.fillingArea(oldMaxX, oldMinY, newMaxX, oldMaxY);
        } else {
            //уменьшение
            for (var i = 0; i < this.collectionOfLevels.length; i++) {
                for (var j = 0; j < this.collectionOfLevels[i].length; j++) {
                    var itemBackground = this.collectionOfLevels[i][j];
                    if ((itemBackground.position.x <= - dataStorage.size.width / 4)
                        || (itemBackground.position.x >= dataStorage.size.width * 5 / 4)
                        || (itemBackground.position.y <= - dataStorage.size.height / 4)
                        || (itemBackground.position.y >= dataStorage.size.height * 5 / 4)) {
                        this.deleteNode(i, j);
                    }
                }
            }
        }
    },
    deleteNode: function (layerIndex, itemIndex) {
        if (itemIndex < 0) return;
        this.collectionOfLevels[layerIndex].splice(itemIndex, 1);
    }
};

function BackgroundItem(position, src, coefForMove) {
    var MAX_VELOCITY = 0.3,
        MAX_RAD_VELOCITY = 0.5,
        image;
    this.position = position;
    this.velocity = {
        //не округляется потому, что скорости слишком малы < 1
        x: Math.random() * (2 * MAX_VELOCITY) - MAX_VELOCITY,
        y: Math.random() * (2 * MAX_VELOCITY) - MAX_VELOCITY
    };
    this.angle = Math.random() * (2 * MAX_RAD_VELOCITY) - MAX_RAD_VELOCITY;
    this.radVelocity = Math.random() * (2 * MAX_RAD_VELOCITY) - MAX_RAD_VELOCITY;
    this.coefForMove = coefForMove;
    this.src = src;
}
BackgroundItem.prototype = {
    constructor: BackgroundItem,
    selfMovie: function () {
        this.position.x += this.coefForMove * dataStorage.coefficient * this.velocity.x;
        this.position.y += this.coefForMove * dataStorage.coefficient * this.velocity.y;
        this.angle += this.coefForMove * dataStorage.coefficient * this.radVelocity;
    },
    playerMovie: function (deltaPlayerPosition) {
        this.position.x -= this.coefForMove * dataStorage.coefficient * deltaPlayerPosition.x;
        this.position.y -= this.coefForMove * dataStorage.coefficient * deltaPlayerPosition.y;
    },
    ceilPos: function() {
        this.position.x = this.position.x << 0;
        this.position.y = this.position.y << 0;
    },
    tick: function (deltaPlayerPosition) {
        this.selfMovie();
        this.playerMovie(deltaPlayerPosition);
        //this.ceilPos();
    }
};

function DrawManager(idObjectForDrawing) {
    this.stage = new createjs.Stage( document.getElementById(idObjectForDrawing) );
    this.queue = new createjs.LoadQueue();
    this.queue.installPlugin(createjs.Bitmap);
    this.queue.on("complete", this.handleComplete, this);
    this.preloaderFlag = true;
}
DrawManager.prototype = {
    constructor: DrawManager,
    handleComplete: function () {
        this.preloaderFlag = true;
    },
    runPreloader: function () {
        this.preloaderFlag = false;
        //TODO не соответстветствует DRY
        var baseCatalog = "/",
            collectionOfImages = [
                {
                    prefix: "3layer/q",
                    count: 30
                }, {
                    prefix: "2layer/",
                    count: 35
                }, {
                    prefix: "1layer/",
                    count: 30
                }, {
                    prefix: "clouds/",
                    count: 29
                }
            ];
        for (var i = 0; i < collectionOfImages.length; i++) {
            for (var j = 1; j <= collectionOfImages[i].count; j++) {
                this.queue.loadFile({
                    id:  baseCatalog + collectionOfImages[i].prefix + j + ".png",
                    src:  baseCatalog + collectionOfImages[i].prefix + j + ".png"
                });
            }
        }

    },
    drawBackgroundItem: function (itemBackground) {
        if (!this.preloaderFlag) return;
        var positionOnCanvas = {
                x: itemBackground.position.x,
                y: itemBackground.position.y
            },
            bitmap,
            image;

        //если объект не виден на экране не рисуем его
        if (!this.isVisible(positionOnCanvas)) return;

        image = this.queue.getResult(itemBackground.src);
        bitmap = new createjs.Bitmap(image);
        bitmap.x = positionOnCanvas.x;
        bitmap.y = positionOnCanvas.y;
        bitmap.rotation = itemBackground.angle;
        bitmap.scaleX = dataStorage.coefficient;
        bitmap.scaleY = dataStorage.coefficient;
        this.stage.addChild(bitmap);
    },
    isVisible: function (positionOnCanvas) {
        //TODO разобраться с оптимизацией, не получлось вернуть размер картинки, а то рисуются все картинки даже которые не попадают в канвас
        /*
         //за правой или нижней границей
         if (((positionOnCanvas.x - this.bitmap.width) >= dataStorage.size.width) || ((positionOnCanvas.y - this.bitmap.height) >= dataStorage.size.height)) {
         return false;
         }
         //за верхней или левой границей
         if (((positionOnCanvas.x + this.bitmap.width) <= 0) || ((positionOnCanvas.y + this.bitmap.height) <= 0)) {
         return false;
         }
         */
        return true;
    },
    clearScreen: function () {
        this.stage.removeAllChildren();
    },
    updateScreen: function () {
        this.stage.update();
    }
};
    
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
            lineWidth: 0 }
    };


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

        get bondWidth() {
            return bondWidth;
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
        alert("Connection closed");
    });

    this.socket.addEventListener('error', function(error) {
        console.log("Connection error " + error.message);
        alert("Connection error");
    });
};

GameWebSocket.prototype = {
    send: function (data) {
        this.socket.send(JSON.stringify(data));
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
    this.gameSocket = new GameWebSocket(WS_URL);
    this.configureSocket();
    this.renderingTool = renderingTool;

    this.letterSizeCoefficient = 1.5;
};

Noch.prototype = {

    addCallback: function(key, callback) {
        this.callbacks[key] = callback;
    },

    removeCallback: function(key) {
        delete this.callbacks[key];
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
            this.drawLetter(pos.x, pos.y, fontSize, element, radius, length);
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

            this.drawElement(pos.x, pos.y, radius, this.players[key].color, this.players[key].element);
            this.drawLetter(pos.x, pos.y, fontSize, this.players[key].element, radius, length);
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
            this.renderingTool.drawRectangle(
                pos.x, pos.y, brickSize.width, brickSize.height, this.border[i].angle);
        }
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

                this.renderingTool.drawLine(pos1, pos2);
            } else {
                this.bonds.splice(i, 1);
                console.log('bond failed ' + this.bonds[i]);
            }
        }
    },

    drawElement: function(x, y, radius, color) {
        this.renderingTool.setFillStyle('black');
        this.renderingTool.setStrokeColor(color);
        this.renderingTool.drawCircle(x, y, radius);
    },

    drawLetter: function(x, y, fontSize, letter, radius, length) {
        this.renderingTool.setFillStyle('white');

        var xReducer = 5,
            yReducer = 6;

        var font = "bold " + fontSize + "px tellural_altbold";
        x = x - radius / 2 - (length - 1) * radius / xReducer;
        y = y + radius / 2 + - (length - 1) * radius / yReducer;

        this.renderingTool.printText(x, y, font, letter);
    },

    addMainPlayer: function(name, color) {
        //this.mainPlayer = null;
        this.gameSocket.send({
            "startGame": true,
            "color": color,
            "name": name
        });

        document.addEventListener('mousemove', function(event) {
            dataStorage.updateOutput(event.clientX, event.clientY);
        });

        document.addEventListener('mousedown', function() {
            dataStorage.doSend();
        });

        document.addEventListener('mouseup', function() {
            dataStorage.dontSend();
        });

        var self = this;
        document.addEventListener('keydown', function(event) {
            if (event.keyCode == 32) {
                self.shoot(event, "p");
            }
            if (event.keyCode == 78) {
                self.shoot(event, "n");
            }
        });
    },

    removeMainPlayer: function() {
        //TODO: remove player on gameover
    },

    shoot: function(event, particle) {
        event.preventDefault();
        var shot = {
            "shotX": dataStorage.outputData.mouseX,
            "shotY": dataStorage.outputData.mouseY,
            "particle": particle
        };
        this.gameSocket.send(shot);
    },

    toPlayerCS: function(position) {
        return { x: position.x - this.mainPlayer.position.x +
            dataStorage.middle.x,
            y: position.y - this.mainPlayer.position.y +
            dataStorage.middle.y };
    },

    configureSocket: function() {
        var self = this;

        this.gameSocket.addGamemechanicsCallBack('players', function(newData) {
            for (var i = 0; i < newData.players.length; i += 3) {
                if(!self.players[newData.players[i]]) console.log(newData.players[i]);
                self.players[newData.players[i]].position.x = newData.players[i + 1];
                self.players[newData.players[i]].position.y = newData.players[i + 2];
            }
        });

        this.gameSocket.addGamemechanicsCallBack('coefficient', function(newData) {
            dataStorage.setTargetCoefficient(newData.coefficient);
        });

        this.gameSocket.addGamemechanicsCallBack('sid', function(newData) {
            self.mainPlayer = new Player(newData.c, newData.e, 2 * Math.PI, dataStorage.mainPlayerPosition);
            dataStorage.setMainPlayer(self.mainPlayer);
            self.players[newData.sid] = self.mainPlayer;
        });

        this.gameSocket.addGamemechanicsCallBack('bp', function(newData) {
            self.garbageAll[newData.bp].color = 'white';
        });

        this.gameSocket.addGamemechanicsCallBack('bg', function(newData) {
            self.garbageAll[newData.bg].color = newData.c;
        });

        this.gameSocket.addGamemechanicsCallBack('sp', function(newData) {
            self.mainPlayer = { position: {x: newData.sp.x, y: newData.sp.y } };
            dataStorage.setMainPlayer({ position: {x: newData.sp.x, y: newData.sp.y } });
            self.background = new Background();
            //requestAnimationFrame(self.background.tick.bind(self.background));
        });

        this.gameSocket.addGamemechanicsCallBack('np', function(newData) {
            self.players[newData.np] = new Player(newData.c, newData.e, 2 * Math.PI, newData.p);
        });

        this.gameSocket.addGamemechanicsCallBack('ne', function(newData) {
            self.players[newData.id].element = newData.ne;
        });

        this.gameSocket.addGamemechanicsCallBack('dp', function(newData) {
            console.log('player died ' + newData.dp);
            delete self.players[newData.dp];
        });

        this.gameSocket.addGamemechanicsCallBack('dead', function(newData) {
            alert("you're dead lol");
        });

        this.gameSocket.addGamemechanicsCallBack('che', function(newData) {
            var object = self.garbageAll[newData.che] ? self.garbageAll[newData.che] : players[newData.che];
            object.element = newData.e;
        });

        this.gameSocket.addGamemechanicsCallBack('ng', function(newData) {
            self.garbageAll[newData.ng] = new Garbage(newData.p, newData.e, newData.av);
        });

        this.gameSocket.addGamemechanicsCallBack('nb', function(newData) {
            self.border.push({ position: newData.p, angle: newData.a });
        });

        this.gameSocket.addGamemechanicsCallBack('gbav', function(newData) {
            if(self.garbageAll[newData.gbav].color != 'white') {
                self.garbageAll[newData.gbav].color = 'green';
            }
        });

        this.gameSocket.addGamemechanicsCallBack('gbnav', function(newData) {
            if(self.garbageAll[newData.gbnav].color != 'white') {
                self.garbageAll[newData.gbnav].color = 'grey';
            }
        });

        this.gameSocket.addGamemechanicsCallBack('dg', function(newData) {
            delete self.garbageAll[newData.dg];
        });

        this.gameSocket.addGamemechanicsCallBack('b1', function(newData) {
            self.bonds.push({ idA: newData.b1, idB: newData.b2 });
        });

        this.gameSocket.addGamemechanicsCallBack('db1', function(newData) {
            var id = -1;
            for (var i = 0; i < self.bonds.length; ++i) {
                if (self.bonds[i].idA == newData.db1 && self.bonds[i].idB == newData.db2) {
                    id = i;
                }
            }
            if (id != -1) self.bonds.splice(id, 1);
        });

        this.gameSocket.addGamemechanicsCallBack('gba', function(newData) {
            for (var i = 0; i < newData.gba.length; i += 3) {
                if (self.garbageAll[newData.gba[i]]) {
                    self.garbageAll[newData.gba[i]].setPosition({ x: newData.gba[i + 1], y: newData.gba[i + 2]});
                } else {
                    console.log("garbage probably hasn't arrived yet");
                    console.log(newData.gba[i]);
                    console.log(self.garbageAll);
                }
            }
        });
    },

    update: function() {
        if (dataStorage.sendData()) {
            this.gameSocket.send(dataStorage.outputData);
        }
        dataStorage.updateCurrentCoefficient();
        dataStorage.updateCurrentCoefficient();
    },

    draw: function() {
        //this.renderingTool.clearScreen();
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

var drawManager = new DrawManager("canvas");
drawManager.runPreloader();
var Game = new Noch('ws://' + location.hostname + ':8085',
                    new RendererCanvas('canvas'));
Game.run();