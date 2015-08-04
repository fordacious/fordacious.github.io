define(function(){
    'use strict';
    var loadedComponents = {};

    return {
        init: function(components){
            loadedComponents = components;
        },
        getComponent: function(componentName){
            if(!loadedComponents[componentName]){ throw new Error('Required component does not exist or it was not loaded (' + componentName +')'); }
            return loadedComponents[componentName];
        },
        getAllComponents : function() {
            return loadedComponents;
        }
    };
});