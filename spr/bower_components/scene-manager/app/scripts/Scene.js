define(function(require){
    var ComponentSystem = require('ComponentSystem');
    var ComponentLibrary = require('ComponentLibrary');
    var ComponentQuery = require('ComponentQuery');
    var EntityFactory = require('EntityFactory');

    var $ = require('jquery');

    var nextSceneId = 1;

    var Scene = function(params){
        this.config = parseParams(params);
        this.id = this.config.id;

        Object.defineProperty(this, 'Entities', {
            get: function() { return ComponentSystem.Entities; }
        });
        
        this.Factories = {};
        this.references = [];
        this.$el = createSceneWrapper(this.id);
    };

    Scene.prototype.addEntity = function(name, config, parent){
        var i, entity;
        entity = ComponentSystem.createEntity(name);
        entity.Scene = this;

        for(i in config.components){
            if(!config.components.hasOwnProperty(i)){ continue; }
            try{
                this.addComponent(entity, i, config.components[i]);
            }
            catch(err){
                console.warn('Component ' + i + ' was not attached.\n' + err.message);
                throw err;
            }
        }

        if(parent){ parent.addChild(name, entity); }

        for(i in config.children){
            if(!config.children.hasOwnProperty(i)){ continue; }
            this.addEntity(i, config.children[i], entity);
        }

        return entity;
    };

    Scene.prototype.addComponent = function(entity, name, config){
        var component, componentName, componentObject;
        config = $.extend({}, config);
        componentName = config.componentName || name;
        delete config.componentName;
        component = ComponentLibrary.getComponent(componentName);
        componentObject = entity.addComponent(name, component, config);
        ComponentQuery.addResolutionProperties(this.references, componentObject);
        return componentObject;
    };

    Scene.prototype.start = function(){
        loadEntities.call(this);
        loadFactories.call(this);
    };

    Scene.prototype.unload = function(){
        var i;
        this.$el.remove();
        for(i in this.Entities){
            if(!this.Entities.hasOwnProperty(i)){ continue; }
            this.Entities[i].destroy();
            delete this.Entities[i];
        }
        for(i in this.Factories){
            delete this.Factories[i];
        }
    };

    Scene.prototype.resolveReferences = function(){
        ComponentQuery.resolveComponentReferences(this.Entities, this.Factories, this.references);
    };

    Scene.create = function(params){
        return new Scene(params);
    };

    var parseParams = function(params){
        params = params || {};

        params.id = params.id || nextSceneId++;
        params.entities = params.entities || {};
        params.factories = params.factories || {};
        return params;
    };

    var loadEntities = function(){
        var i, j, allEntities;
        allEntities = this.config.entities;
        for(i in allEntities){
            if(!allEntities.hasOwnProperty(i)){ continue; }
            var clones = allEntities[i].clones || 1;
            for(j = 0; j < clones; j++){
                this.addEntity(i, allEntities[i]);
            }
        }
    };

    var loadFactories = function(){
        var i, j, allFactories;
        allFactories = this.config.factories;
        for(i in allFactories){
            if(!allFactories.hasOwnProperty(i)){ continue; }
            this.Factories[i] = new EntityFactory(this, allFactories[i]);
        }
    };

    var createSceneWrapper = function(id){
        return $('<div id="scene_' + id + '" class="scene" />');
    };

    return Scene;
});