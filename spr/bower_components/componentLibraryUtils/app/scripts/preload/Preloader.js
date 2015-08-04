/*globals Image*/
define(function(require){
    var $ = require('jquery');

    var Preloader = function(){
        this.images = {};
    };

    Preloader.prototype.initialize = function(){
        this._images = {};

        this.completed = 0;
        this.total = Object.keys(this.images).length;
        this.pctCompleted = 0;
    };

    Preloader.prototype.start = function(){
        if(this.total === 0){
            updateState.call(this);
            return;
        }

        for(var i in this.images){
            loadImage.call(this, i, this.images[i]);
        }
    };

    var loadImage = function(key, path){
        var image = new Image();
        this._images[key] = {
            path: path,
            data: image
        };

        image.onload = assetLoaded.bind(this);
        image.src = path;
    };

    var assetLoaded = function(){
        this.completed++;
        updateState.call(this);
    };

    var updateState = function(){
        this.pctCompleted = this.total === 0 ? 1 : this.completed / this.total;
        $(this).trigger('preloadProgress');

        if(this.pctCompleted === 1){
            $(this).trigger('preloadCompleted');
        }
    };

    return Preloader;
});