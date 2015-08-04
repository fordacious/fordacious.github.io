define(function(require){
    var HtmlRenderer = require('./HtmlRenderer');

    var TextRenderer = function(){
        HtmlRenderer.apply(this);

        this.__super__ = HtmlRenderer.prototype;
        this.text = '';
    };

    TextRenderer.prototype = new HtmlRenderer();
    TextRenderer.prototype.constructor = TextRenderer;

    TextRenderer.prototype.start = function(){
        this.__super__.start.apply(this);
        bindText.call(this);
    };

    TextRenderer.prototype.syncFromCss = function(){
        this.__super__.syncFromCss.apply(this);
        this.text = this.$el.html();
    };

    var bindText = function(){
        var _text = this.text;

        Object.defineProperty(this, 'text', {
            get: function(){ return _text; },
            set: function(text){
                if(_text === text && !this.forceValues) return;

                _text = text;
                this.$el.html(text);
            }
        });

        var originalForceValues = this.forceValues;
        this.forceValues = true;
        this.text = _text;
        this.forceValues = originalForceValues;
    };

    return TextRenderer;
});