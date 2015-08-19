require.config({
  baseUrl : 'lib/',
  paths : {
    test : '../test',

    jquery : '../../components/jquery/jquery',
    underscore : '../../components/underscore/underscore',
    backbone : '../../components/backbone/backbone'
  },

  shim : {
    backbone : {
      deps : ['underscore', 'jquery'],
      exports : 'Backbone'
    },

    underscore : {
      exports : '_'
    },

    mocha : {
      exports : 'mocha'
    }
  }
});

var runMocha = function() {
  mocha.run(function() {
    if (typeof window.__$coverObject !== 'undefined') {
      var reporter = new JSCovReporter({
        coverObject : window.__$coverObject
      });
    }
  });
};
