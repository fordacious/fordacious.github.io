/*
 * grunt-coverjs
 * https://github.com/grundjoseph/grunt-coverjs
 *
 * Copyright (c) 2012 Joe Grund
 * Licensed under the MIT license.
 */

module.exports = function (grunt) {
  'use strict';

  /**
   * Note: If the instrument method throws an error this task will force an abort.
   */
  grunt.registerMultiTask('cover', 'Instruments JavaScript Files using coverjs.', function () {
    var Instrument = require('coverjs').Instrument;

    //TODO: ditch this when grunt v0.4 is released
    this.files = this.files ||
        grunt.task.normalizeMultiTaskFiles(this.data, ['files']);

    /**
     * Instruments the given source file.
     *
     * @param srcFile
     * @return {String} Returns the instrumented source file as a string.
     */
    function coverFile(srcFile) {
      var srcCode = grunt.file.read(srcFile);
      Instrument = require('coverjs').Instrument;

      try {
        return new Instrument(srcCode, srcFile).instrument();
      } catch (e) {
        grunt.log.error(_.sprintf('File %s could not be instrumented.', srcFile));
        grunt.fatal(e, 3);
      }
    };

    var count = 0;
    this.files.forEach(function(file) {
      var mappings = grunt.file.expandMapping(file['src'], file['dest']);
      mappings.forEach(function(mapping) {
        var instrumented = coverFile(mapping['src']);

        grunt.file.write(mapping['dest'], instrumented);
        count++;
      });
    });
    
    grunt.log.writeln('Instrumented ' + count + ' files.');
  });
};