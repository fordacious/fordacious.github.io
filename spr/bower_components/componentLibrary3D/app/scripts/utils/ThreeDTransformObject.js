define(function (require) {

    function initialize3DAccessors (obj, threejsObjName) {
        createPositionAccessor(obj, {x:0,y:0,z:0}, threejsObjName);
        createRotationAccessor(obj, {x:0,y:0,z:0}, threejsObjName);
        createScaleAccessor(obj, {x:1,y:1,z:1}, threejsObjName);
        return obj;
    }

    function createPositionAccessor(obj, position, threejsObjName){
        var _position = null;

        Object.defineProperty(obj, "position", {
            get: function(){
                return _position;
            },
            set: function(position){
                _position = position;
                createAxisAccessors(obj, _position, 'position', threejsObjName);
            }
        });

        obj.position = position;
    }

    function createRotationAccessor(obj, rotation, threejsObjName){
        var _rotation = null;

        Object.defineProperty(obj, "rotation", {
            get: function(){
                return _rotation;
            },
            set: function(rotation){
                _rotation = {};
                createAxisAccessors(obj, _rotation, 'rotation', threejsObjName);
                for (var i in rotation) {
                    _rotation[i] = rotation[i];
                }
            }
        });

        obj.rotation = rotation;
    }

    function createScaleAccessor(obj, scale, threejsObjName){
        var _scale = null;

        Object.defineProperty(obj, "scale", {
            get: function(){
                return _scale;
            },
            set: function(scale){
                _scale = scale;
                createAxisAccessors(obj, _scale, 'scale', threejsObjName);
            }
        });

        obj.scale = scale;
    }

    function createAxisAccessors(obj, object, type, threejsObjName){
        var _x = object.x, _y = object.y, _z = object.z;

        Object.defineProperty(object, "x", {
            get: function(){
                return _x;
            },
            set: function(x){
                _x = x;
                if(obj[threejsObjName]) {
                    obj[threejsObjName][type].x = x;
                }
            }
        });

        Object.defineProperty(object, "y", {
            get: function(){
                return _y;
            },
            set: function(y){
                _y = y;
                if(obj[threejsObjName]) {
                    obj[threejsObjName][type].y = y;
                }
            }
        });

        Object.defineProperty(object, "z", {
            get: function(){
                return _z;
            },
            set: function(z){
                _z = z;
                if(obj[threejsObjName]) {
                    obj[threejsObjName][type].z = z;
                }
            }
        });
    }

    return {
        initialize3DAccessors: initialize3DAccessors
    };
});