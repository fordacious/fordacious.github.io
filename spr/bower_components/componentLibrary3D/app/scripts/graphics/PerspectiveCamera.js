define(function(require){
    var THREE = require('threejs');
    var ThreeDTransformObject = require('../utils/ThreeDTransformObject');

    var PerspectiveCamera = function(){
        this.fov = 45;
        this.aspectRatio = 1;
        this.near = 1;
        this.far = 1000;

        ThreeDTransformObject.initialize3DAccessors(this, "camera");
    };

    PerspectiveCamera.prototype.initialize = function(){
        this.camera = new THREE.PerspectiveCamera(this.fov, this.aspectRatio, this.near, this.far);

        this.camera.position.x = this.position.x;
        this.camera.position.y = this.position.y;
        this.camera.position.z = this.position.z;
    };

    return PerspectiveCamera;
});