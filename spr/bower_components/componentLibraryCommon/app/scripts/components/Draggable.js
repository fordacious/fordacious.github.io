define(function(require) {
    require("jquery-ui-draggable");

    var Draggable = function() {
        this.renderer = null;
        this.config = {};
    };

    Draggable.prototype.start = function() {
        if(!this.renderer) { throw new Error("Renderer must be specified."); }

        this.renderer.$el.data('entity', this.entity);
        this.renderer.$el.draggable(this.config);
    };

    Draggable.prototype.destroy = function() {
        if (this.renderer && this.renderer.$el && this.renderer.$el.data('ui-draggable'))
            this.renderer.$el.draggable('destroy');
    };

    return Draggable;
});