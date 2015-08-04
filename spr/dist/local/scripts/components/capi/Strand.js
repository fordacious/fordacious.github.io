define(function(require){
    var ExtendedModel = require('componentLibraryUtils/ExtendedBackboneModel');
    var adapter = require('api/snapshot/adapters/BackboneAdapter').getInstance();

    var DNA = require('constants/DNA');

    var Strand = ExtendedModel.extend({
        defaults: {
            //strand1: [DNA.ADENINE, DNA.GUANINE ,DNA.THYMINE, DNA.CYTOSINE, DNA.GUANINE, DNA.CYTOSINE, DNA.GUANINE, DNA.ADENINE],
            //strand1: [DNA.ADENINE, DNA.GUANINE ,DNA.THYMINE, DNA.CYTOSINE, DNA.GUANINE, DNA.CYTOSINE, DNA.GUANINE, DNA.ADENINE,DNA.ADENINE, DNA.GUANINE ,DNA.THYMINE, DNA.CYTOSINE, DNA.GUANINE, DNA.CYTOSINE, DNA.GUANINE, DNA.ADENINE,DNA.ADENINE, DNA.GUANINE ,DNA.THYMINE, DNA.CYTOSINE, DNA.GUANINE, DNA.CYTOSINE, DNA.GUANINE, DNA.ADENINE,DNA.ADENINE, DNA.GUANINE ,DNA.THYMINE, DNA.CYTOSINE, DNA.GUANINE, DNA.CYTOSINE, DNA.GUANINE, DNA.ADENINE,DNA.ADENINE, DNA.GUANINE ,DNA.THYMINE, DNA.CYTOSINE, DNA.GUANINE, DNA.CYTOSINE, DNA.GUANINE, DNA.ADENINE,DNA.ADENINE, DNA.GUANINE ,DNA.THYMINE, DNA.CYTOSINE, DNA.GUANINE, DNA.CYTOSINE, DNA.GUANINE, DNA.ADENINE],
            //strand1: [DNA.ADENINE, DNA.GUANINE, DNA.THYMINE, DNA.CYTOSINE, DNA.GUANINE, DNA.CYTOSINE, DNA.GUANINE, DNA.ADENINE],
            strand1: [DNA.ADENINE,DNA.GUANINE,DNA.THYMINE,DNA.CYTOSINE,DNA.ADENINE,DNA.GUANINE,DNA.THYMINE,DNA.CYTOSINE,DNA.ADENINE,DNA.GUANINE,DNA.THYMINE,DNA.CYTOSINE,DNA.ADENINE,DNA.GUANINE,DNA.THYMINE,DNA.CYTOSINE,DNA.ADENINE,DNA.GUANINE,DNA.THYMINE,DNA.CYTOSINE,DNA.ADENINE,DNA.GUANINE,DNA.THYMINE,DNA.CYTOSINE,DNA.ADENINE,DNA.GUANINE,DNA.THYMINE,DNA.CYTOSINE,DNA.ADENINE,DNA.GUANINE,DNA.THYMINE,DNA.CYTOSINE,DNA.ADENINE,DNA.GUANINE,DNA.THYMINE,DNA.CYTOSINE,DNA.ADENINE,DNA.GUANINE,DNA.THYMINE,DNA.CYTOSINE,DNA.ADENINE,DNA.GUANINE,DNA.THYMINE,DNA.CYTOSINE,DNA.ADENINE,DNA.GUANINE,DNA.THYMINE,DNA.CYTOSINE],
            strand1Length: 4,
            //strand2: [DNA.THYMINE, DNA.NONE, DNA.ADENINE, DNA.GUANINE, DNA.ADENINE, DNA.NONE, DNA.CYTOSINE],
            //strand2: [DNA.THYMINE, DNA.CYTOSINE, DNA.ADENINE, DNA.GUANINE, DNA.ADENINE, DNA.THYMINE, DNA.CYTOSINE,DNA.THYMINE, DNA.CYTOSINE, DNA.ADENINE, DNA.GUANINE, DNA.ADENINE, DNA.THYMINE, DNA.CYTOSINE,DNA.THYMINE, DNA.CYTOSINE, DNA.ADENINE, DNA.GUANINE, DNA.ADENINE, DNA.THYMINE, DNA.CYTOSINE,DNA.THYMINE, DNA.CYTOSINE, DNA.ADENINE, DNA.GUANINE, DNA.ADENINE, DNA.THYMINE, DNA.CYTOSINE,DNA.THYMINE, DNA.CYTOSINE, DNA.ADENINE, DNA.GUANINE, DNA.ADENINE, DNA.THYMINE, DNA.CYTOSINE,DNA.THYMINE, DNA.CYTOSINE, DNA.ADENINE, DNA.GUANINE, DNA.ADENINE, DNA.THYMINE, DNA.CYTOSINE,DNA.THYMINE, DNA.CYTOSINE, DNA.ADENINE, DNA.GUANINE, DNA.ADENINE, DNA.THYMINE, DNA.CYTOSINE],
            //strand2: [],
            strand2: [DNA.THYMINE,DNA.CYTOSINE,DNA.ADENINE,DNA.GUANINE,DNA.THYMINE,DNA.CYTOSINE,DNA.ADENINE,DNA.GUANINE,DNA.THYMINE,DNA.CYTOSINE,DNA.ADENINE,DNA.GUANINE,DNA.THYMINE,DNA.CYTOSINE,DNA.ADENINE,DNA.GUANINE,DNA.THYMINE,DNA.CYTOSINE,DNA.ADENINE,DNA.GUANINE,DNA.THYMINE,DNA.CYTOSINE,DNA.ADENINE,DNA.GUANINE,DNA.THYMINE,DNA.CYTOSINE,DNA.ADENINE,DNA.GUANINE,DNA.THYMINE,DNA.CYTOSINE,DNA.ADENINE,DNA.GUANINE,DNA.THYMINE,DNA.CYTOSINE,DNA.ADENINE,DNA.GUANINE,DNA.THYMINE,DNA.CYTOSINE,DNA.ADENINE,DNA.GUANINE,DNA.THYMINE,DNA.CYTOSINE,DNA.ADENINE,DNA.GUANINE,DNA.THYMINE,DNA.CYTOSINE,DNA.ADENINE,DNA.GUANINE],
            strand2Length: 0,
            AdenineCount: 1,
            GuanineCount: 1,
            ThymineCount: 1,
            CytosineCount: 1
        },

        start: function(){
            adapter.expose('strand1', this, {alias: 'Strand.First strand bases', description: 'Bases in first strand'});
            adapter.expose('strand1Length', this, {alias: 'Strand.Length', description: 'Length of first strand'});
            adapter.expose('strand2', this, {alias: 'Strand.Second strand bases', description: 'Bases in second strand'});
            adapter.expose('strand2Length', this, {alias: 'Strand.Length', description: 'Length of second strand'});
            adapter.expose('AdenineCount', this, {alias: 'Strand.Adenine count', description: 'Number of Adenine bases present strand'});
            adapter.expose('GuanineCount', this, {alias: 'Strand.Guanine count', description: 'Number of Guanine bases present strand'});
            adapter.expose('ThymineCount', this, {alias: 'Strand.Thymine count', description: 'Number of Thymine bases present strand'});
            adapter.expose('CytosineCount', this, {alias: 'Strand.Cytosine count', description: 'Number of Cytosine bases present strand'});
        },

        set: function (property, value) {
            if(Array.isArray(value) && value.length === 1 && value[0] === "") {
                value = [];
            }
            Strand.__super__.set.call(this, property, value);
        }
    });

    return Strand;
});