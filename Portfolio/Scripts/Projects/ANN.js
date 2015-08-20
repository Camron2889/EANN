var stage;
var cWidth; var cHeight; //canvas width and height
var timer; //setInterval reference
var frameLength = 10; //tick duration in milliseconds

var cRadius = 15; //default creature radius
var cSpeed = 2; //creature speed in pixels per tick

var population = []; //contains Creature instances
var populationSize = 15;
var generation = 0; //current generation

var food = []; //contains Food instances
var fAmount = 30; //amount of food kept on the canvas
var fRadius = 8; //default food radius

var inputNodes = 2; var hiddenNodes = 2; var outputNodes = 1; //default neural network parameters

var ga = {

};

var cls = { //pseuso-classes
    Creature: function (g) {
        this.genes = g;
        this.collected = 0;
        this.radius = cRadius;
        this.speed = cSpeed; //in case I want to give it control of its speed
        this.x = 0;
        this.y = 0;
        this.rotation = 0; //in radians; ANNinput = cr.rotation / (2 * Math.PI); pseudobinary = radians / (2 * pi)
        this.cdv = 0; //clockwise acceleration
        this.closestDistance = 0;
        this.closestAngle = 0;
        this.sprite;
    },
    Food: function () {
        this.x = Math.floor(Math.random() * cWidth);
        this.y = Math.floor(Math.random() * cHeight);
        this.sprite;
    },
    ANN: function () {
        this.inputs = [];
        for (var i = 0; i < inputNodes; i++) {
            inputs[i] = 0;
        };
        this.hiddenNodes = [];
        for (var i = 0; i < hiddenNodes; i++) {
            hiddenNodes[i] = 0;
            for (var i1 = 0; i1 < inputNodes; i1++) {
                inputs[i][i1] = 1; //weights
            }
        }
        this.outputs = [];
        for (var i = 0; i < outputNodes; i++) {
            hiddenNodes[i] = 0;
        }
    }
};

var physics = {
    moveCreature: function (cr) {
        var x = (Math.sin(cr.rotation) / Math.sin((Math.PI * 180) / 360)) / cr.speed;
        var y = (Math.sin(((Math.PI * 180) / 360) - cr.rotation) / Math.sin((Math.PI * 180) / 360)) / cr.speed;
        cr.x += x;
        cr.y += y;
        var rad = cr.radius;
        if (cr.x - rad > cWidth) {
            cr.x -= cWidth + (rad * 2);
        } else if (cr.x + rad < 0) {
            cr.x += cWidth + (rad * 2);
        }
        if (cr.y - rad > cHeight) {
            cr.y -= cHeight + (rad * 2);
        } else if (cr.y + rad < 0) {
            cr.y += cHeight + (rad * 2);
        }
    },
    onTick: function () {
        for (var i = 0; i < population.length; i++) {
            physics.moveCreature(population[i]);
            var x = population[i].x;
            var y = population[i].y;
            var x1; var y1; var mag;
            for (var i1 = 0; i1 < food.length; i1++) { //check for overlaps between creatures and food
                x1 = food[i1].x;
                y1 = food[i1].y;
                mag = Math.sqrt(((x - x1) * (x - x1)) + ((y - y1) * (y - y1)));
                if (mag <= population[i].radius + fRadius) {
                    stage.removeChild(food[i1].sprite); //handle overlaps
                    var newFood = new cls.Food();
                    food.splice(i1, 1, newFood);
                    display.initFood(newFood);
                    population[i].collected++;
                }
            }
        }
    }
};

var display = {
    initCreature: function (cr) {
        var sprite = new createjs.Shape();
        sprite.graphics.beginFill("#BBB").drawCircle(0, 0, cr.radius);
        sprite.graphics.beginStroke("#DDD").setStrokeStyle(1).moveTo(0, 0).lineTo(0, cr.radius);
        stage.addChild(sprite);
        sprite.cache(-cr.radius, -cr.radius, cr.radius * 2, cr.radius * 2);
        cr.sprite = sprite;
    },
    initFood: function (f) {
        var sprite = new createjs.Shape();
        sprite.graphics.beginFill("#0EA").drawCircle(0, 0, fRadius);
        sprite.x = f.x;
        sprite.y = f.y;
        stage.addChild(sprite);
        sprite.cache(-fRadius, -fRadius, fRadius * 2, fRadius * 2);
        f.sprite = sprite;
    },
    onTick: function () {
        for (var i = 0; i < population.length; i++) {
            population[i].sprite.x = population[i].x;
            population[i].sprite.y = population[i].y;
            population[i].sprite.rotation = -((population[i].rotation * 360) / (Math.PI * 2));
        }
        stage.update();
    }
};

var spawn = { //spawns objects at start of simulations
    Food: function () {
        for (var i = food.length; i < fAmount; i++) {
            food[i] = new cls.Food();
            display.initFood(food[i]);
        }
    },
    Population: function () {
        if (generation != 0) {

        } else {
            for (var i = 0; i < populationSize; i++) {
                var cr = new cls.Creature(" ");
                cr.x = Math.floor(Math.random() * cWidth);
                cr.y = Math.floor(Math.random() * cHeight);
                cr.rotation = Math.random() * (Math.PI * 2);
                population[i] = cr;
                display.initCreature(population[i]);
            }
        }
    }
};

var time = { //runs functions on tick
    Tick: function (displayBool) { //displayBool: whether or not the simulation will be displayed
        physics.onTick();
        if (displayBool) {
            display.onTick();
        }
    }
}

var manage = { //manages the state of the simulation
    startSim: function () {
        timer = setInterval(function () { time.Tick(true) }, frameLength);
    },
    initSim: function () {
        spawn.Population();
        spawn.Food();
        manage.startSim();
    }
}

$(document).ready(function () {
    $("#CanvasI").attr("width", $(window).width()); //set canvas size
    $("#CanvasI").attr("height", $(window).height() * 2 / 3);
    cWidth = $("#CanvasI").width(); cHeight = $("#CanvasI").height();
    stage = new createjs.Stage("CanvasI");
    var bg = new createjs.Shape();
    bg.graphics.beginFill("#9EF").drawRect(0, 0, cWidth, cHeight);
    stage.addChild(bg);
    manage.initSim();
});