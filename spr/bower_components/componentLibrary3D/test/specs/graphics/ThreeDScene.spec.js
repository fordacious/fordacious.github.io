define(function(require){

    var ThreeDScene = require('3DComponents/graphics/ThreeDScene');
    var THREE = require('threejs');


    describe('ThreeDScene', function(){
        var underTest;

        beforeEach(function(){
            underTest = new ThreeDScene();
            underTest.initialize();
        });

        describe('add', function(){
            it('adds to the scene', function(){
                underTest.add(new THREE.Object3D());
                expect(underTest.scene.children.length).to.equal(1);
            });

            it('doesn\'t add to the scene if the mesh is null', function(){
                underTest.add(new THREE.Object3D());
                underTest.add();
                expect(underTest.scene.children.length).to.equal(1);
            });
        });

        describe('clearScene', function(){
            it('clears the scene', function(){
                underTest.add(new THREE.Object3D());
                underTest.clearScene();
                expect(underTest.scene.children.length).to.equal(0);
            });
        });
    });

});