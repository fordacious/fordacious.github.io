define(function(require){

    var THREE = require('threejs');
    var BaseLoader = require('./BaseLoader');

    var MeshLibrary = require('../data/MeshLibrary');

    var JSONLoader = function () {
        return new BaseLoader(THREE.JSONLoader,
            function (name, geometry, materials) {
                materials.map(function (m) {
                    m.overdraw = 1;
                });
                var material = new THREE.MeshFaceMaterial( materials );
                var result = new THREE.Mesh( geometry, material );
                MeshLibrary.addMesh(result, name);
            }
        );
    };

    return JSONLoader;
});