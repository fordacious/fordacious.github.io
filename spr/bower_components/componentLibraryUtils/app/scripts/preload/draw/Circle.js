/*globals Image*/
define(function(require){
    'use strict';
    var $ = require('jquery');
    var _ = require('underscore');

    var bootloaderTemplate = '<div id ="<%=id%>"><canvas width="920" height="320"></canvas> </div>';

    var ORANGE_PATTERN_IMAGE = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAYAAAAGCAIAAABvrngfAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyFpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNS1jMDE0IDc5LjE1MTQ4MSwgMjAxMy8wMy8xMy0xMjowOToxNSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIChXaW5kb3dzKSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo2MDVGQUY0Qjc4RjQxMUUzQjc0RUQyRkUwRTQ3REQ1NiIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDo2MDVGQUY0Qzc4RjQxMUUzQjc0RUQyRkUwRTQ3REQ1NiI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjYwNUZBRjQ5NzhGNDExRTNCNzRFRDJGRTBFNDdERDU2IiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjYwNUZBRjRBNzhGNDExRTNCNzRFRDJGRTBFNDdERDU2Ii8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+ca3xWgAAAEVJREFUeNo8jFEOgDAMQl/rdkyv7kXUIU3j+CB5QIjrnAiCnOV6GeZI4sAy68FEmatVEdLo/bqbXbv991Y/5N7vh0+AAQCTyB5OYOkcygAAAABJRU5ErkJggg==";
    var orangePattern = new Image(), patternReady = false;
    orangePattern.src = ORANGE_PATTERN_IMAGE;
    orangePattern.onload = function() { patternReady = true; };

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
        if(!patternReady) { return; }
        var startAngle = -Math.PI / 2;

        var endAngle, radius;

        endAngle = startAngle + 2 * Math.PI * this.currentProgress / 100;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.lineWidth = 30;
        radius = 65;
        this.ctx.strokeStyle = this.ctx.createPattern( orangePattern , "repeat" );
        this.ctx.beginPath();
        this.ctx.arc( this.center.x , this.center.y , radius , startAngle , endAngle , false );
        this.ctx.stroke();

        this.ctx.lineWidth = 1;
        radius = 87;
        this.ctx.strokeStyle = "#FFFFFF";
        this.ctx.globalAlpha = 0.3;
        this.ctx.beginPath();
        this.ctx.arc( this.center.x , this.center.y , radius , 0 , 2 * Math.PI );
        this.ctx.stroke();

        this.ctx.lineWidth = 2;
        radius = 91;
        this.ctx.globalAlpha = 0.7;
        this.ctx.beginPath();
        this.ctx.arc( this.center.x , this.center.y , radius , 0 , 2 * Math.PI );
        this.ctx.stroke();

        this.ctx.font = "30px Arial";
        this.ctx.fillStyle = "#000";
        this.ctx.globalAlpha = 1;
        this.ctx.textAlign = 'center';

        this.ctx.fillText( Math.round(this.currentProgress) + "%" , this.center.x , this.center.y + 11 );
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

    var createBootLoader = function(){
        var bootLoader = $(_.template(bootloaderTemplate)({
            id: this.drawingElementId
        }));

        $('body').append(bootLoader);

        return bootLoader;
    };

    return PreloadDraw;
});