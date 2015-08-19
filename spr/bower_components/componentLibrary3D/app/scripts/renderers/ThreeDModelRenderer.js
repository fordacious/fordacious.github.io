define(function(require){

    var THREE = require('threejs');
    var MeshLibrary = require('../data/MeshLibrary');
    var $ = require('jquery');

    var ThreeDTransformObject = require('../utils/ThreeDTransformObject');

    var ThreeDModelRenderer = function(){
        this.key = null;
        this.smooth = false;
        this.parent = null;
        this.object3D = null;

        ThreeDTransformObject.initialize3DAccessors(this, "object3D");

        Object.defineProperty(this, "mesh", {
            get: function () {
                return this.object3D;
            }
        });
    };

    ThreeDModelRenderer.prototype.initialize = function(){
        if(!this.key) {
            this.object3D = new THREE.Object3D();
        }
        else{
            this.object3D = MeshLibrary.getMesh(this.key).clone();

            if(this.object3D.geometry && this.smooth){
                this.object3D.geometry.computeVertexNormals();
            }
        }

        this.object3D.position.set(this.position.x, this.position.y, this.position.z);
        this.object3D.rotation.set(this.rotation.x, this.rotation.y, this.rotation.z);
        this.object3D.scale.set(this.scale.x, this.scale.y, this.scale.z);
    };

    ThreeDModelRenderer.prototype.start = function(){
        if(!this.parent){ throw new Error('ThreeDModelRenderer must be given a parent'); }

        this.parent.add(this.object3D);
    };

    ThreeDModelRenderer.prototype.add = function(obj){
        this.object3D.add(obj);
    };

    ThreeDModelRenderer.prototype.remove = function(obj){
        this.object3D.remove(obj);
    };

    ThreeDModelRenderer.prototype.appendTo = function(parent){
        this.parent = parent;
        this.parent.add(this.object3D);
    };

    ThreeDModelRenderer.prototype.destroy = function(){
        if(this.parent){
            this.parent.remove(this.object3D);
        }
    };

    return ThreeDModelRenderer;
});