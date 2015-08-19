define(function(require){

    var THREE = require('threejs');

    var ThreeDModelRenderer = require('../renderers/ThreeDModelRenderer');

    function CreateLineGeometry (v1,v2) {
        v1 = v1 || new THREE.Vector3(0,0);
        v2 = v2 || new THREE.Vector3(0,0);
        var geometry = new THREE.Geometry();
        geometry.vertices.push(v1);
        geometry.vertices.push(v2);
        return geometry;
    }

    function CreateMeshOnEntity (entity, parent, modelname, position, rotation, scale, smooth) {
        return entity.addComponent(ThreeDModelRenderer, {
            key: modelname,
            smooth: smooth || true,
            parent: parent,
            position: position || {x:0,y:0,z:0},
            rotation: rotation || {x:0,y:0,z:0},
            scale: scale || {x:1,y:1,z:1}
        });
    }

    function GetBoundingBox (object) {
        return new THREE.Box3().setFromObject(object.object3D);
    }

    return {
        GetBoundingBox: GetBoundingBox,
        CreateLineGeometry: CreateLineGeometry,
        CreateMeshOnEntity: CreateMeshOnEntity
    };
});