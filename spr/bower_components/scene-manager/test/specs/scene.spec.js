/*globals HTMLDivElement, document*/
define(function(require){
    var sinon = require('sinon');
    var $ = require('jquery');

    var ComponentSystem = require('ComponentSystem');
    var ComponentLibrary = require('ComponentLibrary');
    var ComponentQuery = require('ComponentQuery');

    var Scene = require('Scene');
    var sandbox = sinon.sandbox.create();

    var config;

    var _createEntity = ComponentSystem.createEntity;

    function newSceneInstance(){
        return Scene.create(config);
    }

    var testComponent = function(){};

    describe('Scene', function(){
        beforeEach(function(){

            ComponentLibrary.init({
                component1: function(){},
                component2: function(){},
                component3: function(){},
                test: function(){},
                test2: testComponent,
                test3: function(){}
            });

            sandbox.stub(ComponentSystem, 'createEntity', function(){
                var entity = _createEntity.apply(ComponentSystem, arguments);
                sandbox.spy(entity, 'addComponent');
                sandbox.spy(entity, 'destroy');
                return entity;
            });

            sandbox.spy(ComponentLibrary, "getComponent");

            ComponentSystem.start();
        });

        afterEach(function(){
            config = undefined;

            sandbox.restore();
        });

        describe('creation', function(){
            it('should set the passed in id attribute', function(){
                config = { 'id': 'Test' };
                var scene = newSceneInstance();
                expect(scene.id).to.equal('Test');
            });

            it('should set it\'s own id, if no id is passed in', function(){
                var scene = newSceneInstance();
                expect(scene.id).to.equal(1);
            });

            it('should create an empty wrapper for the scene', function(){
                var scene = newSceneInstance();
                expect(scene.$el[0]).to.be.instanceof(HTMLDivElement);
            });

            it('should add an id to the created scene holder', function(){
                config = { 'id': 's1' };
                var scene = newSceneInstance();
                expect(scene.$el.attr('id')).to.equal('scene_s1');
            });

            it('should save the config', function(){
                config = { 'id': 's1' };
                var scene = newSceneInstance();
                expect(scene.config).to.equal(config);
            });
        });

        describe('addEntity', function(){
            it('should create an entity with the given name and config', function(){
                var scene = newSceneInstance();
                scene.addEntity('test', {});
                expect(scene.Entities.test).to.not.equal(undefined);
            });
            it('should get all components from the component library', function(){
                var scene = newSceneInstance();
                scene.addEntity('test', {'components': {'component1': {}, 'component2': {}}});

                expect(ComponentLibrary.getComponent.calledTwice).to.equal(true);

            });
            it('should attach all components to the entity', function(){
                var scene = newSceneInstance();
                scene.addEntity('test', {'components': {'component1': {}, 'component2': {}}});
                var entity = scene.Entities.test;
                expect(entity.addComponent.calledTwice).to.equal(true);
            });

            it('should return the created entity', function(){
                var scene = newSceneInstance();
                var testEntity = scene.addEntity('test', {'components': {'component1': {}, 'component2': {}}});
                var entity = scene.Entities.test;
                expect(testEntity).to.equal(entity);
            });

            it('should keep the componentName property on each component’s original config', function(){
                var scene = newSceneInstance();
                var config = {'components': {'component1': {'componentName': 'test'}}};
                scene.addEntity('test', config);
                expect(config.components.component1.componentName).to.equal('test');
            });

            it('should add children to the scene', function(){
                var scene = newSceneInstance();
                var config = {'components': {'component1': {'componentName': 'test'} }, 'children': { 'child': { components: { 'component1': {'componentName': 'test2'} } } } };
                var testEntity = scene.addEntity('test', config);
                expect(scene.Entities.test).to.equal(testEntity);
                expect(scene.Entities['test.child']).to.be.ok();
            });

            it('should add children of children to the scene', function(){
                var scene = newSceneInstance();
                var config = {'components': {'component1': {'componentName': 'test'} }, 'children': { 'child': { components: { 'component1': {'componentName': 'test2'} },
                    children : { 'child2': { components: { 'component2': {'componentName': 'test3'} } } } } } };
                var testEntity = scene.addEntity('test', config);
                expect(scene.Entities.test).to.equal(testEntity);
                expect(scene.Entities['test.child']).to.be.ok();
                expect(scene.Entities['test.child.child2']).to.be.ok();
            });
        });

        describe('addComponent', function(){
            it('should not deeply extend the config', function(){
                var shared = {x: 0};
                var scene = newSceneInstance();
                var testEntity = scene.addEntity('test', {'components': {'component1': { 'shared': shared }, 'component2': { 'shared': shared}}});
                testEntity.component1.shared.x = 10;
                expect(testEntity.component2.shared.x).to.equal(10);
            });
        });

        describe('start', function(){
            it('should create all entities in the config', function(){
                config = { 'entities': {
                    'ent1': {'components': {'component1': {}, 'component2': {}}},
                    'ent2': {'components': {'component1': {}, 'component3': {}}}
                } };
                var scene = newSceneInstance();
                scene.start();
                expect(Object.keys(scene.Entities).length).to.equal(2);
                expect(ComponentSystem.createEntity.calledTwice).to.equal(true);
            });

            it('should create all factories in the config', function(){
                config = {
                    'factories': {
                        'factory1': {'components': {'component1': {}, 'component2': {} } }
                    },
                    'entities': {
                        'ent1': {'components': {'component1': {}, 'component2': {}}},
                        'ent2': {'components': {'component1': {}, 'component3': {}}}
                    }
                };
                var scene = newSceneInstance();
                scene.start();
                expect(Object.keys(scene.Factories).length).to.equal(1);
            });
        });

        describe('unload', function(){
            it('should remove all entities from the Entities object', function(){
                config = {
                    'entities': {
                        'ent1': {'components': {'component1': {}, 'component2': {}}},
                        'ent2': {'components': {'component1': {}, 'component3': {}}}
                    }
                };
                var scene = newSceneInstance();
                scene.start();
                expect(Object.keys(scene.Entities).length).to.equal(2);
                scene.unload();
                expect(Object.keys(scene.Entities).length).to.equal(0);
            });

            it('should remove all entities from the Entities object', function(){
                config = {
                    'entities': {
                        'ent1': {'components': {'component1': {}, 'component2': {}}},
                        'ent2': {'components': {'component1': {}, 'component3': {}}}
                    }
                };
                var scene = newSceneInstance();
                scene.start();

                var ent1 = scene.Entities.ent1;
                var ent2 = scene.Entities.ent2;

                scene.unload();

                expect(ent1.destroy.called).to.equal(true);
                expect(ent2.destroy.called).to.equal(true);
            });

            it('should detach the wrapper from DOM', function(){
                var scene = newSceneInstance();
                $(document.body).append(scene.$el);
                scene.unload();
                expect(scene.$el[0].parentNode).to.equal(null);
            });

            it('should remove all factories from the Factories object', function(){
                config = {
                    'factories': {
                        'factory1': {'components': {'component1': {}, 'component2': {} } }
                    },
                    'entities': {
                        'ent1': {'components': {'component1': {}, 'component2': {}}},
                        'ent2': {'components': {'component1': {}, 'component3': {}}}
                    }
                };
                var scene = newSceneInstance();
                scene.start();
                expect(Object.keys(scene.Factories).length).to.equal(1);
                scene.unload();
                expect(Object.keys(scene.Factories).length).to.equal(0);
            });
        });

        describe('resolveReferences', function(){
            it('should resolve all marked references', function(){
                sinon.stub(ComponentQuery, 'resolveComponentReferences');
                config = {
                    'factories': {
                        'factory1': {'components': {'component1': {}, 'component2': {} } }
                    },
                    'entities': {
                        'ent1': {'components': {'component1': {}, 'component2': {}}}
                    }
                };
                var scene = newSceneInstance();
                scene.start();
                scene.resolveReferences();
                expect(ComponentQuery.resolveComponentReferences.calledOnce).to.equal(true);
                ComponentQuery.resolveComponentReferences.restore();
            });

            it('should resolve children references', function(){
                config = { 'entities': {
                    'ent1': {'components': {'component1': {}, 'component2': {}}, children: { child: {components: {'component1': {}} } } },
                    'ent2': { 'components': { component3: {componentName: 'test2', reference: "&ent1.child.component1"} } }
                } };

                var componentStarted = false;
                var scene = newSceneInstance();
                testComponent.prototype.start = function(){
                    componentStarted = true;
                    expect(this.reference).to.equal(scene.Entities['ent1.child'].component1);
                };

                scene.start();
                scene.resolveReferences();
                ComponentSystem.update(this);

                expect(componentStarted).to.equal(true);

            });
        });
    });
});