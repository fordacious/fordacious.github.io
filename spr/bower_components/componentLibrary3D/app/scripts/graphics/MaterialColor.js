define(function(require){

    var MaterialColor = function(){
        this.mesh = null;
        this.color = 0xFFFFFF;
    };

    MaterialColor.prototype.start = function(){
        if(!this.mesh){ throw new Error('mesh must be given'); }

        var red = (this.color >> 16) & 0xFF;
        var green = (this.color >> 8) & 0xFF;
        var blue = this.color & 0xFF;

        this.mesh.object3D.material.color.setRGB(red/255,green/255,blue/255);
    };

    return MaterialColor;
});