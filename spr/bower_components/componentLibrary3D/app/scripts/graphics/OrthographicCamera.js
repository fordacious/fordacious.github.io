define(function(require){
    var THREE = require('threejs');
    var ThreeDTransformObject = require('../utils/ThreeDTransformObject');

    var OrthographicCamera = function(){
        this.width = 1;
        this.aspectRatio = 1;
        this.near = 1;
        this.far = 1000;

        ThreeDTransformObject.initialize3DAccessors(this, "camera");
    };

    OrthographicCamera.prototype.initialize = function(){
        this.camera = new THREE.OrthographicCamera(-(this.width / 2), (this.width / 2), (this.width / 2) / this.aspectRatio, -(this.width / 2) / this.aspectRatio, this.near, this.far);

        this.camera.position.x = this.position.x;
        this.camera.position.y = this.position.y;
        this.camera.position.z = this.position.z;
    };

    return OrthographicCamera;
});