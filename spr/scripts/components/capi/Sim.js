define(function(require){
    var ExtendedModel = require('componentLibraryUtils/ExtendedBackboneModel');
    var adapter = require('api/snapshot/adapters/BackboneAdapter').getInstance();
    var Modes = require('constants/Mode');

    return ExtendedModel.extend({
        defaults: {
            simMode: Modes.DOUBLE_STRAND
        },

        start: function(){
            adapter.expose('simMode', this, { 'alias': 'Sim.Mode', description: 'what mode the sim is in', allowedValues: Modes.valuesArray });
        }
    });
});