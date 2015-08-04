define(function(require) {
    var $ = require('jquery');

    var OnDrop = function() {
        this.droppable = null;
        this.targetComponentName = null;
        this.targetFunctionName = null;
    };

    OnDrop.prototype.start = function() {
        $(this.droppable).on('drop', executeComponentBehavior.bind(this));
    };

    OnDrop.prototype.destroy = function() {
        if (this.droppable && $(this.droppable).off)
            $(this.droppable).off('drop', executeComponentBehavior.bind(this));
    };

    function executeComponentBehavior(event, droppedEntity, droppedUI) {
        droppedEntity[this.targetComponentName][this.targetFunctionName](droppedEntity);
    }

    return OnDrop;
});