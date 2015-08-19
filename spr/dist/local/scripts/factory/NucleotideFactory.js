define(function(require){

    var THREE = require('threejs');

    var DNA = require('constants/DNA');

    var ThreeDObjectUtils = require('componentLibrary3D/utils/ThreeDObjectUtils');
    var MeshLibrary = require('componentLibrary3D/data/MeshLibrary');

    var connectorMaterialLeft = new THREE.LineBasicMaterial({ color: 0xdddddd });
    var connectorMaterialRight = new THREE.LineBasicMaterial({ color: 0x44ffff });
    var purineToDexoyRiboseLineLeft = null;
    var pyrimidineToDexoyRiboseLineLeft = null;
    var purineToDexoyRiboseLineRight = null;
    var pyrimidineToDexoyRiboseLineRight = null;

    var baseScale = 4;

    function getNucleotideRotation () {
        return {x:Math.PI / 2, y:-Math.PI / 2, z:0};
    }

    function getNucleotideScale () {
        return {x:baseScale, y:baseScale, z:baseScale};
    }

    function createNucleotideOnEntity (entity, parent, base, right) {
        if (purineToDexoyRiboseLineLeft === null) {
            purineToDexoyRiboseLineLeft = new THREE.Line(
                ThreeDObjectUtils.CreateLineGeometry(
                    new THREE.Vector3(-1.4, 0, 8),
                    new THREE.Vector3(-5.3, 0, 15)
                ),
                connectorMaterialLeft
            );
            pyrimidineToDexoyRiboseLineLeft = new THREE.Line(
                ThreeDObjectUtils.CreateLineGeometry(
                    new THREE.Vector3(0, 0, 0),
                    new THREE.Vector3(-5.3, 0, 15)
                ),
                connectorMaterialLeft
            );
            purineToDexoyRiboseLineRight = new THREE.Line(
                ThreeDObjectUtils.CreateLineGeometry(
                    new THREE.Vector3(-1.4, 0, 8),
                    new THREE.Vector3(-5.3, 0, 15)
                ),
                connectorMaterialRight
            );
            pyrimidineToDexoyRiboseLineRight = new THREE.Line(
                ThreeDObjectUtils.CreateLineGeometry(
                    new THREE.Vector3(0, 0, 0),
                    new THREE.Vector3(-5.3, 0, 15)
                ),
                connectorMaterialRight
            );
        }

        var pos = {x:0, y:0, z:0};
        var rot = getNucleotideRotation();
        var scale = getNucleotideScale();

        var mesh = ThreeDObjectUtils.CreateMeshOnEntity(entity, parent, DNA.getModelName(base), pos, rot, scale);

        // line from nucleotide to deoxyribose
        if (DNA.isPurine(base)) {
            //mesh.add(right ? purineToDexoyRiboseLineRight.clone() : purineToDexoyRiboseLineLeft.clone());
        } else {
            //mesh.add(right ? pyrimidineToDexoyRiboseLineRight.clone() : pyrimidineToDexoyRiboseLineLeft.clone());
        }

        var phosphorus = new THREE.Mesh(new THREE.SphereGeometry(1.5, 8, 8), new THREE.MeshLambertMaterial({ color: 0x461B94, overdraw: 0.5 }));
        phosphorus.position.z = 28;
        //mesh.add(phosphorus);

        //attachLeftPhosphorusLine(mesh, phosphorus, right);

        return mesh;
    }

    function attachRightPhosphorusLine (mesh, spacing, right) {
        mesh.add(new THREE.Line(ThreeDObjectUtils.CreateLineGeometry(
            new THREE.Vector3(-5.2,0,23),
            new THREE.Vector3(-spacing / baseScale - 1,0,29)
        ), right ? connectorMaterialRight : connectorMaterialLeft));
    }

    function attachLeftPhosphorusLine (mesh, phosphorus, right) {
        var connectionPoint = {x:1.5,y:0,z:23};

        mesh.add(new THREE.Line(ThreeDObjectUtils.CreateLineGeometry(
            new THREE.Vector3(-2, 0, 21),
            new THREE.Vector3(connectionPoint.x,connectionPoint.y,connectionPoint.z)
        ), right ? connectorMaterialRight : connectorMaterialLeft));

        mesh.add(new THREE.Line(ThreeDObjectUtils.CreateLineGeometry(
            new THREE.Vector3(connectionPoint.x,connectionPoint.y,connectionPoint.z),
            new THREE.Vector3(phosphorus.position.x,phosphorus.position.y,phosphorus.position.z)
        ), right ? connectorMaterialRight : connectorMaterialLeft));
    }

    function getNucleotideBoundingBox () {
        var mesh = MeshLibrary.getMesh(DNA.getModelName(DNA.ADENINE));
        var rot = getNucleotideRotation();
        var scale = getNucleotideScale();
        mesh.rotation.x = rot.x;
        mesh.rotation.y = rot.y;
        mesh.rotation.z = rot.z;
        mesh.scale.x = scale.x;
        mesh.scale.y = scale.y;
        mesh.scale.z = scale.z;
        return new THREE.Box3().setFromObject(mesh);
    }

    function getNucleotideWidth () {
        var bb = getNucleotideBoundingBox();
        return bb.max.x - bb.min.x;
    }

    function getNucleotideHeight () {
        var bb = getNucleotideBoundingBox();
        return bb.max.y - bb.min.y;
    }

    return {
        CreateNucleotideOnEntity: createNucleotideOnEntity,
        AttachRightPhosphorusLine: attachRightPhosphorusLine,
        GetNucleotideWidth: getNucleotideWidth,
        GetNucleotideHeight: getNucleotideHeight,
        GetNucleotideRotation: getNucleotideRotation
    };
});