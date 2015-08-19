define(function(require){

    var PercentageText = function(fontStyle, options){

        options = options || {};

        this.x = options.x || 450;
        this.y = options.y || 275;
        this.width = options.width || 900;
        this.height = options.height || 550;

        this.fontStyle = fontStyle;
        this.textAlign = options.textAlign || 'center';
        this.color = options.color || 'black';
    };

    PercentageText.prototype.setCanvasContext = function(ctx) {
        this.ctx = ctx;
    };

    PercentageText.prototype.update = function(percentage) {
        this.ctx.font = this.fontStyle;
        this.ctx.textAlign = this.textAlign;
        this.ctx.fillStyle = this.color;
        this.ctx.textBaseline = "middle";
        this.ctx.fillText(percentage.toFixed(2) + "%", this.x, this.y);
    };


    return PercentageText;

});