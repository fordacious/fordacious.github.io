define(function(){

    var meshes = {};

    return {
        addMesh: function(mesh, name) {
            if (!mesh) { return; }
            if(!name){ name = mesh.name;}
            if(meshes[name]){ throw new Error("Mesh already exists"); }

            meshes[name] = mesh;
        },

        getMesh: function(name){
            return meshes[name] ? meshes[name].clone(undefined, true): undefined;
        },

        removeAllMeshes: function(){
            meshes = {};
        }
    };
});