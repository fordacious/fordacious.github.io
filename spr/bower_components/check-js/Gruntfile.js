module.exports = function(grunt) {

  var hash = (new Date()).getTime();

  grunt.initConfig({
    pkg : grunt.file.readJSON('package.json'),

    clean : {
      code : ['temp', 'cover']
    },

    jshint : {
      all : ['Gruntfile.js', 'lib/**/*.js', 'test/spec/**/*.js'],
      options : {
        browser : true,
        laxbreak : true,
        curly : true,
        eqeqeq : true,
        immed : true,
        latedef : true,
        newcap : true,
        noarg : true,
        sub : true,
        boss : true,
        eqnull : true
      }
    },

    copy : {
      code : {
        files : {
          'temp/' : ['lib/**', 'test/**']
        }
      },
      cover : {
        files : {
          'cover/' : ['lib/**', 'test/**']
        }
      }
    },

    cover : {
      compile : {
        files : {
          'cover/' : 'lib/**/*.js'
        }
      }
    },

    mocha : {
      index : ['test/index.html']
    },

    watch : {
      code : {
        files : ['lib/**', 'test/**'],
        tasks : 'compile'
      }
    },

    uglify: {
      prod : {
        files : {
          'check.min.js' : ['lib/**/*.js']
        }
      }
    }

  });

  grunt.loadTasks('grunt-lib');

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-mocha');

  // helper tasks
  grunt.registerTask('coverage', ['copy:cover', 'cover']);
  grunt.registerTask('test', ['coverage', 'mocha']);
  grunt.registerTask('compile', ['clean:code', 'copy:code', 'jshint', 'test']);

  // dist tasks
  grunt.registerTask('dist:prod', ['clean', 'compile', 'uglify:prod']);

  // default
  grunt.registerTask('default', ['clean', 'dist:prod', 'watch']);
};
