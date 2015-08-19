define(function(require){

    var THREE = require('../threejsExtensions/CanvasRenderer');

    var CanvasRenderer = function(){
        this.options = {};
        this.width = 100;
        this.height = 100;
        this.parent = null;
        this.scenes = null;
        this.camera = null;
    };

    CanvasRenderer.prototype.start = function(){
        if(!this.scenes){ throw new Error('CanvasRenderer must be given scenes'); }
        if(!this.camera){ throw new Error('CanvasRenderer must be given a camera'); }
        if(!this.parent){ throw new Error('CanvasRenderer must be given a parent'); }

        this.renderer = new THREE.CanvasRenderer(this.options);
        this.renderer.setSize(this.width, this.height);
        this.renderer.autoClear = false;

        this.parent.$el.append(this.renderer.domElement);
    };

    CanvasRenderer.prototype.update = function(){
        this.renderer.clear();
        for (var i = 0 ; i < this.scenes.length; i ++) {
            this.renderer.render(this.scenes[i].object3D, this.camera.camera);
        }
    };

    return CanvasRenderer;
});