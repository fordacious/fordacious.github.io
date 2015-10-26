
var startTime = 6000;

var badMessages = [
	'heart attack',
	'stroke',
	'diabetes',
	'alzheimers',
	'dementia',
	'senility',
	'falling over',
	'cancer',
	'too much sex',
	'sodium',
	'thrombosis',
	'gang violence',
	'overworking',
	'improper of sleep',
	'sedentarity',
	'depression',
	'loss of purpose'
];
var goodMessages = [
	'exercise',
	'heart medication',
	'brain medication',
	'blood pressure pills',
	'a new hip',
	'dialysis',
	'a new kidney',
	'hydrotherapy',
	'hypnotherapy'
];

var debuglog = false;

var canvas; //Will be linked to the canvas in our index.html page
var stage; //Is the equivalent of stage in AS3 and we'll add "children" to it

var stageWidth = 720;
var stageHeight = 720;

var groundWidth = 720;

var mouse = {x:0,y:0};
var keys = {};
for (var i = 0; i < 255; i ++) {
	keys[i] = false;
}

var LEFT_KEY = 37;
var RIGHT_KEY = 39;

var mainGameObjects = [];
var bg;
var title;
var player;
var ground;
var startB;
var title;
var TitleView = new Container();
var projectiles = [];

var groundElevation = 0;
var elevationStep = 30;

var tkr = new Object;

var currentInterlude = null;

//preloader
var preloader;
var manifest;
var totalLoaded = 0;

var gravity = 0.2;
var maxVelocity = 15;
var playerMoveSpeed = 4;

var rockChair = (function () {

	// base stat in degrees for now
	var LEAN_ACCEL = 0.005;
	var LEAN_LIMIT = 30;
	var LEAN_OVERLEAN = 10;
    
    var LEAN = 4;
    var OVERLEAN = 0.5;
    var MAX_ANGLE = 16;
    var MAX_OVERLEAN = 21;
    var SPEED = 11;
    var FRICTION = 0.1;
    
    var RIGHT_COMPENSATION = MAX_OVERLEAN / 7;

/*
    from ms paint lol
    head hitbox at 58,19 radius 18
    body hitbox at 54,62 radius 32
    leg hitbox at 86,100 radius 22
    also then have to adjust for rotating 
    
    the image itself is 127x137
*/
    // the following treats origen as getting 3-0'd by SKT T1 (@ 127/2 x 137)
    var ORIGIN_X = 127/2;
    var ORIGIN_Y = 137;
    var HEAD_X = 58 - ORIGIN_X;
    var HEAD_Y = 19 - ORIGIN_Y;
    var CHEST_X = 54 - ORIGIN_X;
    var CHEST_Y = 62 - ORIGIN_Y;
    var LEG_X = 86 - ORIGIN_X;
    var LEG_Y = 100 - ORIGIN_Y;
    // math: since middle bottom is x and y of player origin
    // we already use above vars for relative coordinates, just do rotation transform

	function RockChairSystem () {
        
        function toRad(deg) { return deg / 180 * Math.PI; }
		
        // changing stats
		this.lean = 0;
        this.overlean = 0;
		this.velocity = 0;
        
        // this.head,chest,leg needs to adjust for each new lean
        this.HEAD_RADIUS = 25;
        this.CHEST_RADIUS = 38;
        this.LEG_RADIUS = 26;
        this.head = new Object();
        this.chest = new Object();
        this.leg = new Object();

		this.update = function () {
            if(keys[LEFT_KEY]){
                if(-this.lean < MAX_ANGLE){
                    this.lean -= LEAN;
                } else if(-this.lean < MAX_OVERLEAN){
                    this.lean -= OVERLEAN;
                    this.overlean -= OVERLEAN;
                }
                if(this.overlean > 0){
                    if(debuglog){
                        console.log("sliding!");
                    }
                    this.velocity = -this.overlean * SPEED;
                    this.overlean += this.overlean * - 0.01;
                }
                if(this.lean < 0){
                    this.overlean += this.overlean * - 0.3;
                }
            }
            if(keys[RIGHT_KEY]){
                if(this.lean < MAX_ANGLE - RIGHT_COMPENSATION){
                    this.lean += LEAN;
                } else if(this.lean < MAX_OVERLEAN){
                    this.lean += OVERLEAN;
                    this.overlean += OVERLEAN;
                }
                if(this.overlean < 0){
                    if(debuglog){
                        console.log("sliding!");
                    }
                    this.velocity = -this.overlean * SPEED;
                    this.overlean += this.overlean * - 0.01;
                }
                if(this.overlean > 0){
                    this.overlean += this.overlean * - 0.3;
                }
            }
            this.lean += this.lean * - 0.01;
            if (this.velocity > 0){
                this.velocity -= FRICTION;
            }
            if (this.velocity < 0){
                this.velocity += FRICTION;
            }
            
            var angle = toRad(this.lean);
            var sine = Math.sin(angle);
            var cosine = Math.cos(angle);
            this.head.x = player.x + (HEAD_X * cosine + HEAD_Y * -sine);
            this.head.y = player.y + (HEAD_X * sine + HEAD_Y * cosine); 
            this.chest.x = player.x + (CHEST_X * cosine + CHEST_Y * -sine);
            this.chest.y = player.y + (CHEST_X * sine + CHEST_Y * cosine); 
            this.leg.x = player.x + (LEG_X * cosine + LEG_Y * -sine);
            this.leg.y = player.y + (LEG_X * sine + LEG_Y * cosine); 
            
			//velocity += -this.lean * LEAN_ACCEL;
			//this.lean += velocity;
		}
        

		this.getLeftLeanSpeed = function () {
			return velocity < 0 ? -velocity / 2 : velocity / 4;
		}
		this.getRightLeanSpeed = function () {
			return velocity > 0 ? velocity / 2 : -velocity / 4;
		}
		this.getHeightLeanFactor = function () {
			return Math.abs(Math.sin(this.lean / 180 * Math.PI));
		}
	}

	return new RockChairSystem();
})();

