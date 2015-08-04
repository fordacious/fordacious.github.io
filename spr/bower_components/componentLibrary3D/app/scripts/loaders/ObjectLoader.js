define(function(require){

    var THREE = require('threejs');
    var BaseLoader = require('./BaseLoader');

    var MeshLibrary = require('../data/MeshLibrary');

    var ObjectLoader = function () {
        return new BaseLoader(THREE.ObjectLoader,
            function (name, results) {
                results.children.forEach(function(mesh){
                    MeshLibrary.addMesh(mesh, name);
                });
            }
        );
    };

    return ObjectLoader;
});