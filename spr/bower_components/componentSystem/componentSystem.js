(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD.
        define([], factory);
    } else {
        // Browser globals
        root.componentSystem = factory();
    }
}(this, function () {/**
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

define('componentize',[],function() {

    function setAllPropertiesOn(component, setup) {
        for(var s in setup) {
            component[s] = setup[s];
        }
    }

    function createComponent(Component, setup, id) {
        var component = new Component();
        component.entity = this;
        this.components[id] = component;

        if(component.start){ this.notStartedComponents[id] = component; }
        else if(component.update){ this.updatableComponents[id] = component; }

        if(setup){ setAllPropertiesOn(component, setup); }
        if(component.initialize) { component.initialize(); }
        return component;
    }

    function validateComponentName(name){
        return name === '' || this[name] === null || this[name] === undefined;
    }

    function getComponent(type) {
        var id;
        for(id in this.components) {
            if(this.components[id] instanceof type) { return this.components[id]; }
        }
        return null;
    }

    function getComponents(type) {
        var result = [], id;
        for(id in this.components) {
            if(!(this.components[id] instanceof type)) { continue; }
            result.push(this.components[id]);
        }
        return result;
    }

    function removeComponent(component) {
        if(component.destroy) {
            component.destroy();
        }
        var id;
        for(id in this.components) {
            if(this.components[id] === component) {
                delete this.components[id];
                break;
            }
        }
        delete this.notStartedComponents[id];
        delete this.updatableComponents[id];

        if(component.componentName){ delete component.entity[component.componentName]; }
        component.entity = null;
    }

    function removeAllComponents(){
        var id;
        for(id in this.components) {
            this.removeComponent(this.components[id]);
        }
    }

    function _removeChild(child, id, doNotDestory){
        delete this.children[id];
        child.parent = null;
        if(!doNotDestory){ child.destroy(); }
    }

    function removeChild(child, doNotDestroy){
        if(child.parent !== this){ return; }

        for(var id in this.children) {
            if(this.children[id] === child){
                _removeChild.call(this, child, id, doNotDestroy);
            }
        }
    }

    function removeAllChildren(){
        for(var id in this.children) {
            _removeChild.call(this, this.children[id], id);
        }
    }

    function hasComponent(type) {
        return this.getComponent(type) !== null;
    }

    function runComponents(state) {
        this.runComponentsStart(state);
        this.runComponentsUpdate(state);
    }

    function runComponentsStart(state) {
        var id, component;
        for(id in this.notStartedComponents) {
            component = this.notStartedComponents[id];
            component.start(state);
            if(component.destroyed){ continue; }
            if(component.update){ this.updatableComponents[id] = component; }
            delete this.notStartedComponents[id];
        }
    }

    function runComponentsUpdate(state) {
        for(var id in this.updatableComponents) {
            this.updatableComponents[id].update(state);
        }
    }

    return function(entity, entityID, callbacks) {
        entity.notStartedComponents = {};
        entity.updatableComponents = {};
        entity.components = {};
        entity.children = {};
        callbacks = callbacks || {};

        var entityComponentID = 0;
        var entityDestroyed = false;
        Object.defineProperty(entity, 'destroyed', {
            get : function() { return entityDestroyed; }
        });

        Object.defineProperty(entity, 'UID', {
            get: function() { return entityID; }
        });

        entity.addComponent = function() {
            var componentName, Component, setup;
            if(arguments.length === 1){
                componentName = '';
                Component = arguments[0];
                setup = {};
            }
            if(arguments.length === 2){
                componentName = '';
                Component = arguments[0];
                setup = arguments[1];
            }
            else if(arguments.length === 3){
                componentName = arguments[0];
                Component = arguments[1];
                setup = arguments[2];
            }

            if(!validateComponentName.call(this)) { throw new Error(componentName + " already exists on entity."); }

            var component = createComponent.call(this, Component, setup, entityComponentID++);
            Object.defineProperty(component, 'componentName', {'configurable': false, 'enumerable': false, 'writable': false, 'value': componentName});

            if(componentName !== ''){ this[componentName] = component; }
            return component;
        };
        entity.destroy = function() {
            if(entityDestroyed){ return; }

            this.removeAllComponents();
            this.removeAllChildren();
            entityDestroyed = true;
        };

        entity.addChild = function(name, child){
            if(child.parent === this){ return; }
            if(child.parent){ child.parent.removeChild(child, true); }

            if(this === child){ throw new Error ("Entity can not add itself as a child"); }
            var parent = this.parent;
            while(parent){
                if(parent === child){ throw new Error ('Child can not be added because it already exists in the parenting chain'); }
                parent = parent.parent;
            }

            this.children[name] = child;
            child.parent = this;

            if(callbacks.updateChildName){ callbacks.updateChildName(child, name); }
        };

        entity.getComponent = getComponent;
        entity.getComponents = getComponents;
        entity.removeComponent = removeComponent;
        entity.removeAllComponents = removeAllComponents;
        entity.removeChild = removeChild;
        entity.removeAllChildren = removeAllChildren;
        entity.hasComponent = hasComponent;
        entity.runComponents = runComponents;
        entity.runComponentsStart = runComponentsStart;
        entity.runComponentsUpdate = runComponentsUpdate;
    };
});
define('system',['require','componentize'],function(require) {
    var componentize = require('componentize');

    var registeredEntities = {};
    var entitiesIdToPath = {};
    var entitiesPathToEntities = {};
    var entityID = 0;

    // if the entity is destroyed, removes it and all its components
    // returns whether or not it did this
    function removeEntityIfDestroyed(id) {
        if(registeredEntities[id].destroyed) {
            registeredEntities[id].removeAllComponents();
            delete registeredEntities[id];
            delete entitiesPathToEntities[entitiesIdToPath[id]];
            delete entitiesIdToPath[id];
            return true;
        }
        return false;
    }

    function updateChildrenNames(entity, oldParentNameRegexString, newParentName){
        for(var i in  entity.children){
            if(!entity.children.hasOwnProperty(i)) { continue; }
            var child = entity.children[i];

            var oldName = entitiesIdToPath[child.UID];
            var newChildName = entitiesIdToPath[child.UID].replace(oldParentNameRegexString, newParentName);
            entitiesIdToPath[child.UID] = newChildName;
            delete entitiesPathToEntities[oldName];
            entitiesPathToEntities[newChildName] = child;

            updateChildrenNames(child, oldParentNameRegexString, newParentName);
        }
    }

    function updateChildName(child, name){
        var oldPath = entitiesIdToPath[child.UID];
        var newPath = entitiesIdToPath[child.parent.UID] + "." + name;

        if(oldPath){
            delete entitiesPathToEntities[oldPath];

            updateChildrenNames(child, oldPath.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), newPath);
        }

        entitiesIdToPath[child.UID] = newPath;
        entitiesPathToEntities[newPath] = child;
    }


    return {
        createEntity : function(name) {
            var entity = {};
            var currentEntityID = entityID++;
            name = name || currentEntityID;

            componentize(entity, currentEntityID, {
                updateChildName: updateChildName
            });

            registeredEntities[currentEntityID] = entity;
            entitiesIdToPath[currentEntityID] = name;
            entitiesPathToEntities[name] = entity;

            return entity;
        },
        update : function(currentState) {
            var id;
            // run start
            for(id in registeredEntities) {
                if (!removeEntityIfDestroyed(id)) {
                    registeredEntities[id].runComponentsStart(currentState);
                }
            }
            // run update
            for (id in registeredEntities) {
                if (!removeEntityIfDestroyed(id)) {
                    registeredEntities[id].runComponentsUpdate(currentState);
                }
            }
        },
        allInstancesOfComponent : function(type) {
            var instances = [];
            for(var id in registeredEntities) {
                if(registeredEntities[id].destroyed) { continue; }
                var components = registeredEntities[id].getComponents(type);
                if(!components) { continue; }
                instances = instances.concat(components);
            }
            return instances;
        },
        firstInstanceOfComponent : function(type) {
            for(var id in registeredEntities) {
                if(registeredEntities[id].destroyed) { continue; }
                var component = registeredEntities[id].getComponent(type);
                if(!component) { continue; }
                return component;
            }
            return null;
        },
        start : function() {
            for(var id in registeredEntities) {
                registeredEntities[id].removeAllComponents();
                registeredEntities[id].destroy();
            }

            registeredEntities = {};
            entitiesIdToPath = {};
            entitiesPathToEntities = {};

            this.Entities = entitiesPathToEntities;
        },
        Entities: entitiesPathToEntities
    };
});
define('main',['require','system'],function(require) {
    return require('system');
});

//Use almond's special top-level, synchronous require to trigger factory
//functions, get the final module value, and export it as the public
//value.
return require('main');
}));