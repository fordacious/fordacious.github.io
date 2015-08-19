define(function(require) {
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
