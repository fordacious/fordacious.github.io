define(function(require){

    var $ = require('jquery');

    var DragEventRouter = function () {
        this.inputManager = null;
        this.dragger = null;
        this.DNAController = null;
        this.threshold = 20;

        this._lockedVertical = false;
    };

    DragEventRouter.prototype.start = function() {
        this._onDragStart = onDragStart.bind(this);
        this._onDrag = onDrag.bind(this);

        $(this.dragger).on('dragstart', this._onDragStart);
        $(this.dragger).on('drag', this._onDrag);
    };

    DragEventRouter.prototype.destroy = function() {
        $(this.dragger).off('dragstart', this._onDragStart);
        $(this.dragger).off('drag', this._onDrag);
    };

    function onDragStart () {
        this._originX = this.inputManager.getMousePosition().x;
        this._originY = this.inputManager.getMousePosition().y;
        this._lockedVertical = false;
        this.dragger.verticalEnabled = true;
    }

    // TODO drag the nucleotide out, but have it snap back to its target position on drag end
    function onDrag () {
        var mouse = this.inputManager.getMousePosition();
        if (Math.abs(this._originY - mouse.y) > this.threshold * 2) {
            this._lockedVertical = true;
        }
        if (!this._lockedVertical && Math.abs(mouse.x - this._originX) > this.threshold) {
            if (this.DNAController.dragNucleotideAtPosition({x: this._originX, y: mouse.y})) {
                this.dragger.verticalEnabled = false;
            }
        }
    }

    return DragEventRouter;

});