define(function(require){
    var ExtendedModel = require('componentLibraryUtils/ExtendedBackboneModel');
    var DNA = require('constants/DNA');

    return ExtendedModel.extend({
        defaults: {
            strand1: [],
            strand1Length: 0,
            strand2: [],
            strand2Length: 0,
            AdenineCount: 0,
            GuanineCount: 0,
            ThymineCount: 0,
            CytosineCount: 0
        }
    });
});