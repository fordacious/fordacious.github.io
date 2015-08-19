define(function(require){

    var MeshLibrary = require('3DComponents/data/MeshLibrary');

    describe('Mesh Library', function(){

        beforeEach(function(){
           MeshLibrary.removeAllMeshes();
        });

        describe("addMesh", function(){

            it('should return if mesh is falsey', function(){
                MeshLibrary.addMesh(undefined, "name");
                expect(MeshLibrary.getMesh('name')).to.equal(undefined);
            });

            it('should use the name of the mesh if name isn\'t supplied', function(){
                var mesh = {name: "name"};
                mesh.clone = function(){ return mesh; };

                MeshLibrary.addMesh(mesh);

                expect(MeshLibrary.getMesh('name')).to.equal(mesh);
            });

            it('should throw if mesh name already exists', function(){
                var mesh = {name: "name"};
                MeshLibrary.addMesh(mesh);

                expect(function(){ MeshLibrary.addMesh(mesh); }).to.throw('Mesh already exists');
            });

        });

    });

});