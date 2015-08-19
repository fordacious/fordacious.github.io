define(function(require){
    var Light = require('3DComponents/graphics/Light');
    var THREE = require('threejs');

    describe("Light", function(){
        var underTest = null;

        describe('constructor', function(){

            it('should create the accessors', function(){
                underTest = new Light();

                expect(underTest.position).to.not.equal(undefined);
                expect(underTest.position.x).to.equal(0);
                expect(underTest.position.y).to.equal(0);
                expect(underTest.position.z).to.equal(0);
                expect(underTest.rotation).to.not.equal(undefined);
                expect(underTest.rotation.x).to.equal(0);
                expect(underTest.rotation.y).to.equal(0);
                expect(underTest.rotation.z).to.equal(0);
                expect(underTest.intensity).to.equal(1);
            });

        });

        describe('initialize', function(){

            beforeEach(function(){
                underTest = new Light();
            });

            describe('args are not given', function(){
                it('should throw if parent is not given', function(){
                    underTest.type = "AmbientLight";
                    expect(function(){underTest.initialize();}).to.throw('parent must be given');
                });

                it('should throw if type is not valid', function(){
                    underTest.parent = "parent";
                    underTest.type = "";
                    expect(function(){underTest.initialize();}).to.throw('invalid type was given');

                    underTest.type = "invalid";
                    expect(function(){underTest.initialize();}).to.throw('invalid type was given');

                    underTest.type = "AmbientLight";
                    expect(function(){underTest.initialize();}).to.not.throw('invalid type was given');
                });


            });


            it('should get the correct light type', function(){
                underTest.parent = "parent";
                underTest.type = "AmbientLight";

                underTest.initialize();

                expect(underTest.light instanceof THREE.AmbientLight).to.equal(true);
            });

        });

        describe('position', function(){
            it('should set an accessor on position', function(){
                var light3d = {
                    position:{ x:0,y:0,z:0 }
                };

                underTest = new Light();
                underTest.light = light3d;

                underTest.position.x = 10;

                expect(light3d.position.x).to.equal(10);
            });
        });

        describe('rotation', function(){
            it('should set an accessor on rotation', function(){
                var light3d = {
                    rotation:{ x:0,y:0,z:0 }
                };

                underTest = new Light();
                underTest.light = light3d;

                underTest.rotation.x = 10;

                expect(light3d.rotation.x).to.equal(10);
            });
        });

    });

});