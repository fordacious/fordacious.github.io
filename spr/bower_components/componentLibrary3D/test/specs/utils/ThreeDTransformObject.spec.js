define(function (require){
    var ThreeDTransformObject = require('3DComponents/utils/ThreeDTransformObject');

    describe('3DTransformObject' , function () {
        var underTest, threejsobj;
        beforeEach(function () {
            threejsobj = {position: {x:0,y:0,z:0}, rotation: {x:0,y:0,z:0}, scale: {x:1, y:1, z:1}};
            underTest = {threejsobj:threejsobj};
        });
        describe('position', function(){
            it('should set an accessor on position', function(){
                ThreeDTransformObject.initialize3DAccessors(underTest, "threejsobj");

                underTest.position.x = 10;
                underTest.position.y = 20;
                underTest.position.z = 30;

                expect(threejsobj.position.x).to.equal(10);
                expect(threejsobj.position.y).to.equal(20);
                expect(threejsobj.position.z).to.equal(30);
            });
        });

        describe('rotation', function(){
            it('should set an accessor on rotation', function(){
                ThreeDTransformObject.initialize3DAccessors(underTest, "threejsobj");

                underTest.rotation.x = 10;
                underTest.rotation.y = 20;
                underTest.rotation.z = 30;

                expect(threejsobj.rotation.x).to.equal(10);
                expect(threejsobj.rotation.y).to.equal(20);
                expect(threejsobj.rotation.z).to.equal(30);
            });
        });

        describe('scale', function(){
            it('should set an accessor on scale', function(){
                ThreeDTransformObject.initialize3DAccessors(underTest, "threejsobj");

                underTest.scale.x = 10;
                underTest.scale.y = 20;
                underTest.scale.z = 30;

                expect(threejsobj.scale.x).to.equal(10);
                expect(threejsobj.scale.y).to.equal(20);
                expect(threejsobj.scale.z).to.equal(30);
            });
        });
    });
});