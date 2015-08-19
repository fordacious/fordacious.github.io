define(function(require){

    var SceneManager = require('SceneManager');

    var BaseLoader = function(LoaderClass, onLoad){
        this.path = "";
        this.models = [];
        this.loader = new LoaderClass();

        this.nextSceneId = '';

        this._onLoad = onLoad;
        this._modelsLoaded = 0;
    };

    BaseLoader.prototype.initialize = function(){
        if(!this.nextSceneId){ throw new Error('nextSceneId must be given'); }

        if(this.models.length === 0 ){ onComplete.call(this); }

        this.models.forEach(loadObject.bind(this));
    };

    function loadObject(modelObj){
        var model = modelObj.model;
        var name = modelObj.name;
        this.loader.load(this.path + model, function () {
            var args = Array.prototype.slice.call(arguments);
            args.unshift(name);
            this._onLoad.apply(this, args);
            this._modelsLoaded++;
            onComplete.call(this);
        }.bind(this));
    }

    function onComplete(){
        if(this._modelsLoaded === this.models.length){
            SceneManager.startScene(this.nextSceneId);
        }
    }

    return BaseLoader;
});