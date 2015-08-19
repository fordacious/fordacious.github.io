define(function(require){
    var $ = require('jquery');

    var EntityFactory = function (scene, config) {
        this.scene = scene;
        this.config = config;
    };

    EntityFactory.prototype.create = function(name, extConfig) {
        var newConfig = $.extend(true, {}, this.config, extConfig);
        var entity = this.scene.addEntity(name, newConfig);
        
        this.scene.resolveReferences();
        
        return entity;
    };
    
    return EntityFactory;
});