function Projectile (isGood, isDangerous) {
    this.vx = 0;
    this.vy = 0;
    this.isGood = isGood;
    this.isDangerous = isDangerous;
    this.destroyed = false;
    this.displayObject = null;
}

function spawnProjectile (text, isGood, x, y, vx, vy) {
    var proj = new Projectile(isGood);
    proj.vx = vx || 0;
    proj.vy = vy || 0;
    var projGraphics = new Container();
    projGraphics.x = x || 0;
    projGraphics.y = y || 0;
    proj.displayObject = projGraphics;
    var circle;
    var textShape;
    if (text && isGood) {
        textShape = new Text(text, 'bold 20px Arial', "DeepSkyBlue");
        projGraphics.addChild(textShape);
    } else if (text && !isGood) {
        textShape = new Text(text, 'bold 20px Arial', "DarkRed");
        projGraphics.addChild(textShape);
    }
    proj.isDangerous = text !== "";

    if (!proj.isDangerous) {
    	if (isGood) {
    		circle = new Shape();
            circle.graphics.beginFill("DeepSkyBlue").drawCircle(0, 0, Math.random() * 4);
	        projGraphics.addChild(circle);
	    } else if (!isGood) {
	    	circle = new Shape();
            circle.graphics.beginFill("DarkRed").drawCircle(0, 0, Math.random() * 4);
	        projGraphics.addChild(circle);
	    }	
    }

    if (textShape) {
    	textShape.x = -textShape.getMeasuredWidth()/2; 
		textShape.y = textShape.getMeasuredLineHeight()/4;
	}

    projectiles.push(proj);
    stage.addChild(projGraphics);
    return proj;
}

function cleanProjectiles () {
	var toDestroy = projectiles.filter(function (projectile) { return projectile.destroyed; });
    toDestroy.map(function (projectile) { stage.removeChild(projectile.displayObject) });
    projectiles = projectiles.filter(function (projectile) { return !projectile.destroyed; });
}


