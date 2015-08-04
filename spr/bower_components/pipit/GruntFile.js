/*global require, process */
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: '<json:package.json>',
    version: '0.70',

    // Clean
    clean: {
      src: ['temp', 'dist']
    },

    // Lint
    jshint: {
      all : ['Gruntfile.js', 'app/scripts/**/*.js', 'test/specs/**/*.js',
             '!app/scripts/intro*.js', '!app/scripts/outro*.js'],
      options: {
        curly  : true,
        eqeqeq : true,
        immed  : true,
        latedef: true,
        newcap : true,
        noarg  : true,
        sub    : true,
        undef  : true,
        boss   : true,
        eqnull : true,
        onecase : true,
        scripturl: true,
        globals: {
          exports   : true,
          module    : false,
          define    : false,
          describe  : false,
          xdescribe : false,
          it        : false,
          xit       : false,
          beforeEach: false,
          afterEach : false,
          expect    : false,
          spyOn     : false
        }
      }
    },

    // Copy
    copy: {
      local: {
        files: [
          {dest : 'temp/local/scripts/', src : ['**'], cwd : 'app/scripts/', expand : true}
        ]
      },
      test: {
        files: [
          {dest : 'temp/local/specs/', src : ['**'], cwd : 'test/specs/', expand : true}
        ]
      },
      cover : {
        files : [
          {dest : 'cover/app/specs/', src : ['**'], cwd : 'test/specs/', expand : true}
        ]
      }
    },

    cover : {
      compile : {
        files : {
          'cover/' : 'app/scripts/api/**/*.js'
        }
      }
    },

    mocha : {
      dot: {
        src : ['test/index.html']
      },
      bamboo : {
        src : '<%= mocha.dot.src %>',
        options : {
          reporter : 'bamboo-mocha-reporter/lib/bamboo.js'
        },
        dest : 'temp/test/mocha.json'
      }
    },

    jsbeautifier : {
      fix : {
        src : ['app/**/*.js', 'test/specs/**/*.js'],
        options : {
          mode : 'VERIFY_AND_WRITE'
        }
      },
      verify : {
        src : ['app/**/*.js', 'test/specs/**/*.js'],
        options : {
          mode : 'VERIFY_ONLY'
        }
      }
    },

    // Watch
    watch: {
      jsscripts: {
        files: '<config:lint.files>',
        // Removing the lint task temporarily
        tasks: 'lint copy:local copy:test test'
      }
    },

    // Dist
    requirejs: {
      local: {
        options: {
          // Need to debug the release code? Uncomment the optimize flag
          // to get a readable javascript output
          //optimize: "none",
          baseUrl       : 'temp/local/scripts',
          mainConfigFile: 'app/scripts/config.js',
          name          : '../../../bower_components/almond/almond',
          include       : ['api/snapshot/SimCapiHandler'],
          wrap          : false,
          out           : process.env.HTDOCS + '/aelp/local/js/pipit.js'
        }
      },

      handler_exploded : {
        options : {
          optimize      : "none",
          baseUrl       : 'temp/local/scripts',
          mainConfigFile: 'app/scripts/config.js',
          name          : '../../../bower_components/almond/almond',
          include       : ['api/snapshot/SimCapiHandler'],
          out           : 'dist/pipit-handler-<%= version %>.js',
          wrap          : {
            startFile: 'app/scripts/intro-handler.js',
            endFile  : 'app/scripts/outro-handler.js'
          }
        }
      },
      handler_minified : {
        options: {
          baseUrl        : '<%= requirejs.handler_exploded.options.baseUrl %>',
          mainConfigFile : '<%= requirejs.handler_exploded.options.mainConfigFile %>',
          name           : '<%= requirejs.handler_exploded.options.name %>',
          include        : '<%= requirejs.handler_exploded.options.include %>',
          out            : 'dist/pipit-handler-<%= version %>.min.js',
          wrap           : '<%= requirejs.handler_exploded.options.wrap %>'
        }
      },

      sim_exploded:{
        options:{
          optimize      : "none",
          baseUrl       : 'temp/local/scripts',
          mainConfigFile: 'app/scripts/config.js',
          name          : '../../../bower_components/almond/almond',
          include       : ['api/snapshot/Transporter', 'api/snapshot/CapiModel', 'api/snapshot/Controller',
                           'api/snapshot/adapters/CapiAdapter', 'api/snapshot/adapters/BackboneAdapter'
                           ],
          out           : 'dist/pipit-<%= version %>.js',
          wrap          : {
            startFile: 'app/scripts/intro.js',
            endFile  : 'app/scripts/outro.js'
          }
        }
      },
      sim_minified:{
        options: {
          baseUrl        : '<%= requirejs.sim_exploded.options.baseUrl %>',
          mainConfigFile : '<%= requirejs.sim_exploded.options.mainConfigFile %>',
          name           : '<%= requirejs.sim_exploded.options.name %>',
          include        : '<%= requirejs.sim_exploded.options.include %>',
          out            : 'dist/pipit-<%= version %>.min.js',
          wrap           : '<%= requirejs.sim_exploded.options.wrap %>'
        }
      }
    }
  });

  // Default task
  grunt.registerTask('default', 'dist:local');
  grunt.registerTask('test', ['cover:compile', 'copy:cover', 'copy:test', 'mocha:dot']);
  grunt.registerTask('test-rel', ['cover:compile', 'copy:cover', 'copy:test', 'mocha:bamboo']);

  // Custom tasks
  grunt.registerTask('dist:local', ['clean', 'jshint', 'jsbeautifier:verify', 'copy:local', 'test', 'requirejs:local']);

  grunt.registerTask('rel', ['clean', 'jshint', 'jsbeautifier:verify', 'copy:local', 'test-rel', 'requirejs:sim_minified',
                             'requirejs:sim_exploded', 'requirejs:handler_minified', 'requirejs:handler_exploded']);

  // Loading plugins
  grunt.loadNpmTasks('grunt-jsbeautifier');
  grunt.loadNpmTasks('grunt-contrib');
  grunt.loadNpmTasks('grunt-mocha');
  grunt.loadTasks('grunt-lib');

};
