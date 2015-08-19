define(function(require) {
    var $ = require('jquery');
    require('jquery-ui-droppable');
    var SceneManager = require('SceneManager');

    var Droppable = function() {
        this.renderer = null;
        this.config = {};
    };

    Droppable.prototype.start = function() {
        if(!this.renderer) { this.renderer = SceneManager.ActiveScene; }

        this.boundDrop = dropped.bind(this);
        var config = $.extend(true, { drop: this.boundDrop }, this.config);
        this.renderer.$el.droppable(config);
    };

    Droppable.prototype.destroy = function() {
        if (this.renderer && this.renderer.$el && this.renderer.$el.data('ui-droppable'))
            this.renderer.$el.droppable('destroy');
    };

    function dropped(event, droppedElement) {
        $(this).trigger('drop', [ $(droppedElement.draggable).data('entity'), droppedElement ]);
    }

    return Droppable;
});