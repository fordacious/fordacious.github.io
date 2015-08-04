define(function(require){

    var THREE = require("threejs");

    var ThreeDScene = function(){};

    ThreeDScene.prototype.initialize = function(){
        this.object3D = new THREE.Scene();

        Object.defineProperty(this, "scene", {
            get: function () {
                return this.object3D;
            }
        });
    };

    ThreeDScene.prototype.add = function(obj){
        if(!obj){ return; }
        this.object3D.add(obj);
    };

    ThreeDScene.prototype.remove = function(obj){
        if(!obj){ return; }
        this.object3D.remove(obj);
    };

    ThreeDScene.prototype.clearScene = function(){
        this.object3D = new THREE.Scene();
    };

    return ThreeDScene;
});