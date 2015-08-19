define(function(require){
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
