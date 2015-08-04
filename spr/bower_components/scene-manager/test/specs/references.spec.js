define(function(require){
    var sinon = require('sinon');

    var ComponentQuery = require('ComponentQuery');
    var ResolutionProperty = require('ResolutionProperty');
    var ComponentLibrary = require('ComponentLibrary');

    var Scene = require('Scene');

    var dummyRenderer = { 'componentName' : 'renderer' };
    var dummyManager = { 'componentName': 'manager', 'textures': {'watter': 20, 'forest': 20, 'ice': 20, 'desert': 20, 'rock': 20} };

    var multiref = { 'componentName' : 'manager', 'prop': '&albedoZones.manager', 'albedoZones': '&albedoZones.*', 'not':'ref' };

    var good1 = { 'componentName': 'manager', 'albedoZones': '&albedoZones.*' };
    var good2 = { 'componentName': 'manager', 'albedoZones': '&albedoZones.manager' };
    var good3 = { 'componentName': 'manager', 'albedoZones': '&renderer' };


    var bad1 = { 'componentName': 'manager', 'albedoZones': '&none.*' };
    var bad2 = { 'componentName': 'manager', 'albedoZones': '&albedoZones.none' };
    var bad3 = { 'componentName': 'manager', 'albedoZones': '&*.manager' };
    var bad4 = { 'componentName': 'manager', 'albedoZones': '&none' };
    var bad5 =  { 'componentName': 'manager', 'albedoZones': '&' };
    var bad6 = { 'componentName': 'manager', 'albedoZones': '&none.none' };

    var goodFactoryRef = { 'componentName': 'manager', 'albedoZones': '+entityFactory' };
    var badFactoryRef = { 'componentName': 'manager', 'albedoZones': '+none' };

    var reference1 = { 'component': 'reference1' };
    var reference2 = { 'component': 'reference2' };

    var dummyConstructor = function(){};

    function newSceneInstance(config){
        return Scene.create(config);
    }

    function genComponents (config) {
        var res = {};
        for (var i in config.entities) {
            if(!config.entities.hasOwnProperty(i)){ continue; }
            for (var j in config.entities[i].components) {
                if(!config.entities[i].components.hasOwnProperty(j)){ continue; }
                res[j] = dummyConstructor;
            }
        }
        return res;
    }

    describe('References', function(){

        function getRelevantComponent (scene) {
            return scene.Entities["albedoControls"].components[1].albedoZones;
        }

        describe('Resolution properties should be generated from reference properties', function(){
            it('should produce ResolutionProperties', function(){
                var props = ComponentQuery.addResolutionProperties([], multiref);
                expect(props.length).to.equal(2);
                expect(props[0]).to.be.instanceof(ResolutionProperty);
            });
        });

        describe('&entity.* should create a reference to "entity" in the property', function(){
            it('albedoControls should reference albedoZones', function(){
                ComponentLibrary.init(genComponents(QueryConfigs.GoodConfig1));
                var scene = newSceneInstance(QueryConfigs.GoodConfig1);
                scene.start();
                scene.resolveReferences();
                expect(getRelevantComponent(scene)).to.equal(scene.Entities["albedoZones"]);
            });
        });

        describe('&entity should create a reference to "entity" in the property', function(){
            it('albedoControls should reference albedoZones.manager', function(){
                ComponentLibrary.init(genComponents(QueryConfigs.GoodConfig2));
                var scene = newSceneInstance(QueryConfigs.GoodConfig2);
                scene.start();
                scene.resolveReferences();
                expect(getRelevantComponent(scene)).to.equal(scene.Entities["albedoZones"].components[1]);
            });
        });

        describe('&component should create a reference to "component" on the entity that the property belongs to, in the property', function(){
            it('albedoControls should reference albedoControls.renderer', function(){
                ComponentLibrary.init(genComponents(QueryConfigs.GoodConfig3));
                var scene = newSceneInstance(QueryConfigs.GoodConfig3);
                scene.start();
                scene.resolveReferences();
                expect(getRelevantComponent(scene)).to.equal(scene.Entities["albedoControls"].components[0]);
            });
        });

        describe('&entity.* should set the property to null if no entity of that name exists', function(){
            it('should produce null', function(){
                ComponentLibrary.init(genComponents(QueryConfigs.BadConfig1));
                var scene = newSceneInstance(QueryConfigs.BadConfig1);
                scene.start();
                scene.resolveReferences();
                expect(getRelevantComponent(scene)).to.equal(null);
            });
        });

        describe('&entity.component should set the property to null if no component of that name exists on the entity', function(){
            it('should produce null', function(){
                ComponentLibrary.init(genComponents(QueryConfigs.BadConfig1));
                var scene = newSceneInstance(QueryConfigs.BadConfig1);
                scene.start();
                scene.resolveReferences();
                expect(getRelevantComponent(scene)).to.equal(null);
            });
        });

        describe('&*.component should set the property to null', function(){
            it('should produce null', function(){
                ComponentLibrary.init(genComponents(QueryConfigs.BadConfig1));
                var scene = newSceneInstance(QueryConfigs.BadConfig1);
                scene.start();
                scene.resolveReferences();
                expect(getRelevantComponent(scene)).to.equal(null);
            });
        });

        describe('&entity should set the property to null', function(){
            it('should produce null', function(){
                ComponentLibrary.init(genComponents(QueryConfigs.BadConfig1));
                var scene = newSceneInstance(QueryConfigs.BadConfig1);
                scene.start();
                scene.resolveReferences();
                expect(getRelevantComponent(scene)).to.equal(null);
            });
        });

        describe('& should set the property to null', function(){
            it('should produce null', function(){
                ComponentLibrary.init(genComponents(QueryConfigs.BadConfig1));
                var scene = newSceneInstance(QueryConfigs.BadConfig1);
                scene.start();
                scene.resolveReferences();
                expect(getRelevantComponent(scene)).to.equal(null);
            });
        });

        describe('&entity.component should set the property to null if no entity of that name exists', function(){
            it('should produce null', function(){
                ComponentLibrary.init(genComponents(QueryConfigs.BadConfig6));
                var scene = newSceneInstance(QueryConfigs.BadConfig6);
                scene.start();
                scene.resolveReferences();
                expect(getRelevantComponent(scene)).to.equal(null);
            });
        });

        describe('Scan arrays for reference and resolve them', function(){
            it('should apply reference', function(){
                ComponentLibrary.init(genComponents(QueryConfigs.ReferenceConfig1));
                var scene = newSceneInstance(QueryConfigs.ReferenceConfig1);
                scene.start();
                scene.resolveReferences();

                expect(scene.Entities["validateIntAge"].components[2].validators[0]).to.equal(scene.Entities["validateIntAge"].components[0]);
                expect(scene.Entities["validateIntAge"].components[2].validators[1]).to.equal(scene.Entities["validateIntAge"].components[1]);
            });
        });

        describe('Scan arrays for reference and resolve them leaving non-references untouched', function(){
            it('should apply reference and leave non-references untouched', function(){
                ComponentLibrary.init(genComponents(QueryConfigs.ReferenceConfig2));
                var scene = newSceneInstance(QueryConfigs.ReferenceConfig2);
                scene.start();
                scene.resolveReferences();

                expect(scene.Entities["validateIntAge"].components[1].validators[0]).to.equal(scene.Entities["validateIntAge"].components[0]);
                expect(scene.Entities["validateIntAge"].components[1].validators[1]).to.equal("untouched");
                expect(scene.Entities["validateIntAge"].components[1].validators[2]).to.equal(5);
            });
        });

        describe('when referencing a factory with +factoryName', function(){
            it('should set the property to the factory', function(){
                ComponentLibrary.init(genComponents(QueryConfigs.GoodFactoryConfig));
                var scene = newSceneInstance(QueryConfigs.GoodFactoryConfig);
                scene.start();
                scene.resolveReferences();
                expect(getRelevantComponent(scene)).to.equal(scene.Factories["entityFactory"]);
            });
        });

        describe('when a referencing a factory name that does not exist with +factoryName', function(){
            it('should set the property to null', function(){
                ComponentLibrary.init(genComponents(QueryConfigs.BadFactoryConfig));
                var scene = newSceneInstance(QueryConfigs.BadFactoryConfig);
                scene.start();
                scene.resolveReferences();
                expect(getRelevantComponent(scene)).to.equal(null);
            });
        });

        describe('&entity.component reference in factory', function(){
            it('should be resolved immediately', function(){
                var entityName = "test";
                ComponentLibrary.init(genComponents(QueryConfigs.EntityReferencesFromFactoryConfig));
                var scene = newSceneInstance(QueryConfigs.EntityReferencesFromFactoryConfig);
                scene.start();
                scene.resolveReferences();
                var entity = scene.Factories["entityFactory"].create(entityName);
                expect(entity.manager.albedoZones).to.equal(entity.components[0]);
            });
        });

        describe('when referencing a parent', function() {
            var scene, config;

            beforeEach(function() {
                config = {
                    entities: {
                        parent: {
                            components: {
                                test: { componentName: 'testComponent'}
                            },
                            children: {
                                child: {
                                    components:{
                                        testComponent: {  }
                                    }
                                }
                            }
                        }
                    }
                };
                scene = Scene.create(config);

                ComponentLibrary.init({
                    testComponent: function() {}
                });
            });

            it('&^.* should fill in the property with the parent entity', function() {
                config.entities.parent.children.child.components.testComponent.parentRef = "&^.*";
                scene.start();
                scene.resolveReferences();

                var entity = scene.Entities.parent.children.child;
                expect(entity.components[0].parentRef).to.equal(scene.Entities.parent);
            });

            it('&^.componentName should fill in the property with the component on the parent entity', function() {
                config.entities.parent.children.child.components.testComponent.parentRef = "&^.test";

                scene.start();
                scene.resolveReferences();

                var entity = scene.Entities.parent.children.child;
                expect(entity.components[0].parentRef).to.equal(scene.Entities.parent.components[0]);
            });

            it('&^.^.* should fill the property with the parent of the parent', function() {
                config.entities.parent.children.child.children = {
                    grandchild: {
                        components: {
                            testComponent: { grandparentRef: '&^.^.*' }
                        }
                    }
                };

                scene.start();
                scene.resolveReferences();

                var entity = scene.Entities.parent.children.child.children.grandchild;
                expect(entity.components[0].grandparentRef).to.equal(scene.Entities.parent);
            });
        });
    });

    var QueryConfigs = {
        MultipleReferences : {
            'id': 'main',
            'entities': {
                // case 1
                'albedoZones': {
                    'components': {
                        'renderer' : dummyRenderer,
                        'manager': dummyManager
                    }
                },
                'albedoControls': {
                    'components': {
                        'renderer' : dummyRenderer,
                        'manager': multiref
                    }
                }
            }
        },
        GoodConfig1 : {
            'id': 'main',
            'entities': {
                // case 1
                'albedoZones': {
                    'components': {
                        'renderer' : dummyRenderer,
                        'manager': dummyManager
                    }
                },
                'albedoControls': {
                    'components': {
                        'renderer' : dummyRenderer,
                        'manager': good1
                    }
                }
            }
        },
        GoodConfig2 : {
            'id': 'main',
            'entities': {
                // case 1
                'albedoZones': {
                    'components': {
                        'renderer' : dummyRenderer,
                        'manager': dummyManager
                    }
                },
                'albedoControls': {
                    'components': {
                        'renderer' : dummyRenderer,
                        'manager': good2
                    }
                }
            }
        },
        GoodConfig3 : {
            'id': 'main',
            'entities': {
                // case 1
                'albedoZones': {
                    'components': {
                        'renderer' : dummyRenderer,
                        'manager': dummyManager
                    }
                },
                'albedoControls': {
                    'components': {
                        'renderer' : dummyRenderer,
                        'manager': good3
                    }
                }
            }
        },
        BadConfig1 : {
            'id': 'main',
            'entities': {
                // case 1
                'albedoZones': {
                    'components': {
                        'renderer' : dummyRenderer,
                        'manager': dummyManager
                    }
                },
                'albedoControls': {
                    'components': {
                        'renderer' : dummyRenderer,
                        'manager': bad1
                    }
                }
            }
        },
        BadConfig2 : {
            'id': 'main',
            'entities': {
                // case 1
                'albedoZones': {
                    'components': {
                        'renderer' : dummyRenderer,
                        'manager': dummyManager
                    }
                },
                'albedoControls': {
                    'components': {
                        'renderer' : dummyRenderer,
                        'manager': bad2
                    }
                }
            }
        },
        BadConfig3 : {
            'id': 'main',
            'entities': {
                // case 1
                'albedoZones': {
                    'components': {
                        'renderer' : dummyRenderer,
                        'manager': dummyManager
                    }
                },
                'albedoControls': {
                    'components': {
                        'renderer' : dummyRenderer,
                        'manager': bad3
                    }
                }
            }
        },
        BadConfig4 : {
            'id': 'main',
            'entities': {
                // case 1
                'albedoZones': {
                    'components': {
                        'renderer' : dummyRenderer,
                        'manager': dummyManager
                    }
                },
                'albedoControls': {
                    'components': {
                        'renderer' : dummyRenderer,
                        'manager': bad4
                    }
                }
            }
        },
        BadConfig5 : {
            'id': 'main',
            'entities': {
                // case 1
                'albedoZones': {
                    'components': {
                        'renderer' : dummyRenderer,
                        'manager': dummyManager
                    }
                },
                'albedoControls': {
                    'components': {
                        'renderer' : dummyRenderer,
                        'manager':bad5
                    }
                }
            }
        },
        BadConfig6 : {
            'id': 'main',
            'entities': {
                // case 1
                'albedoZones': {
                    'components': {
                        'renderer' : dummyRenderer,
                        'manager': dummyManager
                    }
                },
                'albedoControls': {
                    'components': {
                        'renderer' : dummyRenderer,
                        'manager':bad6
                    }
                }
            }
        },
        ReferenceConfig1 : {
            'id': 'main',
            'entities': {
                'validateIntAge': {
                    'components': {
                        'validateInteger': reference1,
                        'validateAge': reference2,
                        'validatorMaster': { validators: ['&validateInteger', '&validateAge']}
                    }
                }
            }
        },
        ReferenceConfig2 : {
            'id': 'main',
            'entities': {
                'validateIntAge': {
                    'components': {
                        'validateInteger': reference1,
                        'validatorMaster': { validators: ['&validateInteger', 'untouched', 5]}
                    }
                }
            }
        },
        GoodFactoryConfig : {
            'id': 'main',
            'factories': {
                'entityFactory': {
                    'components': {
                        'renderer' : dummyRenderer,
                        'manager': dummyManager
                    }
                }
            },
            'entities': {
                'albedoZones': {
                    'components': {
                        'renderer' : dummyRenderer,
                        'manager': dummyManager
                    }
                },
                'albedoControls': {
                    'components': {
                        'renderer' : dummyRenderer,
                        'manager': goodFactoryRef
                    }
                }
            }
        },
        BadFactoryConfig : {
            'id': 'main',
            'factories': {
                'entityFactory': {
                    'components': {
                        'renderer' : dummyRenderer,
                        'manager': dummyManager
                    }
                }
            },
            'entities': {
                'albedoZones': {
                    'components': {
                        'renderer' : dummyRenderer,
                        'manager': dummyManager
                    }
                },
                'albedoControls': {
                    'components': {
                        'renderer' : dummyRenderer,
                        'manager': badFactoryRef
                    }
                }
            }
        },
        EntityReferencesFromFactoryConfig : {
            'id': 'main',
            'factories': {
                'entityFactory': {
                    'components': {
                        'renderer' : dummyRenderer,
                        'manager': good3
                    }
                }
            },
            'entities': {
                'albedoZones': {
                    'components': {
                        'renderer' : dummyRenderer,
                        'manager': dummyManager
                    }
                },
                'albedoControls': {
                    'components': {
                        'renderer' : dummyRenderer,
                        'manager': goodFactoryRef
                    }
                }
            }
        },
    };
});