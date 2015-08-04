define(function(require) {
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