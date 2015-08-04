/*globals console*/
define(function (require) {

  var Backbone = require('backbone');
  var check    = require('check');
  var _        = require('underscore');

  // Cached so its not looked up every time
  var stringType = typeof "asdf";
  var objType    = typeof {};

  var SparrowModel = Backbone.Model.extend({
    //flag for warnings.
    debug: false,

    has: function(attr) {
      return _.has(this.attributes, attr);
    },
    // Returns a value after checking it exists first
    get : function (attr) {
      var val = this.attributes[attr];

      if (!_.has(this.attributes, attr)) {
        throw new Error (
            attr + " is not defined in this model"
          );
      }

      return val;
    },

    // Sets a value after checking it exists, 
    // value is defined and
    // value matches the type
    set : function (prop, value) {

      var mustCreate = false;

      var propType = typeof prop;

      // If is object, set each property individually
      if (propType === objType) {
        this.setMultipleProperties (prop);

        return;
      }

      // If property is undefined, throw warning
      if (!_.has(this.attributes, prop)) {
        if(this.debug){
          console.warn(prop + " does not exist in this model, creating attribute");
        }
        
        mustCreate = true;
      }

      // If we are trying to set it to something undefined, throw error
      /*if (value === undefined) {
        throw new Error (
            prop + " is undefined"
          );
      }*/

      if (!mustCreate) {

        var valType  = typeof value;
        var attrType = typeof this.attributes[prop];
        var prevValue = this._previousAttributes[prop];

        // If types dont match, throw error
        if ((valType !== attrType && prevValue !== undefined) || (prevValue === null && valType !== "object")) {
          throw new TypeError (
              "Type of " + prop + " does not match supplied type (should be " + attrType + ", recieved " + valType + ")"
            );
        }

        // check(value).isOfType(this.attributes[prop].constructor);
      }

      return Backbone.Model.prototype.set.call(this, prop, value);

    },

    setMultipleProperties : function (propsObj) {
      for (var i in propsObj) {
        this.set(i, propsObj[i]);
      }
    }

  });

  return SparrowModel;

});