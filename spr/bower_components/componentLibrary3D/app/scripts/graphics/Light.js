define(function(require){
    var THREE = require('threejs');

    var ThreeDTransformObject = require('../utils/ThreeDTransformObject');

    var MathConverter = require('../utils/Math');

    var Light = function(){
        this.type = null;
        this.parent = null;

        ThreeDTransformObject.initialize3DAccessors(this, "light");

        createIntensityAccessor.call(this, 1);
    };

    Light.AMBIENT_LIGHT = "AmbientLight";
    Light.AREA_LIGHT = "AreaLight";
    Light.DIRECTIONAL_LIGHT = "DirectionalLight";
    Light.HEMISPHERE_LIGHT = "HemisphereLight";
    Light.POINT_LIGHT = "PointLight";
    Light.SPOT_LIGHT = "SpotLight";

    var lightTypes = [Light.AMBIENT_LIGHT, Light.AREA_LIGHT, Light.DIRECTIONAL_LIGHT, Light.HEMISPHERE_LIGHT, Light.POINT_LIGHT, Light.SPOT_LIGHT];

    Light.prototype.initialize = function(){
        if(!this.parent){ throw new Error('parent must be given'); }
        validateLightType(this.type);

        this.light = createLightType(this.type, this.color);

        this.light.position.set(this.position.x, this.position.y, this.position.z);
        this.light.rotation.set(this.rotation.x, this.rotation.y, this.rotation.z);
        this.light.intensity = this.intensity;
    };

    Light.prototype.start = function(){
        this.parent.add(this.light);
    };

    function validateLightType(type){
        if(lightTypes.indexOf(type) === -1){
            throw new Error('invalid type was given');
        }
    }

    function createLightType(type, color){
        return new THREE[type](color);
    }

    function createIntensityAccessor(intensity){
        var _intensity = null;

        Object.defineProperty(this, "intensity", {
            get: function(){
                return _intensity;
            },
            set: function(intensity){
                _intensity = intensity;
                if(this.light){ this.light.intensity = _intensity; }
            }
        });

        this.intensity = intensity;
    }

    return Light;
});