/*global requirejs */
requirejs.config({
    shim: {
        jquery: {
            exports: '$'
        },
        backbone: {
            deps: ['jquery', 'underscore'],
            exports: 'Backbone'
        }
    },
    paths: {
        jquery: '../../../bower_components/jquery/dist/jquery',
        underscore: '../../../bower_components/lodash/lodash',
        backbone: '../../../bower_components/backbone/backbone',
        almond: '../../../bower_components/almond/almond',
        check: '../../../bower_components/check-js/check.min',

        // libs
        sinon: '../../../libs/sinon-1.5.2',

        // Shortcut for common
        eventBus: 'util/eventBus'
    }
});
