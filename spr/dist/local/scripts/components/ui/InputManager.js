/*globals document*/
define(function (require) {

    var $ = require('jquery');

    function initRegistry () {
        return {
            'keydown' : [],
            'keyup' : [],
            'mousedown' : [],
            'mousemove' : [],
            'mouseup' : []
        };
    }

    var InputManager = function () {
        this.container = null;
        this._keyboardState = {};
        this._mouseState = {
            x: 0,
            y: 0
        };
        this._eventRegistry = initRegistry();
        this._contextRegistry = initRegistry();
        this._lastTouchEvent = null;
    };

    InputManager.prototype.start = function() {
        if (!this.container) {
            this.container = $(document);
        } else {
            this.container = this.container.$el;
        }

        this._boundOnKeyDown = onKeyDown.bind(this);
        this._boundOnKeyUp = onKeyUp.bind(this);
        this._boundOnTouchDown = onTouchDown.bind(this);
        this._boundOnTouchMove = onTouchMove.bind(this);
        this._boundOnTouchUp = onTouchUp.bind(this);
        this._boundOnMouseDown = onMouseDown.bind(this);
        this._boundOnMouseMove = onMouseMove.bind(this);
        this._boundOnMouseUp = onMouseUp.bind(this);

        this.container.on('keydown', this._boundOnKeyDown);
        this.container.on('keyup', this._boundOnKeyUp);

        this.container.on('touchstart', this._boundOnTouchDown);
        this.container.on('touchmove', this._boundOnTouchMove);
        this.container.on('touchend', this._boundOnTouchUp);

        this.container.on('mousedown', this._boundOnMouseDown);
        this.container.on('mousemove', this._boundOnMouseMove);
        this.container.on('mouseup', this._boundOnMouseUp);
    };

    InputManager.prototype.destroy = function() {
        this.container.off('keydown', this._boundOnKeyDown);
        this.container.off('keyup', this._boundOnKeyUp);

        this.container.off('touchstart', this._boundOnTouchDown);
        this.container.off('touchmove', this._boundOnTouchMove);
        this.container.off('touchend', this._boundOnTouchUp);

        this.container.off('mousedown', this._boundOnMouseDown);
        this.container.off('mousemove', this._boundOnMouseMove);
        this.container.off('mouseup', this._boundOnMouseUp);
    };

    InputManager.prototype.on = function (evt, fn, context) {
        context = context || this.container.get(0);
        evt = evt.toLowerCase();
        if (!this._eventRegistry[evt]) {
            this.container.on(evt, fn, context);
        }

        var eReg = this._eventRegistry[evt];
        var cReg = this._contextRegistry[evt];

        for (var i = 0; i < eReg.length; i++) {
            if (eReg[i] === fn && cReg[i] === context) {
                return;
            }
        }

        eReg.unshift(fn);
        cReg.unshift(context);
    };

    InputManager.prototype.off = function (evt, fn, context) {
        evt = evt.toLowerCase();
        context = context || this.container.get(0);
        var eReg = this._eventRegistry[evt];
        var cReg = this._contextRegistry[evt];
        if (!eReg) {
            this.container.off(evt, fn, context);
        }
        for (var i = 0; i < eReg.length; i++) {
            if (eReg[i] === fn && cReg[i] === context) {
                this._eventRegistry[evt].splice(i,1);
                this._contextRegistry[evt].splice(i,1);
            }
        }
    };

    InputManager.prototype.getKeyDown = function (key) {
        return this._keyboardState[key] !== undefined ? this._keyboardState[key] : false;
    };

    InputManager.prototype.getMouseDown = function (button) {
        button = button || 0;
        return this._mouseState[button] !== undefined ? this._mouseState[button] : false;
    };

    InputManager.prototype.getMousePosition = function () {
        return {
            x: this._mouseState.x,
            y: this._mouseState.y
        };
    };

    InputManager.prototype.getMouseDragging = function () {
        return this.getMouseDown(0);
    };

    InputManager.prototype.dispatchEvent = function (evt, event) {
        for (var i in this._eventRegistry[evt]) {
            if (event.isPropagationStopped()) { break; }
            this._eventRegistry[evt][i].call(this._contextRegistry[evt][i], event);
        }
    };

    function onKeyDown (event) {
        this._keyboardState[event.keyCode] = true;
        this.dispatchEvent('keydown', event);
    }

    function onKeyUp (event) {
        this._keyboardState[event.keyCode] = false;
        this.dispatchEvent('keyup', event);
    }

    function onTouchDown (event) {
        event.pageX = event.originalEvent.touches[0].pageX;
        event.pageY = event.originalEvent.touches[0].pageY;
        event.button = 0;
        onMouseDown.call(this,event);
    }

    // need to store the latest touch event to make sure we know the position on touchend
    function onTouchMove (event) {
        event.pageX = event.originalEvent.touches[0].pageX;
        event.pageY = event.originalEvent.touches[0].pageY;
        event.button = 0;
        this._lastTouchMoveEvent = event;
        onMouseMove.call(this,event);
    }

    function onTouchUp (event) {
        event.pageX = this._lastTouchMoveEvent.pageX;
        event.pageY = this._lastTouchMoveEvent.pageY;
        event.button = 0;
        onMouseUp.call(this,event);
    }

    function onMouseDown (event) {
        this._mouseState.x = event.pageX;
        this._mouseState.y = event.pageY;
        this._mouseState[event.button] = true;
        this.dispatchEvent('mousedown', event);
    }

    function onMouseMove (event) {
        event.deltaX = event.pageX - this._mouseState.x;
        event.deltaY = event.pageY - this._mouseState.y;
        this._mouseState.x = event.pageX;
        this._mouseState.y = event.pageY;
        this.dispatchEvent('mousemove', event);
    }

    function onMouseUp (event) {
        this._mouseState.x = event.pageX;
        this._mouseState.y = event.pageY;
        this._mouseState[event.button] = false;
        this.dispatchEvent('mouseup', event);
    }

    return InputManager;

});