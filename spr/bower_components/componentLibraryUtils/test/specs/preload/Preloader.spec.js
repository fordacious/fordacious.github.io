/*globals window*/
define(function(require) {

    var Preloader = require('preload/Preloader');
    var sinon = require('sinon');
    var $ = require('jquery');

    var WindowImage = window.Image;

    var StubImage = sinon.stub();


    describe('Preloader', function(){

        var underTest;

        beforeEach(function(){
            window.Image = StubImage;
            underTest = new Preloader();
        });

        afterEach(function(){
            window.Image = WindowImage;
        });

        describe('start', function(){

            it('should complete straight if no images are needed to be preloaded', function(){
                var completed = false;
                $(underTest).on('preloadCompleted', function(){
                    completed = true;
                });

                underTest.initialize();
                underTest.start();

                expect(completed).to.equal(true);
            });

            it('should trigger the progress event equal to the number of images loaded', function(){
                underTest.images = {
                    1: 'file', 2: 'file', 3: 'file', 4: 'file', 5: 'file'
                };

                var count = 0;
                $(underTest).on('preloadProgress', function(){
                    count++;
                });

                underTest.initialize();
                underTest.start();

                //manually calling the onload for all images
                for(var key in underTest._images){
                    if(underTest._images.hasOwnProperty(key)){
                        underTest._images[key].data.onload();
                    }
                }

                expect(count).to.equal(5);
            });

            it('should trigger the complete event once all images have been loaded', function(){
                underTest.images = {
                    1: 'file', 2: 'file', 3: 'file', 4: 'file', 5: 'file'
                };

                var completed = false;
                $(underTest).on('preloadCompleted', function(){
                    completed = true;
                });

                underTest.initialize();
                underTest.start();

                //manually calling the onload for all images
                for(var key in underTest._images){
                    if(underTest._images.hasOwnProperty(key)){
                        underTest._images[key].data.onload();
                    }
                }

                expect(completed).to.equal(true);
            });

        });

    });

});