define(function() {
    var Toggler = function() {
        this.model = null;
        this.renderer = null;
        this.propertyName = "";
        this.propertyValue = "";
        this.matching = true;
        this.className = "";
    };

    Toggler.prototype.start = function() {
        if(!this.renderer) { throw new Error("Renderer must be specified."); }
        if(!this.model) { throw new Error("Model must be specified."); }
        if(!this.propertyName) { throw new Error("Property name must be specified."); }
        if(!this.className){ throw new Error('Class name must be specified.'); }

        toggleProperty.call(this);
        this.model.on('change:' + this.propertyName, toggleProperty, this);
    };

    Toggler.prototype.destroy = function() {
        if (this.model && this.model.off)
            this.model.off('change:' + this.propertyName, toggleProperty, this);
    };

    function toggleProperty() {
        var toggle = this.model.getValue(this.propertyName) === this.propertyValue;
        if(!this.matching) {
            toggle = !toggle;
        }
        this.renderer.$el.toggleClass(this.className, toggle);
    }

    return Toggler;
});