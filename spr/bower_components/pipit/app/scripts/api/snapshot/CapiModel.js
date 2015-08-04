define(['underscore'], function(_) {

    var CapiModel = function(attrs, methods) {
        _.extend(this, methods);
        this.attributes = _.clone(attrs || {});

        /*
    key: change:prop
    value: Array of functions
  */
        this._eventsMap = {};

        /*Converts all attribute to getters and setters*/
        this._setupAttributes = function() {

            _.each(this.attributes, function(value, prop) {

                var getter = function() {
                    return this.attributes[prop];
                };

                var setter = _.bind(function(val) {
                    if (this.attributes[prop] !== val) {
                        this.attributes[prop] = val;
                        this.trigger('change:' + prop);
                    }

                }, this);


                Object.defineProperty(this, prop, {
                    get: getter,
                    set: setter,
                    enumerable: true,
                    configurable: true
                });

            }, this);
        };
        this._setupAttributes();


        this.set = function(attrName, value) {
            this[attrName] = value;
        };

        this.get = function(attrName) {
            return this[attrName];
        };

        this.has = function(attrName) {
            return this.attributes[attrName] !== undefined;
        };

        this.on = function(eventNames, funct) {
            var eventNamesArray = eventNames.split(" ");

            _.each(eventNamesArray, function(eventName) {
                var array = this._eventsMap[eventName];

                if (array) {
                    array.push(funct);
                } else {
                    this._eventsMap[eventName] = [funct];
                }
            }, this);
        };

        this.off = function(eventNames, funct) {
            var eventNamesArray = eventNames.split(" ");

            _.each(eventNamesArray, function(eventName) {
                var array = this._eventsMap[eventName];

                if (array) {
                    var indexOf = array.indexOf(funct);

                    if (indexOf !== -1) {
                        array.splice(indexOf, 1);
                    }
                }
            }, this);
        };

        this.trigger = function(eventName) {
            if (this._eventsMap[eventName]) {
                _.each(this._eventsMap[eventName], function(funct) {
                    funct.call(this, this, this.attributes);
                }, this);
            }
        };

        if (this.initialize) {
            this.initialize();
        }
    };

    return CapiModel;
});
