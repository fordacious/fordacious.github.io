define(function(require){

    var OrthographicCamera = require('3DComponents/graphics/OrthographicCamera');

    describe('OrthographicCamera', function(){
        var underTest = null;

        describe('constructor', function(){

            it('should create the accessors', function(){
                underTest = new OrthographicCamera();

                expect(underTest.position).to.not.equal(undefined);
                expect(underTest.position.x).to.equal(0);
                expect(underTest.position.y).to.equal(0);
                expect(underTest.position.z).to.equal(0);
                expect(underTest.rotation).to.not.equal(undefined);
                expect(underTest.rotation.x).to.equal(0);
                expect(underTest.rotation.y).to.equal(0);
                expect(underTest.rotation.z).to.equal(0);
            });
        });

        describe('position', function(){
            it('should set an accessor on position', function(){
                var camera3d = {
                    position:{ x:0,y:0,z:0 }
                };

                underTest = new OrthographicCamera();
                underTest.camera = camera3d;

                underTest.position.x = 10;

                expect(camera3d.position.x).to.equal(10);
            });
        });

        describe('rotation', function(){
            it('should set an accessor on rotation', function(){
                var camera3d = {
                    rotation:{ x:0,y:0,z:0 }
                };

                underTest = new OrthographicCamera();
                underTest.camera = camera3d;

                underTest.rotation.x = 10;

                expect(camera3d.rotation.x).to.equal(10);
            });
        });

    });

});