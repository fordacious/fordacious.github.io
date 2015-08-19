define(function (require) {

    var ComponentLibrary = require('ComponentLibrary');

    var DNA = require('constants/DNA');
    var Modes = require('constants/Mode');

    var DNAControllerAssigner = function () {
        this.componentName = null;
        this.inputManager = null;
        this.renderer = null;
        this.strandModel = null;
        this.strand1Key = null;
        this.strand2Key = null;
        this.dragger = null;
        this.modeModel = null;
        this.modeModelKey = null;
        this.dropAreaRenderer = null;

        this.adenineFactory = null;
        this.guanineFactory = null;
        this.thymineFactory = null;
        this.cytosineFactory = null;

        this.singleStrandComponent = null;
        this.doubleStrandComponent = null;

        this._currentComponent = null;
    };

    DNAControllerAssigner.prototype.start = function() {
        this.modeModel.on("change:" + this.modeModelKey, onModeChange.bind(this));
        this.strandModel.on("change:" + this.strand1Key, onStrandChange.bind(this));
        this.strandModel.on("change:" + this.strand2Key, onStrandChange.bind(this));
        this._originalPosition = {
            x: this.renderer.position.x,
            y: this.renderer.position.y
        };
        onModeChange.call(this);
    };

    DNAControllerAssigner.prototype.update = function() {
        this.renderer.rotation.y = 0;
    };

    DNAControllerAssigner.prototype.addNucleotide = function() {
        return this._currentComponent.addNucleotide.apply(this._currentComponent, arguments);
    };

    DNAControllerAssigner.prototype.dragNucleotideAtPosition = function(pos) {
        if (this.modeModel.get(this.modeModelKey) === Modes.DOUBLE_STRAND) {
            return this._currentComponent.dragNucleotideAtPosition(pos);
        }
        return false;
    };

    var onModeChange = function () {
        removeComponent.call(this);

        var opts = {
            componentName : this.componentName,
            inputManager : this.inputManager,
            renderer : this.renderer,
            strandModel : this.strandModel,
            strand1Key : this.strand1Key,
            strand2Key : this.strand2Key,
            dragger : this.dragger,
            dropAreaRenderer: this.dropAreaRenderer,
            adenineFactory: this.adenineFactory,
            guanineFactory: this.guanineFactory,
            thymineFactory: this.thymineFactory,
            cytosineFactory: this.cytosineFactory
        };

        if (this.modeModel.get(this.modeModelKey) === Modes.SINGLE_STRAND) {
            this._currentComponent = this.entity.addComponent(ComponentLibrary.getComponent(this.singleStrandComponent), opts);
        } else {
            this._currentComponent = this.entity.addComponent(ComponentLibrary.getComponent(this.doubleStrandComponent), opts);
        }

        this.renderer.position.x = this._originalPosition.x;
        this.renderer.position.y = this._originalPosition.y;
    };

    function onStrandChange () {
        var s1 = this.strandModel.getValue(this.strand1Key);
        var s2 = this.strandModel.getValue(this.strand2Key);
        this.strandModel.set({
            strand1Length: s1.length,
            strand2Length: s1.length,
            AdenineCount: s1.filter(baseFilter(DNA.ADENINE)).length + s2.filter(baseFilter(DNA.ADENINE)).length,
            GuanineCount: s1.filter(baseFilter(DNA.GUANINE)).length + s2.filter(baseFilter(DNA.GUANINE)).length,
            ThymineCount: s1.filter(baseFilter(DNA.THYMINE)).length + s2.filter(baseFilter(DNA.THYMINE)).length,
            CytosineCount: s1.filter(baseFilter(DNA.CYTOSINE)).length + s2.filter(baseFilter(DNA.CYTOSINE)).length
        });
    }

    function baseFilter (base) {
        return function (b){ return b === base; };
    }

    var removeComponent = function () {
        if (this._currentComponent) {
            this.entity.removeComponent(this._currentComponent);
        }
    };

    return DNAControllerAssigner;
});