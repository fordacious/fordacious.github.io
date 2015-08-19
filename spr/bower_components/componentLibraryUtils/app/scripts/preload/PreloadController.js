define(function(require){
    var $ = require('jquery');
    var SceneManager = require('SceneManager');

    var PreloadController = function(){
        this.preloader = null;
        this.preloadDraw = null;

        this.sceneId = '';
    };

    PreloadController.prototype.start = function(){

        if(!this.preloader){ throw new Error ("preloader must be given"); }
        if(!this.sceneId){ throw new Error ("sceneId must be given"); }
        if(this.preloadDraw && !this.preloadDraw.setTargetProgress){ throw new Error('preloadDraw must implement setTargetProgress'); }

        $(this.preloader).on('preloadProgress', updateDraw.bind(this));

        if(this.preloadDraw){
            $(this.preloadDraw).on('completed', startScene.bind(this));
        }
        else{
            $(this.preloader).on('preloadCompleted', startScene.bind(this));
        }

        updateDraw.call(this);
    };

    var updateDraw = function(){
        if(this.preloadDraw) {
            this.preloadDraw.setTargetProgress(this.preloader.pctCompleted * 100);
        }
    };

    var startScene = function(){
        SceneManager.startScene(this.sceneId);
    };

    return PreloadController;
});