/*globals window*/
define(function(require){
    var ComponentSystem = require('ComponentSystem');
    var $ = require('jquery');

    var Time = function(pauseOnBlur){
        this.playing = true;
        this.ts = 0;
        this.lastTs = 0;
        this.elapsed = 0;
        this.sinceAppStart = 0;
        this.sinceSceneStart = 0;

        this.pauseStartTs = null;
        this.playStateOverwrite = true;

        if (pauseOnBlur) {
            $(window).on('focus', $.proxy(focusChange, this, true));
            $(window).on('blur', $.proxy(focusChange, this, false));
        }
    };

    Time.prototype.resetSceneTimer = function(){
        this.sinceSceneStart = 0;
    };

    Time.prototype.pause = function(){
        this.playing = false;
        this.playStateOverwrite = false;
    };

    Time.prototype.play = function(){
        this.playing = true;
        this.playStateOverwrite = true;
    };

    Time.prototype.update = function(ts){
        this.ts = ts;
        if(!this.playing){
            updatePaused.call(this);
        }
        else{
            updatePlaying.call(this);
            ComponentSystem.update(this);
        }
    };

    Time.create = function(pauseOnBlur){
        return new Time(pauseOnBlur);
    };

    var updatePaused = function(){
        if(this.pauseStartTs === null){
            this.pauseStartTs = this.ts;
        }
    };

    var updatePlaying = function(){
        if(!this.lastTs){ this.lastTs = this.ts; }
        if(this.pauseStartTs){
            this.lastTs = this.ts;
            this.pauseStartTs = null;
        }

        this.elapsed = this.ts - this.lastTs;
        this.sinceAppStart += this.elapsed;
        this.sinceSceneStart += this.elapsed;
        this.lastTs = this.ts;
    };

    var focusChange = function(playing){
        if(this.playStateOverwrite){
            this.playing = playing;
        }
    };

    return Time;
});