// assuming this is for colliding with player now exclusively
function projectileColliding (projectile) {
	// detect for head chest AND leg (all of them circles)
    if(dist(rockChair.head, projectile.displayObject) < rockChair.HEAD_RADIUS){
        if(debuglog){
            console.log("hit head");
        }
        return true;
    }
    if(dist(rockChair.chest, projectile.displayObject) < rockChair.CHEST_RADIUS){
        if(debuglog){
            console.log("hit chest");
        }
        return true;
    }
    if(dist(rockChair.leg, projectile.displayObject) < rockChair.LEG_RADIUS){
        if(debuglog){
            console.log("hit leg");
        }
        return true;
    }
    return false;
}

// dont really need
function drawHitbox(){
    
}

function Main() {
    /* Link Canvas */

    canvas = document.getElementById('DeathRockStage');
    stage = new Stage(canvas);
        
    stage.mouseEventsEnabled = true;

    manifest = [
                {src:"sky.png", id:"bg"},
                {src:"title.png", id:"title"},
                {src:"startB.png", id:"startB"},
                {src:"player.png", id:"player"},
                {src:"ground.png", id:"ground"}
            ];


    createjs.Sound.alternateExtensions = ["mp3"];

    createjs.Sound.registerSound("music.mp3", "bgmusic");
    createjs.Sound.addEventListener("fileload", function () {
    	handleLoadComplete();
    });

    preloader = new PreloadJS();
    preloader.onFileLoad = handleFileLoad;
    preloader.loadManifest(manifest);

    /* Ticker */
    
    Ticker.setFPS(60);
    Ticker.addListener(stage);
}

function handleFileLoad(event) {
    switch(event.type)
    {
        case PreloadJS.IMAGE:
        //image loaded
         var img = new Image();
         img.src = event.src;
         img.onload = handleLoadComplete;
         window[event.id] = new Bitmap(img);
        break;
    }
}

 function handleLoadComplete(event) 
 {

    totalLoaded++;
    
    if(manifest.length+1==totalLoaded)
    {
        addTitleView();
    }
 }


// Add Title View Function

function addTitleView() {
    startB.x = 360 - 31.5;
    startB.y = 415;
    startB.name = 'startB';
    
    title.x = 360 - 139.5;
    title.y = 200;
    
    TitleView.addChild(title, startB);
    stage.addChild(bg, TitleView);
    stage.update();
    
    // Button Listeners
    startB.onPress = addGameView;
}

// Add Game View

function addGameView() {
    // Destroy Menu
    
    stage.removeChild(TitleView);
    TitleView = null;
    
    // Add Game View
    
    player = new Container();

    var img = new Bitmap('player.png');
    img.x = -img.image.width / 2;
    img.y = -img.image.height;
    player.addChild(img);
    player.x = stageWidth / 2;
    player.y = stageHeight;

    stage.addChild(player);

    ground = new Container();
    var img = new Bitmap('ground.png');
    img.x = 0;
    img.y = -2;
    ground.addChild(img);
    ground.x = 0;
    ground.y = stageHeight;
    stage.addChild(ground);
    
    // Score
    stage.update();
    
    // Start Listener 
    
    //bg.onPress = startGame;
    startGame();
}

// Start Game Function
function startGame(e) {

	createjs.Sound.play("bgmusic", {loop:9999999999999});

    bg.onPress = null;
    stage.onMouseMove = onMouseMove;
    window.document.onkeydown = onKeyDown;
    window.document.onkeyup = onKeyUp;

    time = 0;
    
    Ticker.addListener(tkr, false);
    tkr.tick = update;
}

// Player Movement

function onMouseMove(e) {
    mouse.x = e.stageX;
    mouse.y = e.stageY;
}

function onKeyDown (e) {
	keys[e.keyCode] = true;
}

function onKeyUp (e) {
	keys[e.keyCode] = false;
}

/* Reset */

function reset()
{
    player.x = stage.width / 2;
    
    stage.onMouseMove = null;
    Ticker.removeListener(tkr);
    bg.onPress = startGame;
}

// Update Function
function dist(a,b) { return Math.sqrt(Math.pow(a.x-b.x, 2) + Math.pow(a.y - b.y, 2));}

