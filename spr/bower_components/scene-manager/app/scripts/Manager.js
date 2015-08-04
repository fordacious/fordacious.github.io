/*globals document, window, requestAnimationFrame*/
define(function(require){
    'use strict';
    var ComponentSystem = require('ComponentSystem');
    var Scene = require('Scene');
    var Time = require('Time');
    var $ = require('jquery');

    var SceneManager = {
        Scenes: {},           // Scene collection
        ActiveScene: null,    // Instance of a Scene
        parent: null,         // DOM Element
        $el: null,            // jQuery wrapper on the dom element
        startTime: 0,
        sceneStartTime: 0,
        lastUpdate: 0,

        create: function(config){
            this.parent = config.parent || document.body;
            this.$el = $(this.parent);
            this.Time = Time.create(config.pauseOnBlur === false ? false : config.pauseOnBlur || true);

            loadScenes(config);
            ComponentSystem.start();
            requestAnimationFrame($.proxy(this.update, this));
        },

        startScene: function(sceneName){
            var scene = this.Scenes[sceneName] || this.Scenes[Object.keys(this.Scenes)[0]];
            if(this.ActiveScene){ this.ActiveScene.unload(); }
            this.$el.append(scene.$el);
            this.ActiveScene = scene;

            this.Time.resetSceneTimer();
            scene.start();
            return this.ActiveScene;
        },

        update: function(ts){
            // TODO: write test for line below
            ts = ts || Date.now();
            if(this.ActiveScene){ this.ActiveScene.resolveReferences(); }
            this.Time.update(ts);
            requestAnimationFrame($.proxy(this.update, this));
        }
    };

    var loadScenes = function(config){
        if(!(config instanceof Object) || !(config.scenes instanceof Object) || Object.keys(config.scenes).length === 0){ throw new Error('No scenes detected on the config file.'); }
        var i, sceneData, scene;

        for(i in config.scenes){
            if(!config.scenes.hasOwnProperty(i)){ continue; }
            sceneData = config.scenes[i];
            scene = Scene.create(sceneData);
            if(SceneManager.Scenes[scene.id]){ throw new Error('A scene with the same ID already exists'); }
            SceneManager.Scenes[scene.id] = scene;
        }
    };

    window.requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function(callback){window.setTimeout(callback, 1000 / 60);};

    return SceneManager;
});