define(function (require){
    var $ = require('jquery');

    var ThreeDObjectUtils = require('componentLibrary3D/utils/ThreeDObjectUtils');

    var ThreeDDragger = function () {
        this.renderer = null;
        this.inputManager = null;
        this.clone = false;
        this.cloneFactory = null;
        this.horizontalEnabled = true;
        this.verticalEnabled = true;
        this.minX = -Infinity;
        this.maxX = Infinity;
        this.minY = -Infinity;
        this.maxY = Infinity;
    };

    ThreeDDragger.prototype.start = function (){
        this.inputManager.on('mousedown', onMouseDown, this);
    };

    ThreeDDragger.prototype.startDragging = function (){
        onDragStart.call(this);
    };

    ThreeDDragger.prototype.destroy = function () {
        this.inputManager.off('mousedown', onMouseDown, this);
        this.inputManager.off('mousemove', onDrag, this);
        this.inputManager.off('mouseup', onDragEnd, this);
    };

    ThreeDDragger.prototype.isDragging = function (){
        return !!this._draggingMesh;
    };

    var onMouseDown = function (e) {
        var bb = ThreeDObjectUtils.GetBoundingBox(this.renderer);
        if ((e.pageX > bb.min.x && e.pageX < bb.max.x) && (e.pageY > bb.min.y && e.pageY < bb.max.y)) {
            onDragStart.call(this);
            e.stopPropagation();
        }
    };

    var onDrag = function (e) {
        var dragged = false;
        if (this.horizontalEnabled) {
            this._draggingMesh.position.x += e.deltaX;
            dragged = dragged || e.deltaX !== 0;
        }
        if (this.verticalEnabled) {
            this._draggingMesh.position.y += e.deltaY;
            dragged = dragged || e.deltaY !== 0;
        }

        if (dragged) {
            constrain(this._draggingMesh, this.minX, this.maxX, this.minY, this.maxY);
            $(this).trigger('drag');
        }
    };

    var onDragEnd = function (e) {

        this.inputManager.off('mousemove', onDrag, this);
        this.inputManager.off('mouseup', onDragEnd, this);

        var pos = this._draggingMesh.position;
        var entity = this._draggingMesh.entity;

        this._draggingMesh = null;

        var event = $.Event('drop');
        event.pageX = e.pageX;
        event.pageY = e.pageY;
        $(this).trigger(event, [entity]);
    };

    var onDragStart = function () {
        if (this.clone) {
            var clone = this.cloneFactory.create().renderer;
            this._draggingMesh = clone;

            clone.position.x = this.renderer.position.x;
            clone.position.y = this.renderer.position.y;
            clone.position.z = 50;
        } else {
            this._draggingMesh = this.renderer;
        }

        this.inputManager.on('mousemove', onDrag, this);
        this.inputManager.on('mouseup', onDragEnd, this);

        $(this).trigger('dragstart');
    };

    function constrain (mesh, minx, maxx, miny, maxy) {
        mesh.position.x = Math.max(mesh.position.x, minx);
        mesh.position.x = Math.min(mesh.position.x, maxx);
        mesh.position.y = Math.max(mesh.position.y, miny);
        mesh.position.y = Math.min(mesh.position.y, maxy);
    }

    return ThreeDDragger;
});