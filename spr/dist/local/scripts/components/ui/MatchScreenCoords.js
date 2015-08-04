define(function(require){
    var MatchScreenCoords = function () {
        this.camera = null;
        this.width = 0;
        this.height = 0;
    };

    MatchScreenCoords.prototype.start = function () {
        this.camera.position.x = this.width / 2;
        this.camera.position.y = this.height / 2;
        this.camera.position.z = -1000;
        this.camera.rotation.x = 0;
        this.camera.rotation.y = Math.PI;
        this.camera.rotation.z = Math.PI;
    };

    return MatchScreenCoords;
});