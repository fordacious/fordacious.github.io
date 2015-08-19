/*globals console setInterval*/
define (function(require){

    var _ = require('underscore');
    var Backbone = require('backbone');

    var LoadingScreenView = Backbone.Model.extend({

        defaults: {
            percentageDone:0
        }

    });

    return LoadingScreenView;

});