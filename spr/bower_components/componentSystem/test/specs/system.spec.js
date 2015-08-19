define(function(require) {
    var sinon = require('sinon');
    var componentSystem = require('system');

    describe('component system', function() {
        var thing, thing2, Component;

        beforeEach(function() {
            componentSystem.start();

            thing = componentSystem.createEntity();
            thing2 = componentSystem.createEntity();

            Component = function() {};
            Component.prototype.update = sinon.stub();
        });

        describe('when given a name', function(){

            it('should use the id as a name if no name is supplied', function(){
                expect(Object.keys(componentSystem.Entities).length).to.equal(2);
                expect(componentSystem.Entities[0]).to.equal(thing);
                expect(componentSystem.Entities[1]).to.equal(thing2);
            });

            it('should be able to retrieve entity by name', function(){
                var entity = componentSystem.createEntity("entity");

                expect(componentSystem.Entities.entity).to.equal(entity);
            });

        });

        describe('updating child name', function(){

            it('should update the child name when moved to another parent', function(){

                var entity = componentSystem.createEntity("entity");
                var child = componentSystem.createEntity("child");

                expect(componentSystem.Entities.child).to.equal(child);

                entity.addChild("child", child);

                expect(componentSystem.Entities.child).to.equal(undefined);
                expect(componentSystem.Entities["entity.child"]).to.equal(child);
            });

            it('should update the child name of all children when moved to another parent', function(){
                var entity = componentSystem.createEntity("entity");
                var child = componentSystem.createEntity("child");
                var childChild = componentSystem.createEntity('child2');
                var childChild2 = componentSystem.createEntity('child3');
                child.addChild("child2", childChild);
                childChild.addChild("child", childChild2);

                expect(componentSystem.Entities.child).to.equal(child);

                entity.addChild("child", child);

                expect(componentSystem.Entities.child).to.equal(undefined);
                expect(componentSystem.Entities["entity.child"]).to.equal(child);
                expect(componentSystem.Entities["entity.child.child2.child"]).to.equal(childChild2);
            });

        });

        describe('when start is called', function() {
            it('should destroy any entities already added', function() {
                thing.removeAllComponents = sinon.stub();
                thing2.removeAllComponents = sinon.stub();
                componentSystem.start();

                expect(thing.destroyed, 'thing destroyed').to.equal(true);
                expect(thing.removeAllComponents.called, 'removed all components').to.equal(true);
                expect(thing2.destroyed, 'thing2 destroyed').to.equal(true);
                expect(thing2.removeAllComponents.called, 'thing2 removed all components').to.equal(true);
            });
        });

        describe("when updating the component system", function() {
            var Component2, state;

            beforeEach(function() {
                state = {};
                Component2 = function() { };
                Component2.prototype.update = sinon.stub();
            });

            it("should call update on every component of every registered entity", function() {
                thing.addComponent(Component);
                thing.addComponent(Component2);
                thing2.addComponent(Component);

                componentSystem.update(state);

                expect(Component.prototype.update.calledTwice, 'component update called twice').to.equal(true);
                expect(Component2.prototype.update.calledOnce, 'component 2 update called once').to.equal(true);
            });

            it("should not call update on components on entities that are destroyed", function() {
                thing.addComponent(Component);
                thing.addComponent(Component2);
                thing2.addComponent(Component);

                thing.destroy();
                componentSystem.update(state);

                expect(Component.prototype.update.calledOnce, 'component one update called').to.equal(true);
                expect(Component2.prototype.update.called, 'component two called').to.equal(false);
            });

            it("should update an entity that was added during the update cycle", function() {
                Component.prototype.update = function() {
                    var thing3 = componentSystem.createEntity();
                    thing3.addComponent(Component2);
                    Component.update = sinon.stub();
                };
                thing.addComponent(Component);

                componentSystem.update(state);
                componentSystem.update(state);

                expect(Component2.prototype.update.called, 'update called').to.equal(true);
            });

            it("should remove all components on destroyed entities", function() {
                var stub1 = sinon.stub();
                var stub2 = sinon.stub();
                var component1 = function() {};
                component1.prototype.destroy = stub1;
                thing.addComponent(component1);
                var component2 = function() {};
                component2.prototype.destroy = stub2;
                thing.addComponent(component2);

                thing.destroy();
                componentSystem.update(state);

                expect(stub1.called, "destroy 1 called").to.equal(true);
                expect(stub2.called, 'destroy 2 called').to.equal(true);
            });

            it('should remove destroyed entities from the Entities list', function(){
                expect(Object.keys(componentSystem.Entities).length).to.equal(2);
                thing.destroy();
                componentSystem.update(state);
                expect(Object.keys(componentSystem.Entities).length).to.equal(1);
            });

            it('should call start on all entities before update is called on any of them', function() {
                var startStub = sinon.stub();
                var updateCalls = 0;
                var component = function() {};
                component.prototype.start = startStub;
                component.prototype.update = function() {
                    expect(startStub.callCount).to.equal(2);
                    ++updateCalls;
                };

                thing.addComponent(component);
                thing2.addComponent(component);

                componentSystem.update(state);

                expect(updateCalls).to.equal(2);
            });

            it('if a component is destroyed during start, update should not be called', function() {
                var updateCalls = 0;
                var component = function() {};
                component.prototype.start = function () {
                    this.entity.destroy();
                };

                component.prototype.update = function() {
                    ++updateCalls;
                };

                thing.addComponent(component);

                componentSystem.update(state);

                expect(updateCalls).to.equal(0);
            });

            it('should call start on components on new entities before calling update on old entities', function() {
                var startStub = sinon.stub();
                var updateCalls = 0;
                var startCalls = 0;

                var component = function() {};
                component.prototype.update = function() {
                    expect(startStub.callCount).to.equal(startCalls);
                    ++updateCalls;
                };

                var component2 = function() {};
                component2.prototype.start = startStub;
                thing.addComponent(component);
                componentSystem.update(state);

                var anotherThing = componentSystem.createEntity();
                anotherThing.addComponent(component2);
                startCalls = 1;
                componentSystem.update(state);

                expect(updateCalls).to.equal(2);
            });

            it('should call start on new components before update on old components', function() {
                var startStub = sinon.stub();
                var updateCalls = 0;
                var startCalls = 0;

                var component = function() {};
                component.prototype.update = function() {
                    expect(startStub.callCount).to.equal(startCalls);
                    ++updateCalls;
                };
                var component2 = function() {};
                component2.prototype.start = startStub;

                thing.addComponent(component);
                componentSystem.update(state);

                thing.addComponent(component2);
                startCalls = 1;
                componentSystem.update(state);

                expect(updateCalls).to.equal(2);
            });
        });

        describe("when finding instances of a component", function() {
            it("should return all the instances on entities that have been registered with the requested component", function() {
                var c1 = thing.addComponent(Component);
                var c2 = thing2.addComponent(Component);

                var instances = componentSystem.allInstancesOfComponent(Component);

                expect(instances.length).to.equal(2);
                expect(instances).to.include(c1);
                expect(instances).to.include(c2);
            });

            it("should only return the instances on entities that have been registered with the requested component", function() {
                var Component2 = function() {};
                thing.addComponent(Component);
                thing2.addComponent(Component);
                var thing2Component2 = thing2.addComponent(Component2);

                var instances = componentSystem.allInstancesOfComponent(Component2);

                expect(instances.length).to.equal(1);
                expect(instances).to.include(thing2Component2);
            });

            it("should not return instances from destroyed entities", function() {
                thing.addComponent(Component);
                var c2 = thing2.addComponent(Component);

                thing.destroy();
                var instances = componentSystem.allInstancesOfComponent(Component);

                expect(instances.length).to.equal(1);
                expect(instances).to.include(c2);
            });

            it("should not return an instance that has been removed from the entity", function() {
                var c1 = thing.addComponent(Component);
                var c2 = thing2.addComponent(Component);

                thing.removeComponent(c1);
                var instances = componentSystem.allInstancesOfComponent(Component);

                expect(instances.length).to.equal(1);
                expect(instances).to.include(c2);
            });

            it("should return an empty array for a component that has nothing registered", function() {
                thing.addComponent(Component);

                var instances = componentSystem.allInstancesOfComponent(function() {});

                expect(instances.length).to.equal(0);
            });

            it('during update it should return every instance from entities with the component', function() {
                Component.prototype.update = function() {
                    var entities = componentSystem.allInstancesOfComponent(Component);
                    expect(entities.length).to.equal(2);
                };
                thing.addComponent(Component);
                thing2.addComponent(Component);

                componentSystem.update({});
            });

            it('should return multiple instances of a component in an entity', function(){
                var c1 = thing.addComponent('name1', Component, {});
                var c2 = thing.addComponent('name2', Component, {});

                var instances = componentSystem.allInstancesOfComponent(Component);

                expect(instances.length).to.equal(2);
                expect(instances).to.include(c1);
                expect(instances).to.include(c2);
            });
        });

        describe("when finding the first entity with a component", function() {
            it("should return the first instance of the component on an entity registered with the system", function() {
                var c = thing.addComponent(Component);

                var instance = componentSystem.firstInstanceOfComponent(Component);

                expect(instance).to.equal(c);
            });

            it("should only return instances of the requested component", function() {
                var Component2 = function() {};
                thing.addComponent(Component);
                var c2 = thing2.addComponent(Component2);

                var instance = componentSystem.firstInstanceOfComponent(Component2);

                expect(instance).to.equal(c2);
            });

            it("should not return an instances from a destroyed entity", function() {
                thing.addComponent(Component);
                var c2 = thing2.addComponent(Component);

                thing.destroy();

                var instance = componentSystem.firstInstanceOfComponent(Component);
                expect(instance).to.equal(c2);
            });

            it("should not return an instance that has been removed from its entity", function(){
                var c1 = thing.addComponent(Component);
                var c2 = thing2.addComponent(Component);

                thing.removeComponent(c1);

                var instance = componentSystem.firstInstanceOfComponent(Component);
                expect(instance).to.equal(c2);
            });

            it("should return null for a component that has nothing registered", function() {
                var Component2 = function() {};
                thing.addComponent(Component);

                var instance = componentSystem.firstInstanceOfComponent(Component2);

                expect(instance).to.equal(null);
            });
        });
    });
});