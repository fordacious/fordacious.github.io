define(function(require){
    var $ = require('jquery');
    var _ = require('underscore');
    var ComponentLibrary = require('ComponentLibrary');
    var HtmlRenderer = require('./HtmlRenderer');

    var TemplateRenderer = function(){
        HtmlRenderer.apply(this);

        this.__super__ = HtmlRenderer.prototype;
        this.template = '';
        this.templateData = {};
    };

    TemplateRenderer.prototype = new HtmlRenderer();
    TemplateRenderer.prototype.constructor = TemplateRenderer;

    TemplateRenderer.prototype.initialize = function(){
        createElement.call(this);
    };

    var createElement = function(){
        var tpl = ComponentLibrary.getComponent(this.template);
        this.$el = $(_.template(tpl)(this.templateData));

        if(this.class){ this.$el.addClass(this.class); }

        for(var i in this.attributes){
            this.$el.prop(i, this.attributes[i]);
        }
    };

    return TemplateRenderer;
});