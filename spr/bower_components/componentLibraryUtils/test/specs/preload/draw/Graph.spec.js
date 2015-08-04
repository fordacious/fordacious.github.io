define(function(require) {
    var PreloadDraw = require('preload/draw/Graph');
    var $ = require('jquery');
    var sinon = require('sinon');

    describe('Preload Draw Graph', function() {
        var underTest, renderer, element, preloader;

        beforeEach(function() {
            element = $("<div><canvas></canvas></div>");
            $('body').append(element);

            renderer = {
                $el : element
            };
            preloader = {
                _images: {
                    hello: 1
                }
            };

            underTest = new PreloadDraw();
            underTest.preloader = preloader;
            underTest.preloadImageName = "hello";
        });

        afterEach(function() {
            element.remove();
        });

        describe('starting without dependencies', function() {
            beforeEach(function() {
                underTest.renderer = renderer;
            });

            it('should throw if neither renderer or element id is provided', function() {
                delete underTest.renderer;
                delete underTest.drawingElementId;

                expect(function() { underTest.start(); }).to.throw("Either renderer or drawingElementId is required");
            });

            it('should throw if the preloader is not provided', function() {
                delete underTest.preloader;

                expect(function() { underTest.start(); }).to.throw("The preloader must be provided.");
            });

            it('should throw if the preloading image name is not provided', function() {
                delete underTest.preloadImageName;

                expect(function() { underTest.start(); }).to.throw("The name of the preloading image must be provided.");
            });
        });

        describe('when starting with a renderer', function() {
            beforeEach(function() {
                underTest.renderer = renderer;
            });

            it('should use the element provided', function() {
                underTest.start();

                expect(element.attr('data-owner')).to.equal('component');
            });
        });

        describe('when starting without a renderer', function() {
            beforeEach(function() {
                underTest.drawingElementId = 'Dror';
                element.attr('id', 'Dror');
            });

            it('should find the element by id', function() {
                underTest.start();

                expect(element.attr('data-owner')).to.equal('component');
            });

            it('should start at the current progress', function() {
                element.attr('data-progress', 10);

                underTest.start();

                expect(underTest.currentProgress).to.equal(10);
            });

            it('should create the canvas for us', function(){
                underTest.drawingElementId = 'Test';
                element.attr('id', '');

                underTest.start();

                expect(!!underTest.canvas).to.equal(true);
            });
        });

        describe('update', function() {
            beforeEach(function() {
                underTest.renderer = renderer;
                underTest.start();

                sinon.stub(underTest, "render");
            });

            it('should finish the preload animation before triggering completed', function() {
                var watch = sinon.stub();
                $(underTest).on('completed', watch);
                underTest.setTargetProgress(100);

                underTest.update({ elapsed: 10 });
                underTest.update({ elapsed: 10000 });

                expect(watch.callCount).to.equal(1);
            });

            it('should not allow currentProgress to go above 100%', function() {
                underTest.setTargetProgress(1000);

                underTest.update({ elapsed: 10000 });

                expect(underTest.currentProgress).to.equal(100);
            });
        });

        describe('when there was progress to be made when started', function() {
            it('should keep drawing', function() {
                delete underTest.renderer;
                underTest.drawingElementId = "Hello";
                element.attr('id', "Hello").attr('data-max', 20);
                underTest.start();
                sinon.stub(underTest, 'render');

                underTest.update({ elapsed: 1000 });

                expect(underTest.currentProgress).to.equal(20);
            });
        });

        describe('destroy', function() {
            beforeEach(function() {
                underTest.drawingElementId = "hello";
                element.attr('id', 'hello');
                underTest.start();
            });

            it("should remove the element drawing to when a renderer isn't provided", function() {
                underTest.destroy();

                expect(element.parent().length).to.equal(0);
            });
        });
    });
});