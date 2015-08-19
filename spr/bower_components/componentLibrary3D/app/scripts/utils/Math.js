define(function(){

    return {
        degToRad: function(deg){
            return deg * Math.PI/180;
        },
        radToDeg: function(rad){
            return rad * 180/Math.PI;
        }
    };

});