/*global requirejs */
requirejs.config({
  shim: {
    jquery: {
      exports: '$'
    },
    underscore:{
        exports: '_'
    },
    backbone:{
        deps    : ['jquery', 'underscore'],
        exports : 'Backbone'
    },
    preloadjs: {
        exports : 'createjs'
    },

    d3:{
        deps    : ['jquery', 'underscore'],
        exports : 'd3'
    }
  },
  paths: {

    text        : '../../../bower_components/requirejs-text/text',
    jquery      : '../../../bower_components/jquery/dist/jquery',
    underscore  : '../../../bower_components/underscore/underscore',
    backbone    : '../../../bower_components/backbone/backbone',
    check       : '../../../bower_components/check-js/check.min',
    d3          : "../../../bower_components/d3/d3.min",
    preloadjs    : "../../../bower_components/PreloadJS/lib/preloadjs-0.4.1.min"
  }
});