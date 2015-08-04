define(function(require){

    var THREE = require('threejs');

    var WebGLRenderer = function(){
        this.options = {};
        this.width = 100;
        this.height = 100;
        this.parent = null;
        this.scenes = null;
        this.camera = null;
        this.depthOfFieldEnabled = true;
    };

    WebGLRenderer.prototype.start = function(){
        if(!this.scenes){ throw new Error('WebGLRenderer must be given scene'); }
        if(!this.camera){ throw new Error('WebGLRenderer must be given a camera'); }
        if(!this.parent){ throw new Error('WebGLRenderer must be given a parent'); }

        this.renderer = new THREE.WebGLRenderer(this.options);
        this.renderer.setSize(this.width, this.height);
        this.renderer.autoClear = false;
        
        this.parent.$el.append(this.renderer.domElement);
    };

    WebGLRenderer.prototype.update = function(){
        this.renderer.clear();
        this.renderer.render(this.scenes[0].scene, this.camera.camera);
    };

    return WebGLRenderer;
});