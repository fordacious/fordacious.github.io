define(function(require){
    var ExtendedModel = require('componentLibraryUtils/ExtendedBackboneModel');
    var Modes = require('constants/Mode');

    return ExtendedModel.extend({
        defaults: {
            simMode: Modes.DOUBLE_STRAND
        }
    });
});