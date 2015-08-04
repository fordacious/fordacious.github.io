module.exports = function(grunt) {
    grunt.initConfig({
        pkg: '<json:package.json>',
        jshint: {
            all : ['Gruntfile.js', 'app/scripts/**/*.js', 'test/specs/**/*.js'],
            options: {
                curly  : false,
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
                scripturl : true,
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
                    console   : false
                }
            }
        },
        watch: {
            jsscripts: {
                files: ['<%= jshint.all %>', 'test/specs/**/*.js'],
                tasks: ['jshint', 'test']
            }
        },
        mocha: {
            all: ['test/index.html']
        }

    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-mocha');

    grunt.registerTask('default', ['jshint', 'test', 'watch']);
    grunt.registerTask('test', 'mocha');
};