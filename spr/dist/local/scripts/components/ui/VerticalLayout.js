define(function (require){

    var $ = require('jquery');

    var VerticalLayout = function () {
        this.container = null;
        this.children = [];

        defineProp.call(this, "enabled", true);

        defineProp.call(this, "xOffset", 0);
        defineProp.call(this, "yOffset", 0);
    };

    VerticalLayout.prototype.start = function () {
        this._needsUpdate = true;
    };

    VerticalLayout.prototype.update = function () {
        if (this._needsUpdate) {
            setLayoutProperties.call(this);
            this._needsUpdate = false;
        }
    };

    function setLayoutProperties () {
        if (!this.enabled) { return; }
        var cl = this.children.length;
        for (var i = 0; i < cl; i++) {
            var child = this.children[i];
            child.position.x = this.xOffset + this.container.x + ((this.container.x + this.container.width) - this.container.x) / 2;
            child.position.y = this.yOffset + this.container.y + ((this.container.y + this.container.height) - this.container.y) / (cl + 1) * (i + 1);
        }
    }

    function defineProp (propname, initialValue) {
        var _prop;
        Object.defineProperty(this, propname, {
            get: function () {
                return _prop;
            },
            set: function (value) {
                this.needUpdate = true;
                _prop = value;
            }
        });
        this[propname] = initialValue;
    }

    return VerticalLayout;
});