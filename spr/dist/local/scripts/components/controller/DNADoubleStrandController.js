/* globals console */
define(function(require){

    var $ = require('jquery');
    var THREE = require('threejs');

    var ComponentLibrary = require('ComponentLibrary');

    var ThreeDObjectUtils = require('componentLibrary3D/utils/ThreeDObjectUtils');
    var NucleotideFactory = require('factory/NucleotideFactory');
    var DNA = require('constants/DNA');
    var Modes = require('constants/Mode');

    var _2PI = Math.PI * 2;

    var rotationRate = 36 / 180 * Math.PI;
    var initialRotation = -Math.PI / 2;
    var spacing = 50;
    var helixDistance = 50;
    var spacingX = 10;
    var bulgeAmount = 50;
    var snapToleranceX = 20;
    var snapToleranceY = 50;
    var rotationDrag = 0.2;

    var DNADoubleStrandController = function () {
        this.inputManager = null;
        this.renderer = null;
        this.strandModel = null;
        this.strand2Key = null;
        this.strand2Key = null;
        this.toolboxRenderer = null;
        this.nucleotideFactory = null;
        this.dragger = null;

        this.adenineFactory = null;
        this.guanineFactory = null;
        this.thymineFactory = null;
        this.cytosineFactory = null;

        this._strandComponents = [];
        this._lastMousePosition = {x:0,y:0};

        this._nucleotideWidth = NucleotideFactory.GetNucleotideWidth();
        this._nucleotideHeight = NucleotideFactory.GetNucleotideHeight();
    };

    DNADoubleStrandController.prototype.start = function () {
        this.strandModel.on("change:" + this.strand1Key, renderStrand, this);
        this.strandModel.on("change:" + this.strand2Key, renderStrand, this);

        this._draggerOriginalMinY = this.dragger.minY;

        spacing = this._nucleotideWidth * 0.34;
        spacingX = this._nucleotideWidth * 0.2;

        this.update();

        var s1 = this.strandModel.getValue(this.strand1Key);
        var s2 = this.strandModel.getValue(this.strand2Key);
        while (s2.length < s1.length) {
            s2.push(DNA.NONE);
        }

        renderStrand.call(this);
    };

    DNADoubleStrandController.prototype.destroy = function () {
        removeStrandComponents.call(this);
        this.strandModel.off(null, null, this);
    };

    DNADoubleStrandController.prototype.addNucleotide = function (pos, base) {
        var newStrand = testStrandCollision.call(this, pos, base, this.strandModel.getValue(this.strand2Key));
        var changed = !strandEqual(newStrand, this.strandModel.getValue(this.strand2Key));
        if (changed) {
            this.strandModel.setValue(this.strand2Key, newStrand);
        }
        return changed;
    };

    DNADoubleStrandController.prototype.dragNucleotideAtPosition = function (pos) {
        var index = getIndexFromPosition.call(this, pos);
        var s2 = this.strandModel.getValue(this.strand2Key);
        if (s2[index] !== DNA.NONE) {
            var mesh = this._strandComponents[index].childMesh2;
            var bb = ThreeDObjectUtils.GetBoundingBox(mesh);
            if ((pos.x > bb.min.x && pos.x < bb.max.x) && (pos.y > bb.min.y && pos.y < bb.max.y)) {
                onNucleotideDrag.call(this, this._strandComponents[index].childMesh2, index);
                return true;
            }
        }
        return false;
    };

    DNADoubleStrandController.prototype.update = function (ts) {

        var s1 = this.strandModel.getValue(this.strand1Key);
        var s2 = this.strandModel.getValue(this.strand2Key);

        this.dragger.minY = this._draggerOriginalMinY - spacing * (getMaxStrandLength.call(this) - 1);
        //this.renderer.rotation.y = this.renderer.position.y / 100;

        var bb = ThreeDObjectUtils.GetBoundingBox(this.renderer);
        var mousePos = this.inputManager.getMousePosition();
        if (mousePos.x >= bb.min.x && mousePos.x <= bb.max.x && mousePos.y >= bb.min.y && mousePos.y <= bb.max.y) {
            this._lastMousePosition = mousePos;
        }

        var targetRotations = getTargetRotations.call(this, s1, s2);

        var posX = Math.sin(rotationRate) * helixDistance;
        var posZ = Math.cos(rotationRate) * helixDistance;

        for (var i = 0 ; i < this._strandComponents.length; i++) {
            var sc = this._strandComponents[i];

            var targetRot = targetRotations[i];
            sc.rotation.y += rotLerp(targetRot, sc.rotation.y, rotationDrag);

            if (sc.childMesh1) {
                sc.childMesh1.position.x = -spacingX + posX;
                sc.childMesh1.position.z = posZ;
            }

            if (sc.childMesh2) {
                sc.childMesh2.position.x = spacingX + posX;
                sc.childMesh2.position.z = posZ;
            }

            if (!DNA.isCorrectBasePair(s1[i], s2[i]) && s1[i] !== DNA.NONE && s2[i] !== DNA.NONE) {
                if (sc.mesh.children.length >= 1) {
                    sc.childMesh1.position.x += -(spacingX + (Math.sin(ts.ts / 500) + 1) * bulgeAmount / 2);
                }
                if (sc.mesh.children.length >= 2) {
                    sc.childMesh2.position.x += (spacingX + (Math.sin(ts.ts / 500) + 1) * bulgeAmount / 2);
                }
            }

            var prev = this._strandComponents[i - 1];
            if (prev && s2[i] !== DNA.NONE) {
                // TODO this needs to be based on the previous's position now
                if (prev.childMesh1) {
                    // TODO if these vectors' x is the distance of the phosphorus, then the result will be the vector between the two phophorus atoms
                    var length = this._nucleotideWidth;
                    var v1 = new THREE.Vector3(length,0,0);
                    var v2 = new THREE.Vector3(length,spacing,0);
                    v2.applyAxisAngle(new THREE.Vector3(0,1,0), sc.rotation.y - prev.rotation.y);
                    v2.sub(v1);
                    // equal
                    prev.childMesh1.rotation.z = Math.atan2(v2.y, -v2.z) - Math.PI / 2;
                    // major and minor
                    //prev.childMesh1.rotation.z = Math.atan2(v2.y, -v2.z) + Math.PI;
                }
                if (prev.childMesh2) {
                    prev.childMesh2.rotation.y = prev.childMesh1.rotation.y + Math.PI;
                    // equal
                    prev.childMesh2.rotation.z = prev.childMesh1.rotation.z + Math.PI;
                    // major minor
                    //prev.childMesh2.rotation.z = prev.childMesh1.rotation.z;
                }
            }
        }
    };

    var renderStrand = function () {
        var s1 = this.strandModel.getValue(this.strand1Key);
        var s2 = this.strandModel.getValue(this.strand2Key);

        recreateStrandComponents.call(this, getMaxStrandLength.call(this));

        var i, mesh;
        for (i = 0 ; i < s1.length; i ++) {
            if (s1[i] === DNA.NONE) {
                continue;
            }

            mesh = NucleotideFactory.CreateNucleotideOnEntity(this.entity, this._strandComponents[i], s1[i], false);

            this._strandComponents[i].childMesh1 = mesh;

            if (i < s1.length - 1) {
                NucleotideFactory.AttachRightPhosphorusLine(mesh, spacing, false);
            }
        }
        for (i = 0 ; i < s2.length; i ++) {
            if (s2[i] === DNA.NONE) {
                continue;
            }

            mesh = NucleotideFactory.CreateNucleotideOnEntity(this.entity, this._strandComponents[i], s2[i], true);
            mesh.rotation.y += Math.PI;
            mesh.rotation.z += Math.PI;

            this._strandComponents[i].childMesh2 = mesh;

            if (i < s2.length - 1 && s2[i + 1] !== DNA.NONE) {
                NucleotideFactory.AttachRightPhosphorusLine(mesh, spacing, true);
            }
        }

        this.update();
    };

    function onNucleotideDrag (originalMesh, index) {
        var arr = this.strandModel.getValue(this.strand2Key);
        var base = arr[index];

        var rendererComponent = ComponentLibrary.getComponent('graphics/3dModelRenderer');
        var draggerComponent = ComponentLibrary.getComponent('controller/3dDragger');

        if (base && base !== DNA.NONE) {
            var bb = ThreeDObjectUtils.GetBoundingBox(originalMesh);

            var entity = getFactory.call(this, base).create();
            var mesh = entity.getComponent(rendererComponent);
            var dragger = entity.getComponent(draggerComponent);
            var mouse = this.inputManager.getMousePosition();
            mesh.position.x = mouse.x - this._nucleotideWidth / 2;
            mesh.position.y = mouse.y;

            dragger.startDragging();

            arr[index] = DNA.NONE;
            this.strandModel.trigger("change:" + this.strand2Key);
        }
    }

    function getFactory (base) {
        if (base === DNA.ADENINE) return this.adenineFactory;
        if (base === DNA.GUANINE) return this.guanineFactory;
        if (base === DNA.THYMINE) return this.thymineFactory;
        if (base === DNA.CYTOSINE) return this.cytosineFactory;
        return null;
    }

    // returns resulting strand
    function testStrandCollision (pos, base, strand) {
        if (pos.x > this.renderer.position.x - this._nucleotideWidth / 2 && pos.x < this.renderer.position.x + this._nucleotideWidth / 2) {
            strand = strand.slice();
            var dropIndex = getIndexFromPosition.call(this, pos);
            if (strand[dropIndex] === DNA.NONE || dropIndex === strand.length) {
                strand[dropIndex] = base;
            }
        }

        return strand;
    }

    function getIndexFromPosition (position) {
        return Math.round((position.y - this.renderer.position.y) / spacing);
    }

    function strandEqual (s1, s2) {
        if (s1.length !== s2.length) return false;
        for (var i = 0; i < s1.length; i ++) {
            if (s1[i] !== s2[i]) return false;
        }
        return true;
    }

    function generatePosition (rotation) {
        var pos = {x: helixDistance, y:0, z:0};
        return {
            x: pos.x * Math.cos(rotation) - pos.z * Math.sin(rotation),
            y: 0,
            z: pos.z * Math.cos(rotation) + pos.x * Math.sin(rotation)
        };
    }

    function getYRotations (strand1, strand2) {
        var rotations = [];
        var lag = 0;
        var maxIndex = Math.max(strand1.length, strand2.length);
        for (var i = 0; i < maxIndex; i ++) {
            if (strand2[i] === DNA.NONE) {
                lag += 1;
                rotations.push(initialRotation + rotationRate * (i - lag));
                lag += 1;
                i += 1;
            }
            rotations.push(initialRotation + rotationRate * (i - lag));
        }
        return rotations;
    }

    function getStrandIndexFromMousePosition (mousePos) {
        return Math.round((mousePos.y - this.renderer.position.y) / spacing);
    }

    function getTargetRotations (s1, s2) {
        var rotations = getYRotations(s1, s2);
        var trs = [];
        for (var i = 0 ; i < rotations.length; i++) {
            var l = Math.max(s1.length, s2.length);
            var baseRotation = rotations[i];
            var localMouseIndex = getStrandIndexFromMousePosition.call(this, this._lastMousePosition);
            var mouseRotation = 0;
            if (localMouseIndex < 0) {
                mouseRotation = rotations[0];
            } else if (localMouseIndex >= l) {
                mouseRotation = rotations[l - 1];
            } else {
                mouseRotation = rotations[localMouseIndex];
            }
            trs.push(baseRotation - mouseRotation);
        }
        return trs;
    }

    function getMaxStrandLength () {
        return Math.max(this.strandModel.getValue(this.strand1Key).length, this.strandModel.getValue(this.strand2Key).length);
    }

    function rotLerp (end, start, amount) {
        var shortest_angle = ((((end - start) % _2PI) + (Math.PI * 3)) % _2PI) - Math.PI;
        return shortest_angle * amount;
    }

    function recreateStrandComponents (strandLength) {
        var rotations = this._strandComponents.map(function (sc) {
            return { x: sc.rotation.x || 0, y: sc.rotation.y || 0, z: sc.rotation.z || 0 };
        });

        removeStrandComponents.call(this);

        for (var i = 0 ; i < strandLength; i ++) {
            this._strandComponents[i] = ThreeDObjectUtils.CreateMeshOnEntity(
                this.entity,
                this.renderer,
                null,
                {x: 0, y: i*spacing, z: 0},
                rotations[i]
            );
        }
    }

    function removeStrandComponents () {
        this._strandComponents.forEach(function (sc) {
            if (sc.childMesh1) this.entity.removeComponent(sc.childMesh1);
            if (sc.childMesh2) this.entity.removeComponent(sc.childMesh2);
            this.entity.removeComponent(sc);
        }.bind(this));
        this._strandComponents = [];
    }

    return DNADoubleStrandController;
});