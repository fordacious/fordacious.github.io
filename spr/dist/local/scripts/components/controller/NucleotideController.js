define(function (require){

    var $ = require('jquery');
    var THREE = require('threejs');

    var Modes = require('constants/Mode');
    var NucleotideFactory = require('factory/NucleotideFactory');
    var ThreeDObjectUtils = require('componentLibrary3D/utils/ThreeDObjectUtils');

    var NucleotideController = function () {
        this.renderer = null;
        this.draggable = null;
        this.base = null;
        this.toolboxRenderer = null;
        this.isToolboxNucleotide = false;
        this.DNAController = null;
        this.modeModel = null;
        this.modeKey = null;
    };

    NucleotideController.prototype.start = function () {
        this.modeModel.on("change:" + this.modeKey, onModeChange, this);
        this._onDrop = onDrop.bind(this);
        $(this.draggable).on('drop', this._onDrop);
        render.call(this);
        onModeChange.call(this);
    };

    NucleotideController.prototype.destroy = function () {
        this.modeModel.off(null, null, this);
        $(this.draggable).off('drop', this._onDrop);
    };

    function onModeChange () {
        setPositionRotation.call(this);
    }

    function setPositionRotation () {
        var rot = NucleotideFactory.GetNucleotideRotation();
        if (this.modeModel.getValue(this.modeKey) === Modes.SINGLE_STRAND) {
            this._meshComponent.rotation.y = rot.y;
            this._meshComponent.rotation.z = rot.z;
        } else if (this.modeModel.getValue(this.modeKey) === Modes.DOUBLE_STRAND) {
            this._meshComponent.rotation.y = rot.y + Math.PI;
            this._meshComponent.rotation.z = rot.z + Math.PI;
        }
    }

    function render () {
        this._meshComponent = NucleotideFactory.CreateNucleotideOnEntity(this.entity, this.renderer, this.base, this.modeModel.getValue(this.modeKey) === Modes.DOUBLE_STRAND);
    }

    function onDrop (event, entity) {
        var renderer = entity.renderer;
        var pos = {x: renderer.position.x, y: renderer.position.y};
        var bb = ThreeDObjectUtils.GetBoundingBox(renderer);
        bb.min.z = 0;
        bb.max.z = 0;
        var toolboxBB = new THREE.Box3(
            new THREE.Vector3(this.toolboxRenderer.x, this.toolboxRenderer.y, 0),
            new THREE.Vector3(this.toolboxRenderer.x + this.toolboxRenderer.width, this.toolboxRenderer.y + this.toolboxRenderer.height, 0)
        );
        if (bb.isIntersectionBox(toolboxBB) || this.DNAController.addNucleotide(pos, this.base)) {
            entity.destroy();
        }
    }

    return NucleotideController;
});