define(function (require) {
   
    var LayoutSwitcher = function () {
        this.modeModel = null;
        this.modeKey = null;
        this.values = null;
        this.layouts = null;
    };

    LayoutSwitcher.prototype.start = function () {
        this.modeModel.on("change:" + this.modeKey, onModeChange, this);
        onModeChange.call(this);
    };

    LayoutSwitcher.prototype.destroy = function () {
        this.modeModel.off(null, null, this);
    };

    function onModeChange () {
        var currentValue = this.modeModel.getValue(this.modeKey);
        for (var i = 0; i < this.values.length; i ++) {
            this.layouts[i].enabled = this.values[i] === currentValue;
        }
    }

    return LayoutSwitcher;
});