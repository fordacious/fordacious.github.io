define(function(require){
    'use strict';
    var $ = require('jquery');
    var _ = require('underscore');
    
    var bootloaderTemplate = '<div id ="<%=id%>"><canvas width="920" height="320"></canvas> </div>';

    var PreloadDraw = function(){
        this.preloader = null;
        this.preloadImageName = "";
        this.started = false;
        this.drawingElementId = "bootLoader";

        this.fillSpeed = 100;
    };

    PreloadDraw.prototype.start = function(){
        checkDependencies.call(this);

        this.targetProgress = 0;
        this.currentProgress = 0;
        this.initialProgress = 0;
        this.completed = false;
        this.$bootLoader = this.renderer ? this.renderer.$el : $('#' + this.drawingElementId);
        this.$bootLoader = this.$bootLoader.length ? this.$bootLoader : createBootLoader.call(this);
        this.canvas = this.$bootLoader.find('canvas')[0];

        getInitial.call(this);

        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.center = {'x': this.width >> 1, 'y': this.height >> 1 };
        this.ctx = this.canvas.getContext('2d');
    };

    PreloadDraw.prototype.update = function(time){
        if(this.targetProgress === this.currentProgress){ return; }

        var fillProgress = this.fillSpeed * time.elapsed / 1000;

        this.currentProgress = Math.min(this.targetProgress, this.currentProgress + fillProgress);

        this.render();

        if(this.currentProgress === 100){ triggerComplete.call(this); }
    };

    PreloadDraw.prototype.render = function(){
        if(!this.preloadImage) {
            this.preloadImage = this.preloader._images[this.preloadImageName].data;
        }

        var progress = this.currentProgress / 100;

        var imageX = this.center.x - (125 >> 1);
        var imageY = this.center.y - 19;
        var dotX = 125 * progress;
        var dotY = getYPosition(dotX);

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.drawImage(this.preloadImage, 0 , 0, 125, 38, imageX, imageY, 125, 38);
        this.ctx.drawImage(this.preloadImage, 0 , 38, 125 * progress, 38, imageX, imageY, dotX, 38);

        this.ctx.beginPath();
        this.ctx.arc(imageX + dotX + 2, imageY + 38 - dotY - 2, 4, 0, 2 * Math.PI);
        this.ctx.fill();

        this.ctx.font = "24px Arial";
        this.ctx.fillStyle = "#10a78a";
        this.ctx.globalAlpha = 1;
        this.ctx.textAlign = 'center';
        this.ctx.fillText('LOADING', this.center.x, this.center.y + 70);
        this.ctx.font = "14px Arial";
        this.ctx.fillText(Math.round(progress * 100) + '%', imageX + dotX - 2, imageY + 38 - dotY - 10);
    };

    PreloadDraw.prototype.setTargetProgress = function(progress){
        progress = Math.min(100, progress);
        var remainingProgress = 100 - this.initialProgress;
        this.targetProgress = this.initialProgress + remainingProgress * progress / 100;
    };

    PreloadDraw.prototype.destroy = function(){
        this.$bootLoader.remove();
    };

    var checkDependencies = function() {
        if(!this.drawingElementId && !this.renderer) { throw new Error("Either renderer or drawingElementId is required"); }
        if(!this.preloader) { throw new Error("The preloader must be provided."); }
        if(!this.preloadImageName) { throw new Error("The name of the preloading image must be provided."); }
    };

    var getInitial = function(){
        this.targetProgress = parseInt(this.$bootLoader.attr('data-max'), 10) || 0;
        this.currentProgress = parseInt(this.$bootLoader.attr('data-progress'), 10) || 0;
        this.initialProgress = this.targetProgress;
        this.$bootLoader.attr('data-owner', 'component');
    };

    var triggerComplete = function(){
        $(this).trigger('completed');
        this.completed = true;
    };

    var getYPosition = function(x){
        if(x < 20){
            return 13 / 20 * x;
        }
        else if(x < 40){
            return -1 / 4 * x + 18;
        }
        else if(x < 60){
            return 7 / 20 * x - 6;
        }
        else if(x < 80){
            return 2 / 5 * x - 9;
        }
        else if(x < 100){
            return 1 / 2 * x - 17;
        }
        else{
            return -17 / 20 * x + 118;
        }
    };

    var createBootLoader = function(){
        var bootLoader = $(_.template(bootloaderTemplate)({
            id: this.drawingElementId
        }));

        $('body').append(bootLoader);

        return bootLoader;
    };

    return PreloadDraw;
});