var time = 0;
function update(timeStep) {

	// ground redraw graphics based on width and height and elevation
    ground.y += ((stageHeight - groundElevation) - ground.y) / 4;

    var targetGroundX = 0 + (stageWidth - groundWidth) / 2;
    var targetGroundWidth = groundWidth / stageWidth;
    ground.x += (targetGroundX - ground.x) / 4;
    ground.scaleX += (targetGroundWidth - ground.scaleX) / 4;

	if (groundElevation >= stageHeight - 100) {
		groundWidth = stageWidth;
		groundElevation = stageHeight;
		player.y = ground.y;
    	createjs.Sound.stop("bgmusic");
    	projectiles.map(function (p) {p.destroyed = true;});
    	cleanProjectiles();
    	return;
    }

	// if we're in an interlude, update that instead
	if (currentInterlude !== null) {
		currentInterlude.update(stage);
		return;
	}
    
    // for every projectile handle and resolve collision
	for (var i = 0; i < projectiles.length; i++) {
		if (projectiles[i].isDangerous && projectileColliding(projectiles[i])) {
			groundElevation += projectiles[i].isGood ? -elevationStep / 2 : elevationStep;
			projectiles[i].destroyed = true;
			cleanProjectiles();
			if (Math.random() > 0.5) {
				//groundWidth -= 5;
				//groundWidth = Math.max(groundWidth, 200);
			}
			if (Math.random() > 0.95) {
				return switchToInterlude(interludes[Math.floor(Math.random() * interludes.length)]);
			}
		}
	}

	rockChair.update();

    groundElevation = Math.max(0, groundElevation);

    player.x += rockChair.velocity;

    if (player.x > ground.x + groundWidth) {
    	player.x = ground.x + groundWidth;
    	rockChair.velocity *= -0.4;
    } else if (player.x < ground.x) {
    	player.x = ground.x;
    	rockChair.velocity *= -0.4;
    }
    
    // constrain player to ground
    player.y = ground.y + rockChair.getHeightLeanFactor() * -10;
    
    // rotate player
    player.rotation = rockChair.lean;

    // update projectiles
    projectiles.map(updateProjectile);

    // clean projectiles
    cleanProjectiles();

    time += timeStep;
    if (time > startTime && Math.random() < 0.05) {
    	var message;
    	var isGood = Math.random() > 0.8;
    	if (isGood) {
    		message = goodMessages[Math.floor(Math.random() * goodMessages.length)];
    	} else {
    		message = badMessages[Math.floor(Math.random() * badMessages.length)];
    	}
    	spawnProjectile(message, isGood, Math.random() * stageWidth, -10, Math.random() * 4 - 2, Math.random() * 2);
    }
}

function updateProjectile (projectile) {
	projectile.vy += gravity;
	projectile.vy = Math.min(maxVelocity, projectile.vy);
	projectile.displayObject.x += projectile.vx;
	projectile.displayObject.y += projectile.vy;
    
	if (projectile.isDangerous) {
		if (projectile.displayObject.y > ground.y && projectile.displayObject.x > ground.x && projectile.displayObject.x < ground.x + groundWidth) {
			for (var i = 0 ; i < 5; i ++) {
				spawnProjectile("", projectile.isGood, projectile.displayObject.x + Math.random() * 10 - 5, projectile.displayObject.y + Math.random() * 4 - 2, Math.random() * 6 - 3, Math.random() * 6 - 3);
			}
			projectile.destroyed = true;
		}
	}

	// collide ground
	if (projectile.displayObject.y > stageHeight + 20) {
		projectile.destroyed = true;
	}
}

function switchToInterlude (InterludeClass) {

	// remove player and all projectiles
	mainGameObjects = [player, ground].concat(projectiles.map(function(projectile){ return projectile.displayObject; }));
	mainGameObjects.forEach(function (displayObject) {
		stage.removeChild(displayObject);
	});

	currentInterlude = new InterludeClass();
	currentInterlude.add(stage);
}

function returnFromInterlude () {
	mainGameObjects.forEach(function (displayObject) {
		stage.addChild(displayObject);
	})
	currentInterlude = null;
}
