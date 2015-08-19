/*global require */
module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: '<json:package.json>',
        projName : 'sceneManager',

        // Clean
        clean: {
            local: {
                src: ['temp/local', 'temp/specs']
            }
        },

        // Lint
        jshint: {
            all : ['Gruntfile.js', 'app/scripts/**/*.js', 'test/specs/**/*.js'],
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
                globals: {
                    exports   : true,
                    module    : false,
                    define    : false,
                    expect    : false,
                    describe  : false,
                    it        : false,
                    beforeEach: false,
                    afterEach : false,
                    console   : true
                }
            }
        },

        // Watch
        watch: {
            jsscripts: {
                files: ['<%= jshint.all %>', 'test/specs/**/*.js'],
                tasks: ['rel']
            }
        },

        // Tests
        mocha: {
            all: ['test/index.html']
        },

        requirejs: {
            rel: {
                options: {
                    // Need to debug the release code? Uncomment the optimize flag
                    // to get a readable javascript output
                    optimize: "none",
                    baseUrl: 'app/scripts',
                    mainConfigFile: 'app/scripts/config.js',
                    name: '../../bower_components/almond/almond',
                    out: '<%= projName %>.js',
                    logLevel: 4,
                    include : 'Manager',
                    wrap : {
                        endFile: 'wrapperEnd.js',
                        startFile : 'wrapperStart.js'
                    },
                    paths : {
                        'jquery' : "empty:",
                        'ComponentLibrary': "empty:",
                        'ComponentSystem': "empty:"
                    }
                }
            }
        },
    });

    // Loading plugins
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-mocha');

    // Default task
    grunt.registerTask('default', ['rel', 'watch']);
    // Custom tasks
    grunt.registerTask('rel', ['jshint', 'test', 'requirejs']);
    // Aliasing 'mocha' task
    grunt.registerTask('test', 'mocha');
};