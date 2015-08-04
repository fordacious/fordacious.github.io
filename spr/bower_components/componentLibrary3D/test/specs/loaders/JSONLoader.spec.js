define(function(require){
    var JSONLoader = require('3DComponents/loaders/JSONLoader');
    var SceneManager = require('SceneManager');
    var MeshLibrary = require('3DComponents/data/MeshLibrary');
    var sinon = require('sinon');

    var model = {
        "faces": [33,0,2,3,1,0,1,2,3,32,0,4,2,0,4,1,32,5,6,13,5,6,7,33,4,7,8,2,4,8,9,1,33,5,11,12,6,5,10,11,6,33,4,9,10,7,4,12,13,8,33,13,6,14,15,7,6,14,15,33,13,15,16,17,7,15,16,17,33,9,4,13,17,12,4,7,17,33,7,10,16,15,8,13,16,15,33,2,8,14,6,1,9,14,6,33,10,9,17,16,13,12,17,16,33,8,7,15,14,9,8,15,14,33,4,0,5,13,4,0,5,7,33,3,2,6,12,2,1,6,11,33,1,3,12,11,3,2,11,10,33,0,1,11,5,0,3,10,5],
        "name": "PlaneGeometry.2",
        "normals": [-0.267342,-0.594134,0.758599,0.343822,-0.787164,-0.511979,0.636464,-0.591357,-0.495132,0.647267,-0.595965,0.475234,-0.217689,-0.854213,0.472091,-0.271279,0.593402,0.757775,0.343822,0.797235,-0.496139,-0.239143,0.833308,0.498337,-0.473434,-0.617176,-0.628407,0.281106,-0.592151,-0.755181,0.64745,0.593799,0.477645,0.637501,0.59209,-0.492904,-0.358318,-0.60271,0.712973,-0.799036,-0.600971,0.017792,0.282968,0.610523,-0.739677,-0.465987,0.633686,-0.61745,-0.786554,0.616962,0.025788,-0.340495,0.607074,0.717978],
        "metadata": {
            "faces": 17,
            "normals": 18,
            "version": 3,
            "generator": "io_three",
            "vertices": 18,
            "type": "Geometry",
            "uvs": 0
        },
        "vertices": [-1,0,0.935807,0.036128,0,0.613182,-1.03512,0.004234,-0.888363,0.036128,-0,-0.613182,-1.61427,-0.022431,0.010922,-1.00008,0.07226,0.936039,-1.0352,0.076493,-0.888131,-2.5785,0.023162,-1.48462,-1.62269,0.019963,-1.70254,-2.53246,0.007962,0.107153,-3.02216,0.019458,-0.677906,0.036048,0.07226,0.613414,0.036048,0.07226,-0.61295,-1.61435,0.049828,0.011154,-1.62277,0.092223,-1.70231,-2.57858,0.095422,-1.48439,-3.02224,0.091717,-0.677674,-2.53254,0.080222,0.107384],
        "uvs": []
    };

    describe('JSONLoader', function(){
        var underTest;

        MeshLibrary.removeAllMeshes();

        beforeEach(function(){
            underTest = new JSONLoader();
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
                    var model1 = model;
                    var model2 = model;

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

                    expect(MeshLibrary.addMesh.callCount).to.equal(1);
                });

                it('should move to the next scene once all models have been added', function(){
                    underTest.models = [{model: "model1", name: "model1"},{model: "model2", name: "model2"}];
                    underTest.nextSceneId = "nextScene";
                    underTest.initialize();
                    expect(MeshLibrary.addMesh.callCount).to.equal(2);
                    expect(SceneManager.startScene.callCount).to.equal(1);
                });

            });

        });

    });
});