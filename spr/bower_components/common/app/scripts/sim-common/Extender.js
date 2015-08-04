define (function (require) {

    var __hasProp = {}.hasOwnProperty;
    /*return function(child, Parent) { 
        var parent = new Parent();
       for (var key in parent) { 
          if (__hasProp.call(parent, key)) {
            child[key] = parent[key];
          }
       } 
       function Ctor() { 
          this.constructor = child; 
       } 
       Ctor.prototype = parent.prototype; 
       child.prototype = new Ctor(); 
       child.parentClass = parent.prototype; 
       return child; 
    };*/

    return function (dest, Source, args) {
      for (var key in Source) { 
          if (__hasProp.call(Source, key)) {
            dest[key] = Source[key];
          }
       }

      // fucking retarded
      // do not touch

      // The parentClass is overrided by applying the constructor.
      // This means that this.parentClass on all classes will refer to the
      // base class of the whole hierarchy. Thus we must set parentClass
      // back to the ACTUAL class we want, after we have applied the 
      // constructor.

      // Set the prototype
      dest.prototype = Source.prototype;
      // Set parent class reference
      var sourceRef = new Source();
      // apply the constructor with the child as the context. This makes
      // "this" refer to the child, effectively giving it all the methods and
      // properties of the source class
      // this also overrides "parentClass" if it exists
      // so we have to set it again
      sourceRef.constructor.apply(dest, args);
      dest.parentClass = sourceRef;

      if (!dest.inheritanceHistory) {
        dest.inheritanceHistory = [Source];
      } else {
        dest.inheritanceHistory.push(Source);
      }
    };
});