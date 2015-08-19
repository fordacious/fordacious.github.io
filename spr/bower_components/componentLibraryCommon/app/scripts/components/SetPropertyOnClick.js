define(function() {
    var PropertySet = function() {
        this.renderer = null;
        this.model = null;
        this.propertyName = "";
        this.propertyValue = "";
    };

    PropertySet.prototype.start = function() {
        if(!this.renderer) { throw new Error('The renderer must be specified.'); }
        if(!this.model) { throw new Error('The model must be specified.'); }
        if(!this.propertyName) { throw new Error('The property name must be specified.'); }

        this._boundSetValue = setValue.bind(this);
        on.call(this);
    };

    PropertySet.prototype.destroy = function() {
        off.call(this);
    };

    PropertySet.prototype.disable = function(state){
        if(state) off.call(this);
        else on.call(this);

        this.renderer.$el.toggleClass("disabled", state);
    };

    function on(){
        if (this.renderer && this.renderer.$el && this.renderer.$el.on)
            this.renderer.$el.on('click', this._boundSetValue);
    }

    function off(){
        if (this.renderer && this.renderer.$el  && this.renderer.$el.off)
            this.renderer.$el.off('click', this._boundSetValue);
    }

    function setValue() {
        this.model.setValue(this.propertyName, this.propertyValue);
    }

    return PropertySet;
});