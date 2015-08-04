define(function(require){

    var Circle = function(radius, lineWidth, color, options){

        options = options || {};


        this.startAngle = -90 /180 * Math.PI;
        this.endAngle = 0;

        this.x = options.x || 450;
        this.y = options.y || 275;

        this.radius = radius;
        this.lineWidth = lineWidth;
        this.color = color;
    };

    Circle.prototype.setCanvasContext = function(ctx) {
        this.ctx = ctx;
    };

    Circle.prototype.update = function(percentage) {

        this.endAngle = this.startAngle + percentage * 2 * Math.PI / 100;

        draw.call(this);
    };

    function draw(){
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, this.startAngle, this.endAngle, false);
        this.ctx.lineWidth = this.lineWidth;
        this.ctx.strokeStyle = this.color;
        this.ctx.stroke();
    }


    return Circle;

});