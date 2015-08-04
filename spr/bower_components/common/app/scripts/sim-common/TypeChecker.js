// checks the type of an object by rummaging through its inheritance history
// might be faster to store inheritanceHistory as a map with functions as the key
// might be overkill though
define (function (require) {

  return { isInstanceOf : function (object, type) {

    // go through its inheritance history, if we find the type, return true, otherwise false
    if (!object.inheritanceHistory) {
      return object.parentClass instanceof type;
    }
    var l = object.inheritanceHistory.length;
    for (var i = 0; i < l; i++) {
      if (object.inheritanceHistory[i] === type) {
        return true;
      }
    }

    // in case the object itself if of the type
    if (object instanceof type) {
      return true;
    }

    return false;

  }};
});