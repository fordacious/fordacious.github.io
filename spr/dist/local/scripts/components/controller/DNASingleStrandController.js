define(function(require){

    var $ = require('jquery');
    var THREE = require('threejs');

    var ThreeDObjectUtils = require('componentLibrary3D/utils/ThreeDObjectUtils');
    var NucleotideFactory = require('factory/NucleotideFactory');
    var DNA = require('constants/DNA');
    var Modes = require('constants/Mode');

    var rotationRate = 36 / 180 * Math.PI;
    var initialRotation = -Math.PI / 2;
    var spacing = 50;
    var bulgeAmount = 20;
    var snapToleranceX = 20;
    var snapToleranceY = 50;

    var DNASingleStrandController = function () {
        this.inputManager = null;
        this.renderer = null;
        this.strandModel = null;
        this.strand1Key = null;
        this.toolboxRenderer = null;
        this.nucleotideFactory = null;
        this.dragger = null;

        this._strandComponents = [];
        this._strandDragger = null;
    };

    DNASingleStrandController.prototype.start = function () {
        this.strandModel.on("change:" + this.strand1Key, renderStrand, this);

        this._draggerOriginalMinY = this.dragger.minY;

        this.update();

        renderStrand.call(this);
    };

    DNASingleStrandController.prototype.update = function (ts) {
        this.dragger.minY = this._draggerOriginalMinY - spacing * (this.strandModel.getValue(this.strand1Key).length - 1);
    };

    DNASingleStrandController.prototype.destroy = function () {
        removeStrandComponents.call(this);
        this.strandModel.off(null, null, this);
    };

    DNASingleStrandController.prototype.addNucleotide = function (pos, base) {
        var newStrand = testStrandCollision.call(this, pos, base, this.strandModel.getValue(this.strand1Key));
        if (newStrand.length > this.strandModel.getValue(this.strand1Key).length) {
            this.strandModel.setValue(this.strand1Key, newStrand);
            return true;
        }
        return false;
    };

    var renderStrand = function () {
        var s1 = this.strandModel.getValue(this.strand1Key);

        recreateStrandComponents.call(this, s1.length);

        for (var i = 0 ; i < this.strandModel.getValue(this.strand1Key).length; i ++) {
            if (this.strandModel.getValue(this.strand1Key)[i] === DNA.NONE) {
                continue;
            }

            var mesh = NucleotideFactory.CreateNucleotideOnEntity(this.entity, this._strandComponents[i], this.strandModel.getValue(this.strand1Key)[i]);

            if (i < this.strandModel.getValue(this.strand1Key).length - 1) {
                NucleotideFactory.AttachRightPhosphorusLine(mesh, spacing);
            }
        }
    };

    // returns resulting strand
    function testStrandCollision (pos, base, strand) {
        strand = strand.slice();
        if (this._strandComponents.length === 0) {
            this.renderer.position.y = pos.y;
            return [base];
        }

        var firstPosition = {
            x: this._strandComponents[0].position.x + this.renderer.position.x,
            y: this._strandComponents[0].position.y + this.renderer.position.y,
            z: 0
        };
        var lastPosition = {
            x: this._strandComponents[this._strandComponents.length - 1].position.x + this.renderer.position.x,
            y: this._strandComponents[this._strandComponents.length - 1].position.y + this.renderer.position.y + 10,
            z: 0
        };

        var fdx = Math.abs(pos.x - firstPosition.x);
        var fdy = Math.abs(pos.y - firstPosition.y);
        var ldx = Math.abs(pos.x - lastPosition.x);
        var ldy = Math.abs(pos.y - lastPosition.y);
        var fdist = fdx*fdx + fdy*fdy;
        var ldist = ldx*ldx + ldy*ldy;

        // if it's near first or near last, snap to the closer one
        if ((fdx < snapToleranceX && fdy < snapToleranceY) || (ldx < snapToleranceX && ldy < snapToleranceY)) {
            if (fdist <= ldist) {
                strand.unshift(base);
                this.renderer.position.y -= spacing;
                return strand;
            } else {
                strand.push(base);
                return strand;
            }
        }

        return strand;

    }

    function getBasePosition (index) {
        return {x:0,y:index*spacing,z:0};
    }

    function getBaseRotation (index) {
        return {x: 0, y: 0, z: 0};
    }

    function getBaseScale (index) {
        return {x: 1, y: 1, z: 1};
    }

    function recreateStrandComponents (strandLength) {
        removeStrandComponents.call(this);

        var l = Math.max(this.strandModel.getValue(this.strand1Key).length, this.strandModel.getValue("strand2").length);
        for (var i = 0 ; i < l; i ++) {
            this._strandComponents[i] = ThreeDObjectUtils.CreateMeshOnEntity(
                this.entity,
                this.renderer,
                null,
                getBasePosition.call(this, i),
                getBaseRotation.call(this, i),
                getBaseScale.call(this, i)
            );
        }
    }

    function removeStrandComponents () {
        for (var i=0 ; i < this._strandComponents.length; i++) {
            // TODO remove child mesh
            this.entity.removeComponent(this._strandComponents[i]);
        }
        this._strandComponents = [];
    }

    return DNASingleStrandController;
});