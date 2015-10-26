// SIT DOWN AND LEAN PREFERABLY ON YOUR CHAIR: DEATH ROCKIN STRAIGHT TO YOUR THEMATIC CONCLUSION OF NOT LIVING

document.onkeydown = handleKeyDown;
document.onkeyup = handleKeyUp;
var KEYCODE_LEFT = 37;      //useful keycode
var KEYCODE_RIGHT = 39;     //useful keycode

var stage, canvas, w, h, loader; 
var title, sky;

var player;
var _left = false;
var _right = false;
// degrees. createjs shapes use it
var LEAN_LIMIT = 70;
var LEAN_OVERLEAN = 20;
var FRICTION = 1;
var OVERLEAN_MODULO = 10;

function init() {
    // seein that it works
    canvas = document.getElementById("DeathRockStage");
    stage = new createjs.Stage(canvas);
    w = canvas.width;
    h = stage.canvas.height;
    
    // images
    manifest = [
        {src:"player.png", id:"player"},
        {src:"sky.png", id:"sky"},
        {src:"title.png", id:"title"}
    ];
    loader = new createjs.LoadQueue(false);
    loader.addEventListener("complete", handleComplete);
    loader.loadManifest(manifest, true, "");
    // continues below cause we wait till we load the precious kb
}
function handleComplete(){
    sky = new createjs.Shape();
    sky.graphics.beginBitmapFill(loader.getResult("sky")).drawRect(0,0,w,h);
    
    //EventDispatcher.initialize(RockChair)
    // stage.addEventListener();
    
    player = new createjs.Shape();
    player.graphics.beginBitmapFill(loader.getResult("player")).drawRect(0,0,127,137);
    player.regX = 127/2;
    player.regY = 137/2;
    player.x = canvas.width/2;
    player.y = canvas.height - 200;
    stage.addChild(sky, player);
    createjs.Ticker.setFPS(60);
    //createjs.Ticker.timingMode = createjs.Ticker.RAF;
    createjs.Ticker.addEventListener("tick", tick);
}
// frame execution, keep light
function tick(event) {
    updatePlayer();
    stage.update(event);
}

function Projectile(text){
    this.text = text;
}

// stick to object. if player, maybe also do stuff
Projectile.prototype.collide = function(actions){
    actions();
}

function handleKeyDown(e) {
    //cross browser issues exist
    if (!e) {
        var e = window.event;
    }
    switch (e.keyCode) {
        case KEYCODE_LEFT:
            _left = true;
            return false;
        case KEYCODE_RIGHT:
            _right = true;
            return false;
    }
}

function handleKeyUp(e) {
    //cross browser issues exist
    if (!e) {
        var e = window.event;
    }
    switch (e.keyCode) {
        case KEYCODE_LEFT:
            _left = false;
            break;
        case KEYCODE_RIGHT:
            _right = false;
            break;
    }
}

// for now
function updatePlayer(){
    
}








/* about the player
    
    MECHANICS
    leaning for left and right
    the chair stops leaning after a certain point (you never topple)
    the chair at max lean super quickly "overleans"
    overlean:
        overlean charge not only make the player rotate the other way,
        expelling overlean charge will make the chair slide and have dx
        this is the only way to slide
    when sliding:
        you will only slide so far based on overlean (maybe just 2 tiers of speed)
        you will stop very quickly when you lean the other way
        you do not build overlean in the opposite direction until you stop sliding
        
    it seems you wont leave the ground easily
    it should be easy to discover the overlean technique, so it should be easy to do
    on accident, even.
    
    
    how do i draw and rotate ffffffffffff
*/

/*
function RockChair(){
    /*this.START_X = stage.canvas.width / 2;
    this.START_Y = stage.canvas.height;

    this.lean = 0;    
    this.x = START_X;
    this.y = START_Y;
    this.dx = 0;
    this.dy = 0;
    this.overlean = 0;
    this.rotation = 0;
    this.spin = 0;

    // game mechanic constants
    this.LEAN_ACCEL = 6;
    this.LEAN_LIMIT = 70;
    this.LEAN_OVERLEAN = 20;
    this.FRICTION = 1;
    this.OVERLEAN_MODULO = 10;

}
RockChair.prototype.left = function(){
    if(overlean > 0){
        dx = -10;
        overlean = 0;
    }
    spin = -10;  
}
RockChair.prototype.right = function(){
    if(overlean < 0){
        dx = 10;
        overlean = 0;
    }
    spin = 10;
}
RockChair.prototype.testergh = function(){
    // grr
    var circle = new createjs.Shape();
    circle.graphics.beginFill("DeepSkyBlue").drawCircle(0, 0, 100);
    circle.x = 10;
    circle.y = 10;
    stage.addChild(circle);
    stage.update();
}
RockChair.prototype.update = function(){
    // moving
    x += dx;
    if(dx < 0){
        dx+= FRICTION;
    }
    if(dx > 0){
        dx-= FRICTION;
    }
    
    //todo keep x coordinate within canvas
    
    if (Math.abs(rotation) <= LEAN_LIMIT + LEAN_OVERLEAN){
        rotation += spin;
    }
    if (Math.abs(rotation) > LEAN_LIMIT){
        overlean += 1;
    }
    
    // currently under assumption ground is flat and never broken
    y += dy;
    if (y < groundHeight){
        y = groundHeight;
    }

    // TODO rotate hitboxes, rotate character
}
*/