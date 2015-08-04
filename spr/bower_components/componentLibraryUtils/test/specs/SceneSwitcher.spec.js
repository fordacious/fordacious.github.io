define(function(require) {
    var sinon = require('sinon');
    var SceneManager = require('SceneManager');
    var SceneSwitcher = require('SceneSwitcher');
    var Model = require('ExtendedBackboneModel');

    describe('Scene Switcher', function() {
        var underTest, model, sceneProperty;
        var sandbox;

        beforeEach(function() {
            sceneProperty = "scene";

            model = new Model();
            model.set(sceneProperty, 'one');

            underTest = new SceneSwitcher();
            underTest.model = model;
            underTest.sceneProperty = sceneProperty;

            sandbox = sinon.sandbox.create();
            sandbox.stub(SceneManager, 'startScene');
        });

        afterEach(function() {
            sandbox.restore();
            SceneManager.ActiveScene = null;
        });

        describe('start', function() {
            it("should switch the scene if it isn't already on the scene", function() {
                SceneManager.ActiveScene = { id: "asdfasdf" };

                model.set(sceneProperty, 'two');

                underTest.start();

                expect(SceneManager.startScene.callCount).to.equal(1);
                expect(SceneManager.startScene.getCall(0).args[0]).to.equal('two');
            });

            it('should not switch the scene if the active scene is already the specified scene', function() {
                SceneManager.ActiveScene = { id: 'one' };

                underTest.start();

                expect(SceneManager.startScene.callCount).to.equal(0);
            });
        });

        describe('when model changes', function() {
            beforeEach(function() {
                SceneManager.ActiveScene = { id: "one" };
                underTest.start();
            });

            it('should change the scene', function() {
                model.set(sceneProperty, 'two');

                expect(SceneManager.startScene.callCount).to.equal(1);
                expect(SceneManager.startScene.getCall(0).args[0]).to.equal('two');
            });

            it('should set sceneSwitched', function() {
                model.set(sceneProperty, 'two');

                expect(underTest.sceneSwitched).to.equal(true);
            });
        });
    });
});