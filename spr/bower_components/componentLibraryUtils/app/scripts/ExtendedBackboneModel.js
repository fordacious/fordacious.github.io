define(function(require){
    var backbone = require('backbone');

    var ExtendedBackboneModel = backbone.Model.extend({
        initialize: function(){
            this.initialize = undefined;
            addDefaultGettersAndSetters.call(this);

            this.getValue = getValue;
            this.setValue = setValue;
        },
        destroy: function(){}
    });

    var getValue = function(name, options){
        var getter = createGetter(name, options);
        if(!this[getter]){ addAttribute.call(this, name); }
        return this[getter]();
    };

    var setValue = function(name, value, options){
        var setter = createSetter(name);
        if(!this[setter]){ addAttribute.call(this, name); }
        return this[setter](value, options);
    };

    var addDefaultGettersAndSetters = function(){
        for(var attribute in this.attributes){
            addAttribute.call(this, attribute);
        }
    };

    var defaultGetter = function(name, options){
        return this.get(name, options);
    };

    var defaultSetter = function(name, value, options){
        this.set(name, value, options);
    };

    var addAttribute = function(attribute){
        if(attribute === "value"){ throw new Error('Can not have attribute name of value'); }

        var getter = createGetter(attribute);
        var setter = createSetter(attribute);

        if(!this[getter] || typeof this[getter] !== 'function'){
            this[getter] = defaultGetter.bind(this, attribute);
        }
        if(!this[setter] || typeof this[setter] !== 'function'){
            this[setter] = defaultSetter.bind(this, attribute);
        }
    };

    var createGetter = function(string) {
        return 'get' + capitalize(string);
    };

    var createSetter = function(string) {
        return 'set' + capitalize(string);
    };

    var capitalize = function(string) {
        return string.charAt(0).toUpperCase() + string.substring(1);
    };

    return ExtendedBackboneModel;
});