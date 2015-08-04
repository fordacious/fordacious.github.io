define(function() {
    var Invisible = function() {
        this.model = null;
        this.renderer = null;
        this.propertyName = "";
        this.propertyValue = "";
        this.matching = true;
    };

    Invisible.prototype.start = function() {
        if(!this.renderer) { throw new Error("Renderer must be specified."); }
        if(!this.model) { throw new Error("Model must be specified."); }
        if(!this.propertyName) { throw new Error("Property name must be specified."); }

        toggleVisibility.call(this);
        this.model.on('change:' + this.propertyName, toggleVisibility, this);
    };

    Invisible.prototype.destroy = function() {
        if (this.model && this.model.off)
            this.model.off('change:' + this.propertyName, toggleVisibility, this);
    };

    function toggleVisibility() {
        var visible = this.model.getValue(this.propertyName) === this.propertyValue;
        if(!this.matching) {
            visible = !visible;
        }
        this.renderer.$el.toggle(visible);
    }

    return Invisible;
});