define(function(require){

    var CanvasRenderer = require('3DComponents/graphics/CanvasRenderer');
    var sinon = require('sinon');
    var THREE = require('threejs');

    //faking out CanvasRenderer
    THREE.CanvasRenderer = function(){};
    THREE.CanvasRenderer.prototype.setSize = function(){};
    THREE.CanvasRenderer.prototype.domElement = "faked";

    describe('CanvasRenderer', function(){
        var underTest;

        beforeEach(function(){
            underTest = new CanvasRenderer();
        });

        describe('start', function(){
            describe('args are not given', function(){
                it('should throw if parent is not given', function(){
                    underTest.camera = "camera";
                    underTest.scenes = ["scene"];
                    expect(function(){underTest.start();}).to.throw('CanvasRenderer must be given a parent');
                });

                it('should throw if camera is not given', function(){
                    underTest.parent = "parent";
                    underTest.scenes = ["scene"];
                    expect(function(){underTest.start();}).to.throw('CanvasRenderer must be given a camera');
                });

                it('should throw if camera is not given', function(){
                    underTest.parent = "parent";
                    underTest.camera = "camera";
                    expect(function(){underTest.start();}).to.throw('CanvasRenderer must be given scenes');
                });

            });

            it('should get added to the parent', function(){
                underTest.camera = "camera";
                underTest.scenes = ["scene"];
                underTest.parent = {
                    $el: {
                        append : sinon.stub()
                    }
                };

                underTest.start();

                expect(underTest.parent.$el.append.callCount).to.equal(1);
            });
        });

    });

});