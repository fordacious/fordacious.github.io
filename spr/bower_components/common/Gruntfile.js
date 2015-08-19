/*global require */
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: '<json:package.json>',

    // Clean
    clean: {
      local: {
        src: ['temp/local', 'temp/specs']
      }
    },

    // Lint
    jshint: {
      all: ['grunt.js', 'app/scripts/**/*.js', 'test/specs/**/*.js'],
      options: {
        curly    : true,
        eqeqeq   : true,
        immed    : true,
        latedef  : true,
        newcap   : true,
        noarg    : true,
        sub      : true,
        undef    : true,
        boss     : true,
        eqnull   : true,
        smarttabs: true,     // disables the complaint of mixing tabs with spaces
        esnext   : true,      // enables the uses of ES.next features such as const.
          globals: {
            exports : true,
            module  : false,
            define  : false,
            describe: false,
            it      : false,
            beforeEach: false,
            afterEach : false
          }
        }
    },

    // Compile
    less: {
      local:{
        options: {
          paths: ['app/styles']
        },
        files: {
          'temp/styles/sim-common.css': 'app/styles/start.less'
        }
      }

    },

    //Copy
    copy: {
      local:{
        files: [
          {dest : 'temp/local/scripts/', src : ['**'], cwd : 'app/scripts/', expand : true},
          {dest : 'temp/specs/', src: ['**'], cwd: 'test/specs/', expand : true}
        ]
      }
    },

    // Watch
    watch: {
      jsscripts: {
        files: ['<%= jshint.all %>', 'test/specs/**/*.js'],
        tasks: ['jshint', 'copy', 'test']
      },
      styles: {
        files: ['<config:less.options.paths>', 'app/styles/**'],
        tasks: ['less']
      }
    },

    // Tests
    mocha: {
      all: ['test/index.html']
    }

  });


  // Default task
  grunt.registerTask('default', ['jshint', 'copy', 'less', 'test']);
  // Custom tasks
  grunt.registerTask('dist', ['clean', 'jshint', 'copy', 'less', 'test']);
  // Aliasing 'mocha' task
  grunt.registerTask('test', ['mocha']);

  // Loading plugins
  grunt.loadNpmTasks('grunt-contrib');
  grunt.loadNpmTasks('grunt-mocha');
};