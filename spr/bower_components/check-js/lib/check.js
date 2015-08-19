/**
 * This is used to check types during runtime.
 */

(function(global, module, exports) {

  var verify = function(val, type) {
    // constructor is for primitive types (Number, String...)
    // instanceof is for custom types ($...)
    return ((val !== undefined && val !== null) && type &&
      (val.constructor === type || val instanceof type));
  };

  var throwError = function(msg, val, type) {
    if (msg) {
      throw new Error(msg);
    }

    var typeName = type.constructor.toString();
    typeName = (typeof type).length < typeName.length ?
        typeof type : typeName;

    throw new Error('Expected: ' + type.name
      + '. Actual : '
      + (val ? val.constructor.name : val));
  };

  var _check = function(val, type, options) {
    var res = false;

    if (options.each) {
      // verify with iteration of object or array
      var filter = options.filterFn || function(){ return true; };

      res = verify(val, Object) || verify(val, Array);
      // iterateable
      if (res) {
        for (var key in val) {
          if (filter(val[key], key)) {
            res = res && verify(val[key], type);

            if (!res && options.strict) {
              throwError(options.msg, val, type);
            }
          }
        }

      } else if (options.strict) {
        // neither object or array
        throwError(options.msg, arg, type);
      }

    } else {
      // verify a single value
      res = verify(val, type);
      if (!res && options.strict) {
        throwError(options.msg, val, type);
      }
    }

    return res;
  };

  // check if the value is defined. not null or undefined
  var _isDefined = function(val, options, undefined) {
    if (val === undefined || val === null) {
      if (options.strict) {
        throwError(options.msg, val, undefined);
      }
      return false;
    }
    return true;
  };

  var check = function(val) {
    var options = { strict : true };

    // if verification is turned off, return a null
    // version of ourself
    if (!check.globals.on) {
      var chainFn = function() { return this; };
      var trueFn = function() { return true; };
      return {
        isString : trueFn, isNumber : trueFn, isBoolean : trueFn,
        isArray : trueFn, isObject : trueFn, isFunction : trueFn,
        isOfType : trueFn, strict : chainFn, passive : chainFn,
        each : chainFn, msg : chainFn, isDefined : trueFn
      };
    }

    return {
      isString : function() {
        return _check(val, String, options);
      },
      isNumber : function() {
        return _check(val, Number, options);
      },
      isBoolean : function() {
        return _check(val, Boolean, options);
      },
      isArray : function() {
        return _check(val, Array, options);
      },
      isObject : function() {
        return _check(val, Object, options);
      },
      isFunction : function() {
        return _check(val, Function, options);
      },
      isOfType : function(type) {
        return _check(val, type, options);
      },
      isDefined : function() {
        return _isDefined(val, options);
      },
      strict : function() {
        options.strict = true;
        return this;
      },
      passive : function() {
        options.strict = false;
        return this;
      },
      each : function(filterFn) {
        options.each = true;
        options.filterFn = filterFn;
        return this;
      },
      msg : function(msg) {
        options.msg = msg;
        return this;
      }
    };
  };

  // global properties
  check.globals = {
    on : true // true -> verification
  };

  // Exports
  if ('undefined' === typeof module) {
    module = { exports : {} };
    exports = module.exports;
  }
  if ('function' === typeof define && define.amd) {
    define('check', [], function() { return check; });
  }
  exports = module.exports = check;
  if ('undefined' !== typeof window) {
    window.check = module.exports;
  }

})(this,
  'undefined' !== typeof module ? module : {},
  'undefined' !== typeof exports ? exports : {}
);
