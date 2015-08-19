define(function(require){
    var $ = require('jquery');
    var SceneManager = require('SceneManager');

    var measureUnit = 'px';
    var rotationUnit = 'deg';
    var skewUnit = 'deg';

    var translateRegExp = /translate3d\s*\(\s*([0-9]+)px,\s*?([0-9]+)px.*\)/;
    var rotationRegExp = /rotate3d\s*\(\s*0\s*,\s*0\s*,\s*1\s*,\s*([0-9]+)deg\s*\)/;
    var scaleRegExp = /scale3d\s*\(\s*([0-9]+),\s*([0-9]+).*\)/;
    var skewXRegExp = /skewX\s*\(\s*([0-9]+)deg\s*\)/;
    var skewYRegExp = /skewY\s*\(\s*([0-9]+)deg\s*\)/;

    var translateRegExp_ie9 = /translate\s*\(\s*([0-9]+)px,\s*?([0-9]+)px\s*\)/;
    var rotationRegExp_ie9 = /rotate\s*\(\s*([0-9]+)deg\s*\)/;
    var scaleRegExp_ie9 = /scale\s*\(\s*([0-9]+),\s*([0-9]+).*\)/;

    var HtmlRenderer = function(){
        this.parent = null;
        this.type = 'div';
        this.attributes = {};

        this.x = null;
        this.y = null;
        this.z = null;

        this.rotation = null;

        this.scaleX = null;
        this.scaleY = null;

        this.skewX = null;
        this.skewY = null;

        this.width = null;
        this.height = null;

        this.alpha = null;
    };

    HtmlRenderer.prototype.initialize = function(){
        createElement.call(this);
    };

    HtmlRenderer.prototype.start = function(){
        checkParent.call(this);
        bindCss.call(this);

        this.parent.$el.append(this.$el);
    };

    HtmlRenderer.prototype.syncFromCss = function(){
        var position = getTranslation(this.$el);
        var rotation = getRotation(this.$el).rotation;
        var scale = getScale(this.$el);
        var skew = getSkew(this.$el);

        this.x = position.x;
        this.y = position.y;
        this.z = sanitizeInteger(this.$el.get(0).style['z-index']);

        this.rotation = sanitizeNumber(rotation);

        this.scaleX = sanitizeNumber(scale.x);
        this.scaleY = sanitizeNumber(scale.y);

        this.skewX = sanitizeNumber(skew.x);
        this.skewY = sanitizeNumber(skew.y);

        this.width = sanitizeNumber(this.$el.get(0).style.width);
        this.height = sanitizeNumber(this.$el.get(0).style.height);
        this.alpha = sanitizeNumber(this.$el.get(0).style.opacity);
    };

    HtmlRenderer.prototype.destroy = function(){
        if(!this.$el){ return; }
        this.$el.remove();
    };

    var checkParent = function(){
        if(this.parent && this.parent.$el){ return; }
        this.parent = SceneManager.ActiveScene;
    };

    var createElement = function(){
        this.$el = $('<' + this.type + '/>');

        if(this.class){ this.$el.addClass(this.class); }

        for(var i in this.attributes){
            this.$el.prop(i, this.attributes[i]);
        }
    };

    var bindCss = function(){
        var _x = this.x,
            _y = this.y,
            _z = this.z,

            _rotation = this.rotation,

            _scaleX = this.scaleX,
            _scaleY = this.scaleY,
            _skewX = this.skewX,
            _skewY = this.skewY,

            _width = this.width,
            _height = this.height,

            _alpha = this.alpha,

            _forceValues = !!this.forceValues;

        Object.defineProperty(this, 'forceValues', {
            get: function(){ return _forceValues; },
            set: function(forceValues){ _forceValues = !!forceValues; }
        });

        Object.defineProperty(this, 'x', {
            get: function(){ return _x; },
            set: function(x){
                var sanitizedX = sanitizeNumber(x);
                if(_x === sanitizedX && !_forceValues) return;

                _x = sanitizedX;
                setTransform(this.$el, _x, _y, _rotation, _scaleX, _scaleY, _skewX, _skewY);
            }
        });

        Object.defineProperty(this, 'y', {
            get: function(){ return _y; },
            set: function(y){
                var sanitizedY = sanitizeNumber(y);
                if(_y === sanitizedY && !_forceValues) return;

                _y = sanitizedY;
                setTransform(this.$el, _x, _y, _rotation, _scaleX, _scaleY, _skewX, _skewY);
            }
        });

        Object.defineProperty(this, 'z', {
            get: function(){ return _z; },
            set: function(z){
                var sanitizedZ = sanitizeInteger(z);
                if(_z === sanitizedZ && !_forceValues) return;

                _z = sanitizedZ;
                this.$el.css('z-index', _z === null ? '' : _z);
            }
        });

        Object.defineProperty(this, 'rotation', {
            get: function(){ return _rotation; },
            set: function(rotation){
                var sanitizedRotation = sanitizeNumber(rotation);
                if(_rotation === sanitizedRotation && !_forceValues) return;

                _rotation = sanitizedRotation;
                setTransform(this.$el, _x, _y, _rotation, _scaleX, _scaleY, _skewX, _skewY);
            }
        });

        Object.defineProperty(this, 'scaleX', {
            get: function(){ return _scaleX; },
            set: function(scaleX){
                var sanitizedScaleX = sanitizeNumber(scaleX);
                if(_scaleX === sanitizedScaleX && !_forceValues) return;

                _scaleX = sanitizedScaleX;
                setTransform(this.$el, _x, _y, _rotation, _scaleX, _scaleY, _skewX, _skewY);
            }
        });

        Object.defineProperty(this, 'scaleY', {
            get: function(){ return _scaleY; },
            set: function(scaleY){
                var sanitizedScaleY = sanitizeNumber(scaleY);
                if(_scaleY === sanitizedScaleY && !_forceValues) return;

                _scaleY = sanitizedScaleY;
                setTransform(this.$el, _x, _y, _rotation, _scaleX, _scaleY, _skewX, _skewY);
            }
        });

        Object.defineProperty(this, 'skewX', {
            get: function(){ return _skewX; },
            set: function(skewX){
                var sanitizedSkewX = sanitizeNumber(skewX);
                if(_skewX === sanitizedSkewX && !_forceValues) return;

                _skewX = sanitizedSkewX;
                setTransform(this.$el, _x, _y, _rotation, _scaleX, _scaleY, _skewX, _skewY);
            }
        });

        Object.defineProperty(this, 'skewY', {
            get: function(){ return _skewY; },
            set: function(skewY){
                var sanitizedSkewY = sanitizeNumber(skewY);
                if(_skewY === sanitizedSkewY && !_forceValues) return;

                _skewY = sanitizedSkewY;
                setTransform(this.$el, _x, _y, _rotation, _scaleX, _scaleY, _skewX, _skewY);
            }
        });


        Object.defineProperty(this, 'width', {
            get: function(){ return _width; },
            set: function(width){
                var sanitizedWidth = sanitizeNumber(width);
                if(_width === sanitizedWidth && !_forceValues) return;

                _width = sanitizedWidth;
                this.$el.css('width', _width === null ? '' : _width + measureUnit);
            }
        });

        Object.defineProperty(this, 'height', {
            get: function(){ return _height; },
            set: function(height){
                var sanitizedHeight = sanitizeNumber(height);
                if(_height === sanitizedHeight && !_forceValues) return;

                _height = sanitizedHeight;
                this.$el.css('height', _height === null ? '' : _height + measureUnit);
            }
        });

        Object.defineProperty(this, 'alpha', {
            get: function(){ return _alpha; },
            set: function(alpha){
                var sanitizedAlpha = sanitizeNumber(alpha);
                if(_alpha === sanitizedAlpha && !_forceValues) return;

                _alpha = sanitizedAlpha;
                this.$el.css('opacity', _alpha === null ? '' : _alpha);
            }
        });

        var originalForceValues = _forceValues;
        _forceValues = true;
        this.x = _x;
        this.y = _y;
        this.z = _z;

        this.rotation = _rotation;
        this.scaleX = _scaleX;
        this.scaleY = _scaleY;
        this.skewX = _skewX;
        this.skewY = _skewY;

        this.width = _width;
        this.height = _height;

        this.alpha = _alpha;

        _forceValues = originalForceValues;
    };

    function setTransform($element, x, y, rotation, scalex, scaley, skewx, skewy) {
        var transformCSS = '';
        var transformCSS_ie9 = '';
        if(x !== null || y !== null || rotation !== null || scalex !== null || scaley !== null || skewx !== null || skewy !== null){
            transformCSS = 'translate3d(' + (x || 0) + measureUnit +', ' + (y || 0) + measureUnit + ', 0px) ' +
                        'rotate3d(0, 0, 1, ' + (rotation || 0) + rotationUnit + ') ' +
                        'scale3d(' + (scalex || 1) + ', ' + (scaley || 1) + ', 1) ' +
                        'skewX(' + (skewx || 0) + skewUnit + ') ' +
                        'skewY(' + (skewy || 0) + skewUnit + ')';
            transformCSS_ie9 = 'translate(' + (x || 0) + measureUnit +', ' + (y || 0) + measureUnit + ') ' +
                        'rotate(' + (rotation || 0) + rotationUnit + ') ' +
                        'scale(' + (scalex || 1) + ', ' + (scaley || 1) + ') ' +
                        'skewX(' + (skewx || 0) + skewUnit + ') ' +
                        'skewY(' + (skewy || 0) + skewUnit + ')';
        }

        $element.css({ 'transform' : transformCSS });
        $element.css({ '-webkit-transform' : transformCSS });
        $element.css({ '-ms-transform' : transformCSS_ie9 });
    }

    function getTransformRegex ($element, re) {
        var transform = $element.css('transform') || $element.css('-webkit-transform') || $element.css('-ms-transform');
        return (new RegExp(re)).exec(transform);
    }

    function getTranslation($element) {
        var matches = getTransformRegex($element, translateRegExp);
        if(matches){
            return { x: matches[1], y: matches[2] };
        }
        matches = getTransformRegex($element, translateRegExp_ie9);
        if(matches){
            return { x: matches[1], y: matches[2] };
        }
        return { x: null, y: null };
    }

    function getRotation ($element) {
        var matches = getTransformRegex($element, rotationRegExp);
        if(matches){
            return { rotation: matches[1] };
        }
        matches = getTransformRegex($element, rotationRegExp_ie9);
        if(matches){
            return { rotation: matches[1] };
        }
        return { rotation: null };
    }

    function getScale ($element) {
        var matches = getTransformRegex($element, scaleRegExp);
        if(matches){
            return { x: matches[1], y: matches[2] };
        }
        matches = getTransformRegex($element, scaleRegExp_ie9);
        if(matches){
            return { x: matches[1], y: matches[2] };
        }
        return { x: null, y: null };
    }

    function getSkew ($element) {
        var matchesX = getTransformRegex($element, skewXRegExp);
        var matchesY = getTransformRegex($element, skewYRegExp);
        var x = null;
        var y = null;
        if(matchesX){
            x = matchesX[1];
        }
        if(matchesY){
            y = matchesY[1];
        }
        return {x:x,y:y};
    }

    function sanitizeNumber(number){
        if(number === null || number === undefined || isNaN(parseFloat(number))) return null;
        else return parseFloat(number);
    }

    function sanitizeInteger(number){
        if(number === null || number === undefined || isNaN(parseInt(number, 10))) return null;
        else return parseInt(number, 10);
    }

    return HtmlRenderer;
});