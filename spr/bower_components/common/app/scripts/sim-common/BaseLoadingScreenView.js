/*globals console, setInterval*/
define (function(require){

    var _ = require('underscore');
    var Backbone = require('backbone');

    var env = require("env");

    var LoadingScreenModel = require ('sim-common/LoadingScreenModel');

    var Createjs = require("createjs");

    var text;
    var bar;

    var LoadingScreenView = Backbone.View.extend({
        className: 'loadingScreen',
        stage:null,
        canvas:null,
        context:null,

        initialize: function(params){

            _.bindAll(this, 'render', 'setPercent', 'getPercent', 'show', 'hide');

            this.$el.html('<canvas/>');

            this.canvas = this.$('canvas')[0];

            this.context = this.canvas.getContext('2d');

            this.canvas.width  = params.width;
            this.canvas.height = params.height;

            this.stage = new Createjs.Stage(this.canvas);

            var _this = this;
            setInterval(function () {
                _this.render();
                _this.stage.update();
            }, 1000/24);

            this.model = new LoadingScreenModel();
        },

        render : function () {
            if (!text) {
                text = new Createjs.Text();
                this.stage.addChild(text);
                bar = new Createjs.Shape();
                this.stage.addChild(bar);
                text.x = this.canvas.width/2 - 30;
                text.y = this.canvas.height - 20;
                bar.x = this.canvas.width/2 - 52;
                bar.y = this.canvas.height;
            }

            text.text = 'LOADING: ' + (this.getPercent() | 0) + '%';
            bar.graphics.clear();
            bar.graphics.beginFill("#000");
            bar.graphics.drawRect(0,0,this.getPercent(), 20);
            bar.graphics.endFill();
        },

        setPercent : function (v) {
            this.model.set("percentageDone", v);
        },

        getPercent : function () {
            return this.model.get("percentageDone");
        },

        show: function () {
            this.$el.show();
        },

        hide: function () {
            this.$el.hide();
        }

    });

    return LoadingScreenView;

});