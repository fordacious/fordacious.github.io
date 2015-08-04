/*globals document, window*/
define(function(require){
    var sinon = require('sinon');
    var $ = require('jquery');
    var ComponentSystem = require('ComponentSystem');

    var Manager = require('Manager');
    var Scene = require('Scene');

    var $el = $('<div/>');
    $('body').append($el);

    var config,
    tempRequest = window.requestAnimationFrame;
    function newManagerInstance(){
        Manager.create(config);
        return Manager;
    }

    describe('Scene Manager', function(){
        afterEach(function(){
            Manager.Scenes = {};
            Manager.ActiveScene = null;
            Manager.parent = null;
            Manager.$el = null;
        });

        describe('creation', function(){
            beforeEach(function(){
                sinon.stub(Scene, 'create' ).returnsArg(0);
                sinon.stub(ComponentSystem, 'start' );
                $el.empty();
            });

            afterEach(function(){
                config = undefined;
                Scene.create.restore();
                ComponentSystem.start.restore();
            });

            it('should throw an error if no config file is passed in', function(){
                expect(newManagerInstance).to.throw(Error);
            });

            it("should throw an error if the config file doesn't have a 'scenes' key defined", function(){
                config = {};
                expect(newManagerInstance).to.throw(Error);
            });

            it('should throw an error if are no scenes defined in the "scenes" key', function(){
                config = {
                    'scenes': {}
                };
                expect(newManagerInstance).to.throw(Error);
            });

            it('should create all the defined scenes', function(){
                config = {
                    'scenes': {
                        'Scene1': {'id': 's1'},
                        'Scene2': {'id': 's2'},
                        'Scene3': {'id': 's3'}
                    }
                };
                var manager = newManagerInstance();
                expect(Object.keys(manager.Scenes).length).to.equal(3);
                expect(Scene.create.calledThrice).to.equal(true);
            });

            it('should throw an error if a duplicated ID is found', function(){
                config = {
                    'scenes': {
                        'Scene1': {'id': 's1'},
                        'Scene2': {'id': 's2'},
                        'Scene3': {'id': 's2'}
                    }
                };
                expect(newManagerInstance).to.throw(Error);
            });

            it('should expose the given parent', function(){
                config = {
                    'scenes': {'Scene1': {}},
                    'parent': $el.get(0)
                };

                var manager = newManagerInstance();
                var el = $el[0];
                expect(manager.parent).to.equal(el);
            });

            it('should set the parent to body if no parent was given', function(){
                config = {
                    'scenes': {'Scene1': {}}
                };

                var manager = newManagerInstance();
                expect(manager.parent).to.equal(document.body);
            });

            it('should create $el', function(){
                config = {
                    'scenes': {'Scene1': {}}
                };

                var manager = newManagerInstance();
                expect(manager.$el[0]).to.equal(manager.parent);
            });

            it('should start the component system', function(){
                config = {
                    'scenes': {'Scene1': {}}
                };

                newManagerInstance();
                expect(ComponentSystem.start.calledOnce).to.equal(true);
            });
        });

        describe('starting a scene', function(){

            beforeEach(function(){
                sinon.stub(Scene.prototype, 'start');
                sinon.stub(Scene.prototype, 'unload');
            });

            afterEach(function(){
                config = undefined;
                Scene.prototype.start.restore();
                Scene.prototype.unload.restore();
            });

            it('should call the start method on the scene', function(){
                config = {
                    'scenes': {'Scene1': { 'id': 's1'}}
                };
                var manager = newManagerInstance();
                manager.startScene('s1');
                expect(manager.Scenes['s1'].start.calledOnce).to.equal(true);
            });

            it('should append the scene DOM to the sceneManager DOM element', function(){
                config = {
                    'parent': $el.get(0),
                    'scenes': {'Scene1': { 'id': 's1'}}
                };
                var manager = newManagerInstance();
                manager.startScene('s1');
                expect($el.find('#scene_s1' ).length).to.equal(1);
            });

            it('should start the first scene when no argument is provided or the provided scene id is not valid', function(){
                config = {
                    'scenes': {'Scene1': { 'id': 's3'}, 'Scene2': { 'id': 's2'}}
                };
                var manager = newManagerInstance();
                manager.startScene();
                expect(manager.Scenes['s3'].start.calledOnce).to.equal(true);
            });

            it('should set the Active property to the newly created scene', function(){
                config = {
                    'scenes': {'Scene1': { 'id': 's1'}}
                };
                var manager = newManagerInstance();
                manager.startScene('s1');
                expect(manager.ActiveScene).to.equal(manager.Scenes['s1']);
            });

            it('should unload the active scene, if any', function(){
                config = {
                    'scenes': {'Scene1': { 'id': 's3'}, 'Scene2': { 'id': 's2'}}
                };
                var manager = newManagerInstance();
                manager.startScene('s3');
                manager.startScene('s2');
                expect(manager.Scenes['s3'].unload.calledOnce).to.equal(true);
            });

            it('should return the started scene', function(){
                config = {
                    'scenes': {'Scene1': { 'id': 's1'}}
                };
                var manager = newManagerInstance();
                var scene = manager.startScene('s1');
                expect(scene).to.equal(manager.Scenes['s1']);
            });
        });

        describe('update cycle', function(){
            beforeEach(function(){
                window.requestAnimationFrame = function(){};
            });

            afterEach(function(){
                window.requestAnimationFrame = tempRequest;
            });

            it('should tell the scene to resolve references on each update loop ', function(){
                sinon.stub(Scene.prototype, 'resolveReferences');
                config = {
                    'scenes': {'Scene1': { 'id': 's1'}}
                };
                var manager = newManagerInstance();

                manager.startScene('s1');
                manager.update();
                manager.update();
                manager.update();
                expect(Scene.prototype.resolveReferences.calledThrice).to.equal(true);
                Scene.prototype.resolveReferences.restore();
            });
        });
    });
});