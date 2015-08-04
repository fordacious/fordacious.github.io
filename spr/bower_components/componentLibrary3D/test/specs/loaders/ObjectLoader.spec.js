define(function(require){
    var ObjectLoader = require('3DComponents/loaders/ObjectLoader');
    var SceneManager = require('SceneManager');
    var MeshLibrary = require('3DComponents/data/MeshLibrary');
    var sinon = require('sinon');

    describe('ObjectLoader', function(){
        var underTest;

        MeshLibrary.removeAllMeshes();

        beforeEach(function(){
            underTest = new ObjectLoader();
            sinon.stub(SceneManager, 'startScene');
            sinon.stub(MeshLibrary, "addMesh");
        });

        afterEach(function(){
            SceneManager.startScene.restore();
            MeshLibrary.addMesh.restore();
        });

        describe('initialize', function(){

            it('should throw an error if nextSceneId is not given', function(){
                expect(function(){ underTest.initialize(); }).to.throw('nextSceneId must be given');
            });

            it('should call onComplete if no models were given', function(){
                underTest.nextSceneId = "nextScene";

                underTest.initialize();

                expect(SceneManager.startScene.callCount).to.equal(1);
            });

            describe('the loading of the objects', function(){

                var model1, model2;
                beforeEach(function(){
                    var model1 = {
                        children: [
                            {name: "Mesh01"},
                            {name: "Mesh02"}
                        ]
                    };
                    var model2 = {
                        children: [{name: "Mesh03"}]
                    };

                    underTest.path = '';

                    sinon.stub(underTest.loader, "load", function(url, callback){
                        if(url === "model1"){
                            callback(model1);
                        }
                        else if(url === "model2"){
                            callback(model2);
                        }
                    });

                    underTest.nextSceneeId ="nextSceneId";
                });

                it('should add mesh of the object to the mesh library', function(){

                    underTest.models = [{model: "model1", name: "model1"}];
                    underTest.nextSceneId = "nextScene";
                    underTest.initialize();

                    expect(MeshLibrary.addMesh.callCount).to.equal(2);
                });

                it('should move to the next scene once all models have been added', function(){
                    underTest.models = [{model: "model1", name: "model1"}, {model: "model2", name: "model2"}];
                    underTest.nextSceneId = "nextScene";
                    underTest.initialize();
                    expect(MeshLibrary.addMesh.callCount).to.equal(3);
                    expect(SceneManager.startScene.callCount).to.equal(1);
                });

            });

        });

    });
});