(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD.
        define(['jquery', 'ComponentSystem', 'ComponentLibrary'], factory);
    } else {
        // Browser globals
        root.SceneManager = factory();
    }
}(this, function (jquery, componentSystem, componentLibrary) {/**
 * @license almond 0.2.9 Copyright (c) 2011-2014, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/almond for details
 */
//Going sloppy to avoid 'use strict' string cost, but strict practices should
//be followed.
/*jslint sloppy: true */
/*global setTimeout: false */

var requirejs, require, define;
(function (undef) {
    var main, req, makeMap, handlers,
        defined = {},
        waiting = {},
        config = {},
        defining = {},
        hasOwn = Object.prototype.hasOwnProperty,
        aps = [].slice,
        jsSuffixRegExp = /\.js$/;

    function hasProp(obj, prop) {
        return hasOwn.call(obj, prop);
    }

    /**
     * Given a relative module name, like ./something, normalize it to
     * a real name that can be mapped to a path.
     * @param {String} name the relative name
     * @param {String} baseName a real name that the name arg is relative
     * to.
     * @returns {String} normalized name
     */
    function normalize(name, baseName) {
        var nameParts, nameSegment, mapValue, foundMap, lastIndex,
            foundI, foundStarMap, starI, i, j, part,
            baseParts = baseName && baseName.split("/"),
            map = config.map,
            starMap = (map && map['*']) || {};

        //Adjust any relative paths.
        if (name && name.charAt(0) === ".") {
            //If have a base name, try to normalize against it,
            //otherwise, assume it is a top-level require that will
            //be relative to baseUrl in the end.
            if (baseName) {
                //Convert baseName to array, and lop off the last part,
                //so that . matches that "directory" and not name of the baseName's
                //module. For instance, baseName of "one/two/three", maps to
                //"one/two/three.js", but we want the directory, "one/two" for
                //this normalization.
                baseParts = baseParts.slice(0, baseParts.length - 1);
                name = name.split('/');
                lastIndex = name.length - 1;

                // Node .js allowance:
                if (config.nodeIdCompat && jsSuffixRegExp.test(name[lastIndex])) {
                    name[lastIndex] = name[lastIndex].replace(jsSuffixRegExp, '');
                }

                name = baseParts.concat(name);

                //start trimDots
                for (i = 0; i < name.length; i += 1) {
                    part = name[i];
                    if (part === ".") {
                        name.splice(i, 1);
                        i -= 1;
                    } else if (part === "..") {
                        if (i === 1 && (name[2] === '..' || name[0] === '..')) {
                            //End of the line. Keep at least one non-dot
                            //path segment at the front so it can be mapped
                            //correctly to disk. Otherwise, there is likely
                            //no path mapping for a path starting with '..'.
                            //This can still fail, but catches the most reasonable
                            //uses of ..
                            break;
                        } else if (i > 0) {
                            name.splice(i - 1, 2);
                            i -= 2;
                        }
                    }
                }
                //end trimDots

                name = name.join("/");
            } else if (name.indexOf('./') === 0) {
                // No baseName, so this is ID is resolved relative
                // to baseUrl, pull off the leading dot.
                name = name.substring(2);
            }
        }

        //Apply map config if available.
        if ((baseParts || starMap) && map) {
            nameParts = name.split('/');

            for (i = nameParts.length; i > 0; i -= 1) {
                nameSegment = nameParts.slice(0, i).join("/");

                if (baseParts) {
                    //Find the longest baseName segment match in the config.
                    //So, do joins on the biggest to smallest lengths of baseParts.
                    for (j = baseParts.length; j > 0; j -= 1) {
                        mapValue = map[baseParts.slice(0, j).join('/')];

                        //baseName segment has  config, find if it has one for
                        //this name.
                        if (mapValue) {
                            mapValue = mapValue[nameSegment];
                            if (mapValue) {
                                //Match, update name to the new value.
                                foundMap = mapValue;
                                foundI = i;
                                break;
                            }
                        }
                    }
                }

                if (foundMap) {
                    break;
                }

                //Check for a star map match, but just hold on to it,
                //if there is a shorter segment match later in a matching
                //config, then favor over this star map.
                if (!foundStarMap && starMap && starMap[nameSegment]) {
                    foundStarMap = starMap[nameSegment];
                    starI = i;
                }
            }

            if (!foundMap && foundStarMap) {
                foundMap = foundStarMap;
                foundI = starI;
            }

            if (foundMap) {
                nameParts.splice(0, foundI, foundMap);
                name = nameParts.join('/');
            }
        }

        return name;
    }

    function makeRequire(relName, forceSync) {
        return function () {
            //A version of a require function that passes a moduleName
            //value for items that may need to
            //look up paths relative to the moduleName
            return req.apply(undef, aps.call(arguments, 0).concat([relName, forceSync]));
        };
    }

    function makeNormalize(relName) {
        return function (name) {
            return normalize(name, relName);
        };
    }

    function makeLoad(depName) {
        return function (value) {
            defined[depName] = value;
        };
    }

    function callDep(name) {
        if (hasProp(waiting, name)) {
            var args = waiting[name];
            delete waiting[name];
            defining[name] = true;
            main.apply(undef, args);
        }

        if (!hasProp(defined, name) && !hasProp(defining, name)) {
            throw new Error('No ' + name);
        }
        return defined[name];
    }

    //Turns a plugin!resource to [plugin, resource]
    //with the plugin being undefined if the name
    //did not have a plugin prefix.
    function splitPrefix(name) {
        var prefix,
            index = name ? name.indexOf('!') : -1;
        if (index > -1) {
            prefix = name.substring(0, index);
            name = name.substring(index + 1, name.length);
        }
        return [prefix, name];
    }

    /**
     * Makes a name map, normalizing the name, and using a plugin
     * for normalization if necessary. Grabs a ref to plugin
     * too, as an optimization.
     */
    makeMap = function (name, relName) {
        var plugin,
            parts = splitPrefix(name),
            prefix = parts[0];

        name = parts[1];

        if (prefix) {
            prefix = normalize(prefix, relName);
            plugin = callDep(prefix);
        }

        //Normalize according
        if (prefix) {
            if (plugin && plugin.normalize) {
                name = plugin.normalize(name, makeNormalize(relName));
            } else {
                name = normalize(name, relName);
            }
        } else {
            name = normalize(name, relName);
            parts = splitPrefix(name);
            prefix = parts[0];
            name = parts[1];
            if (prefix) {
                plugin = callDep(prefix);
            }
        }

        //Using ridiculous property names for space reasons
        return {
            f: prefix ? prefix + '!' + name : name, //fullName
            n: name,
            pr: prefix,
            p: plugin
        };
    };

    function makeConfig(name) {
        return function () {
            return (config && config.config && config.config[name]) || {};
        };
    }

    handlers = {
        require: function (name) {
            return makeRequire(name);
        },
        exports: function (name) {
            var e = defined[name];
            if (typeof e !== 'undefined') {
                return e;
            } else {
                return (defined[name] = {});
            }
        },
        module: function (name) {
            return {
                id: name,
                uri: '',
                exports: defined[name],
                config: makeConfig(name)
            };
        }
    };

    main = function (name, deps, callback, relName) {
        var cjsModule, depName, ret, map, i,
            args = [],
            callbackType = typeof callback,
            usingExports;

        //Use name if no relName
        relName = relName || name;

        //Call the callback to define the module, if necessary.
        if (callbackType === 'undefined' || callbackType === 'function') {
            //Pull out the defined dependencies and pass the ordered
            //values to the callback.
            //Default to [require, exports, module] if no deps
            deps = !deps.length && callback.length ? ['require', 'exports', 'module'] : deps;
            for (i = 0; i < deps.length; i += 1) {
                map = makeMap(deps[i], relName);
                depName = map.f;

                //Fast path CommonJS standard dependencies.
                if (depName === "require") {
                    args[i] = handlers.require(name);
                } else if (depName === "exports") {
                    //CommonJS module spec 1.1
                    args[i] = handlers.exports(name);
                    usingExports = true;
                } else if (depName === "module") {
                    //CommonJS module spec 1.1
                    cjsModule = args[i] = handlers.module(name);
                } else if (hasProp(defined, depName) ||
                           hasProp(waiting, depName) ||
                           hasProp(defining, depName)) {
                    args[i] = callDep(depName);
                } else if (map.p) {
                    map.p.load(map.n, makeRequire(relName, true), makeLoad(depName), {});
                    args[i] = defined[depName];
                } else {
                    throw new Error(name + ' missing ' + depName);
                }
            }

            ret = callback ? callback.apply(defined[name], args) : undefined;

            if (name) {
                //If setting exports via "module" is in play,
                //favor that over return value and exports. After that,
                //favor a non-undefined return value over exports use.
                if (cjsModule && cjsModule.exports !== undef &&
                        cjsModule.exports !== defined[name]) {
                    defined[name] = cjsModule.exports;
                } else if (ret !== undef || !usingExports) {
                    //Use the return value from the function.
                    defined[name] = ret;
                }
            }
        } else if (name) {
            //May just be an object definition for the module. Only
            //worry about defining if have a module name.
            defined[name] = callback;
        }
    };

    requirejs = require = req = function (deps, callback, relName, forceSync, alt) {
        if (typeof deps === "string") {
            if (handlers[deps]) {
                //callback in this case is really relName
                return handlers[deps](callback);
            }
            //Just return the module wanted. In this scenario, the
            //deps arg is the module name, and second arg (if passed)
            //is just the relName.
            //Normalize module name, if it contains . or ..
            return callDep(makeMap(deps, callback).f);
        } else if (!deps.splice) {
            //deps is a config object, not an array.
            config = deps;
            if (config.deps) {
                req(config.deps, config.callback);
            }
            if (!callback) {
                return;
            }

            if (callback.splice) {
                //callback is an array, which means it is a dependency list.
                //Adjust args if there are dependencies
                deps = callback;
                callback = relName;
                relName = null;
            } else {
                deps = undef;
            }
        }

        //Support require(['a'])
        callback = callback || function () {};

        //If relName is a function, it is an errback handler,
        //so remove it.
        if (typeof relName === 'function') {
            relName = forceSync;
            forceSync = alt;
        }

        //Simulate async callback;
        if (forceSync) {
            main(undef, deps, callback, relName);
        } else {
            //Using a non-zero value because of concern for what old browsers
            //do, and latest browsers "upgrade" to 4 if lower value is used:
            //http://www.whatwg.org/specs/web-apps/current-work/multipage/timers.html#dom-windowtimers-settimeout:
            //If want a value immediately, use require('id') instead -- something
            //that works in almond on the global level, but not guaranteed and
            //unlikely to work in other AMD implementations.
            setTimeout(function () {
                main(undef, deps, callback, relName);
            }, 4);
        }

        return req;
    };

    /**
     * Just drops the config on the floor, but returns req in case
     * the config return value is used.
     */
    req.config = function (cfg) {
        return req(cfg);
    };

    /**
     * Expose module registry for debugging and tooling
     */
    requirejs._defined = defined;

    define = function (name, deps, callback) {

        //This module may not have dependencies
        if (!deps.splice) {
            //deps is not an array, so probably means
            //an object literal or factory function for
            //the value. Adjust args.
            callback = deps;
            deps = [];
        }

        if (!hasProp(defined, name) && !hasProp(waiting, name)) {
            waiting[name] = [name, deps, callback];
        }
    };

    define.amd = {
        jQuery: true
    };
}());

define("../../bower_components/almond/almond", function(){});

define('constants',['require'],function(require) {
    var Constants = {};
    
    Object.defineProperty(Constants, 'FACTORY', {
        value: '+', 
        enumerable: true
    });
    
    Object.defineProperty(Constants, 'REFERENCE', {
        value: '&', 
        enumerable: true
    });
    
    Object.defineProperty(Constants, 'MEMBER', {
        value: '.', 
        enumerable: true
    });

    Object.defineProperty(Constants, 'PATTERN_ALL', {
        value: '*', 
        enumerable: true
    });

    Object.defineProperty(Constants, 'PATTERN_PARENT', {
        value: '^',
        enumerable: true
    });
    
    return Constants;
});

define('ResolutionProperty',['require','constants'],function(require){
    var constants = require('constants');

    // object that stores property to be resolves, along with
    // the parentEntity it belongs to
    var ResolutionProperty = function (entity, component, propName) {
        this.component = component;
        this.propName  = propName;
        this.entity = entity;
    };

    ResolutionProperty.prototype.resolve = function(entities, factories) {
        var queryStr = this.component[this.propName];

        var names = queryStr.substr(1).split(constants.MEMBER);
        var kind = queryStr[0];
        //var head = names[0];
        var componentName = names.pop();
        var entity;

        if (kind === constants.FACTORY) {
            return factories[componentName] || null;
        }
        else if (names.length === 0) { // self ref
            return getObjects(this.entity, componentName);
        }
        else { // external ref
            entity = getEntity(this.entity, entities, names);
            
            return getObjects(entity, componentName);
        }
    };

    var getEntity = function(thisEntity, entities, nameParts) {
        var name = nameParts.shift();
        if(name === constants.PATTERN_PARENT) {
            return getEntityHelper(thisEntity.parent, nameParts);
        } else {
            return getEntityHelper(entities[name] || null, nameParts);
        }
    };
    var getEntityHelper = function(currentEntity, nameParts) {
        if(currentEntity === null || !nameParts.length) { return currentEntity; }
        var name = nameParts.shift();
        if(name === constants.PATTERN_PARENT) {
            return getEntityHelper(currentEntity.parent, nameParts);
        }
        return getEntityHelper(currentEntity.children[name] || null, nameParts);
    };

    var getObjects = function (parentEntity, queryStr) {

        if (!parentEntity) { return null; }

        if (queryStr === constants.PATTERN_ALL) {
            return parentEntity;
        } else {
            return parentEntity[queryStr];
        }
    };

    return ResolutionProperty;
});

define('ComponentQuery',['require','constants','ResolutionProperty'],function(require) {
    var constants = require('constants');
    var ResolutionProperty = require('ResolutionProperty');

    var ComponentQuery = {
        addResolutionProperties: function(resolutionList, component){
            for (var prop in component) {
                if (component.hasOwnProperty(prop) && validReference(component[prop])) {
                    resolutionList.push(new ResolutionProperty(component.entity, component, prop));
                }
                else if (component.hasOwnProperty(prop) && Array.isArray(component[prop])){
                    var array = component[prop];
                    for(var index in array){
                        if(validReference(array[index])){
                            resolutionList.push(new ResolutionProperty(component.entity, array, index));
                        }
                    }
                }
            }
            return resolutionList;
        },
        resolveComponentReferences : function(entities, factories, propertiesToResolve){
            var resolutionProperty;
            try {
                while(propertiesToResolve.length){
                    resolutionProperty = propertiesToResolve[0];

                    resolutionProperty.component[resolutionProperty.propName] = resolutionProperty.resolve(entities, factories);

                    propertiesToResolve.shift();
                }
            } catch (e) {
                throw new Error("Error in input: " + e.message);
            }
        }
    };

    var validReference = function (queryStr) {
        return typeof queryStr === typeof "string" && queryStr.length > 0 && (queryStr[0] === constants.REFERENCE || queryStr[0] === constants.FACTORY);
    };

    return ComponentQuery;
});

define('EntityFactory',['require','jquery'],function(require){
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

define('Scene',['require','ComponentSystem','ComponentLibrary','ComponentQuery','EntityFactory','jquery'],function(require){
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
/*globals window*/
define('Time',['require','ComponentSystem','jquery'],function(require){
    var ComponentSystem = require('ComponentSystem');
    var $ = require('jquery');

    var Time = function(pauseOnBlur){
        this.playing = true;
        this.ts = 0;
        this.lastTs = 0;
        this.elapsed = 0;
        this.sinceAppStart = 0;
        this.sinceSceneStart = 0;

        this.pauseStartTs = null;
        this.playStateOverwrite = true;

        if (pauseOnBlur) {
            $(window).on('focus', $.proxy(focusChange, this, true));
            $(window).on('blur', $.proxy(focusChange, this, false));
        }
    };

    Time.prototype.resetSceneTimer = function(){
        this.sinceSceneStart = 0;
    };

    Time.prototype.pause = function(){
        this.playing = false;
        this.playStateOverwrite = false;
    };

    Time.prototype.play = function(){
        this.playing = true;
        this.playStateOverwrite = true;
    };

    Time.prototype.update = function(ts){
        this.ts = ts;
        if(!this.playing){
            updatePaused.call(this);
        }
        else{
            updatePlaying.call(this);
            ComponentSystem.update(this);
        }
    };

    Time.create = function(pauseOnBlur){
        return new Time(pauseOnBlur);
    };

    var updatePaused = function(){
        if(this.pauseStartTs === null){
            this.pauseStartTs = this.ts;
        }
    };

    var updatePlaying = function(){
        if(!this.lastTs){ this.lastTs = this.ts; }
        if(this.pauseStartTs){
            this.lastTs = this.ts;
            this.pauseStartTs = null;
        }

        this.elapsed = this.ts - this.lastTs;
        this.sinceAppStart += this.elapsed;
        this.sinceSceneStart += this.elapsed;
        this.lastTs = this.ts;
    };

    var focusChange = function(playing){
        if(this.playStateOverwrite){
            this.playing = playing;
        }
    };

    return Time;
});
/*globals document, window, requestAnimationFrame*/
define('Manager',['require','ComponentSystem','Scene','Time','jquery'],function(require){
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
define('jquery', function() { return jquery; });
define('ComponentSystem', function() { return componentSystem; });
define('ComponentLibrary', function() { return componentLibrary; });

return require('Manager');
}));