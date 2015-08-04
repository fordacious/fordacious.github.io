define(function(require) {
    var sinon = require('sinon');
    var componentize = require("componentize");

    describe("When calling componentize on an object", function() {
        it("Should get the appropriate functions", function() {
            var test = {};
            componentize(test);

            expect(test.addComponent).to.be.a('function');
            expect(test.addChild).to.be.a('function');
            expect(test.removeComponent).to.be.a('function');
            expect(test.runComponentsStart).to.be.a('function');
            expect(test.runComponentsUpdate).to.be.a('function');
            expect(test.getComponent).to.be.a('function');
            expect(test.getComponents).to.be.a('function');
        });

        it('should have false for destroyed', function() {
            var test = {};
            componentize(test);

            expect(test.destroyed).to.equal(false);
        });

        it('should expose the entity\'s UID', function(){
            var test = {};
            componentize(test, "test");
            expect(test.UID).to.equal("test");
        });

        it('should not have the same UID', function(){
            var test = {}, test2 = {};
            componentize(test, "test");
            componentize(test2, "test2");

            expect(test.UID).to.not.equal(test2.UID);
        });
    });

    describe('componentized objects', function() {
        var test, TestComponent;

        beforeEach(function() {
            test = {};
            componentize(test);

            TestComponent = function() {};
        });

        describe('addComponent', function() {
            it('should return the instance added to the entity', function() {
                var result = test.addComponent(TestComponent);

                expect(result instanceof TestComponent, 'correct type').to.equal(true);
                expect(result).to.not.equal(TestComponent);
            });

            it('should create an instance of the passed behavior and set entity on it', function() {
                var result = test.addComponent(TestComponent);

                expect(result.entity).to.equal(test);
            });

            it("should call initialize if the component has it", function() {
                var stub = sinon.stub();
                TestComponent.prototype.initialize = stub;

                test.addComponent(TestComponent);

                expect(stub.called, 'initialize called').to.equal(true);
            });

            it('should set every property from a setup object on the component before calling initialize', function() {
                var setup = { helen : 'troy', spartans : 300 };
                var called = false;
                TestComponent.prototype.initialize = function() {
                    expect(this.helen).to.equal('troy');
                    expect(this.spartans).to.equal(300);
                    called = true;
                };

                test.addComponent(TestComponent, setup);

                expect(called, 'initialize called').to.equal(true);
            });

            it('should add the component to the entity by name if a name is given', function() {
                var setup = { a : 1 };
                var underTest = test.addComponent('test', TestComponent, setup);

                expect(test['test']).to.equal(underTest);
                expect(test['test'].a).to.equal(1);
            });

            it('should throw if the name is already defined on the entity', function() {
                expect(function() {
                    test.addComponent('addComponent', TestComponent);
                }).to.throw(Error);
            });

            it('should not call start if the component has it', function() {
                var startStub = sinon.stub();
                TestComponent.prototype.start = startStub;

                test.addComponent(TestComponent);

                expect(startStub.called, 'start called').to.equal(false);
            });

            it('should save the component name on the component', function() {
                var setup = { a : 1 };
                var name = 'test';
                var underTest = test.addComponent(name, TestComponent, setup);

                expect(underTest.componentName).to.equal(name);
            });

            it('should overwrite if there is a property by that name', function() {
                var name1 = 'test1';
                var name2 = 'test2';
                var setup = { a : 1, componentName: name2 };
                var underTest = test.addComponent(name1, TestComponent, setup);

                expect(underTest.componentName).to.not.equal(name2);
                expect(underTest.componentName).to.equal(name1);
            });

            it('should not be able to change the component name', function() {
                var name1 = 'test1';
                var name2 = 'test2';
                var setup = { a : 1 };
                var underTest = test.addComponent(name1, TestComponent, setup);
                underTest.componentName = name2;

                expect(underTest.componentName).to.equal(name1);
            });

            it('should not be able to delete the component name', function() {
                var name = 'test1';
                var setup = { a : 1 };
                var underTest = test.addComponent(name, TestComponent, setup);
                delete underTest.componentName;

                expect(underTest.componentName).to.equal(name);
            });

            it('should not loop over the component name', function() {
                var name = 'test1';
                var setup = { a : 1 };
                var underTest = test.addComponent(name, TestComponent, setup);

                expect(Object.keys(underTest).indexOf('componentName')).to.equal(-1);
            });
        });

        describe('addChild', function(){
            it('should add the child to entity', function(){
                var child = {}, child2 = {};
                componentize(child);
                componentize(child2);

                test.addChild("child",child);
                test.addChild("child2",child2);

                expect(Object.keys(test.children).length).to.equal(2);
            });

            it('should not add child if already a child', function(){
                var child = {};
                componentize(child);

                test.addChild("child",child);
                test.addChild("child2",child);

                expect(Object.keys(test.children).length).to.equal(1);
            });

            it('should change the parent of the child', function(){
                var test2 = {}, child = {};
                componentize(test2);
                componentize(child);

                test2.addChild("child",child);
                test.addChild("child", child);

                expect(Object.keys(test.children).length).to.equal(1);
                expect(Object.keys(test2.children).length).to.equal(0);
                expect(child.destroyed).to.equal(false);
                expect(child.parent).to.equal(test);
            });

            it('should not allow the parent to add itself as a child', function(){
                expect(function(){
                    test.addChild("child", test);
                }).to.throw("Entity can not add itself as a child");
            });

            it('should not allow the parent to add itself as a child along the parenting chain', function(){
                var test2 = {}, test3 = {};
                componentize(test2);
                componentize(test3);

                test.addChild("child2", test2);
                test2.addChild("child3", test3);

                expect(function(){
                    test3.addChild("child", test);
                }).to.throw("Child can not be added because it already exists in the parenting chain");
            });

            it('should not allow the parent to add itself as a child along the parenting chain - reversed ordered', function(){
                var test2 = {}, test3 = {};
                componentize(test2);
                componentize(test3);

                test3.addChild("child", test);
                test2.addChild("child3", test3);

                expect(function(){
                    test.addChild("child2", test2);
                }).to.throw("Child can not be added because it already exists in the parenting chain");
            });

            it('should call callback when supplied', function(){
                var test2 = {}, test3 = {}, updateStud = sinon.stub();
                componentize(test2, "test2", {
                    updateChildName: updateStud
                });
                componentize(test3, "test3");

                test2.addChild("child3", test3);

                expect(updateStud.called).to.equal(true);
                expect(updateStud.getCall(0).args[0].UID).to.equal("test3");
                expect(updateStud.getCall(0).args[1]).to.equal("child3");
            });
        });

        describe('getComponent', function() {
            it('should return null if the entity does not have the component', function() {
                expect(test.getComponent(TestComponent)).to.equal(null);
            });

            it('should return an instance of the component on the entity', function() {
                test.addComponent(TestComponent);

                var result = test.getComponent(TestComponent);

                expect(result).to.be.an('object');
                expect(result).to.not.equal(TestComponent);
            });

            it('should return the component of the correct type', function() {
                var Another = function() {};

                test.addComponent(Another);
                test.addComponent(TestComponent);

                var result = test.getComponent(TestComponent);

                expect(result instanceof TestComponent, "correct type").to.equal(true);
            });
        });

        describe('getComponents', function() {
            it('should return an empty array if the entity does not have the component', function() {
                var result = test.getComponents(TestComponent);

                expect(result).to.be.an('array');
                expect(result.length).to.equal(0);
            });

            it('should return every instance of the component the entity has', function() {
                test.addComponent(TestComponent);
                test.addComponent(TestComponent);

                var result = test.getComponents(TestComponent);

                expect(result.length).to.equal(2);
            });

            it('should only return instances of the specified component', function() {
                var Another = function() {};

                test.addComponent(TestComponent);
                test.addComponent(Another);
                test.addComponent(TestComponent);

                var result = test.getComponents(TestComponent);

                expect(result.length).to.equal(2);
                for(var i = 0; i < result.length; ++i) {
                    expect(result[i] instanceof TestComponent, "component correct type").to.equal(true);
                }
            });
        });

        describe("hasComponent", function() {
            it("should be true when the entity has the component", function() {
                test.addComponent(TestComponent);

                expect(test.hasComponent(TestComponent), 'has component').to.equal(true);
            });

            it("should be false when the entity does not have the component", function() {
                expect(test.hasComponent(TestComponent), 'has component').to.equal(false);
            });
        });

        describe("runComponents", function() {
            it("should call update on all added components", function() {
                var testStub = sinon.stub();
                TestComponent.prototype.update = testStub;
                var AnotherComponent = function() {};
                var anotherStub = sinon.stub();
                AnotherComponent.prototype.update = anotherStub;

                test.addComponent(TestComponent);
                test.addComponent(AnotherComponent);

                test.runComponentsStart(); // start
                test.runComponentsUpdate(); // update

                expect(testStub.called, 'TestComponent called').to.equal(true);
                expect(anotherStub.called, 'AnotherComponent called').to.equal(true);
            });

            it("should call update with the passed in object", function() {
                var state = {};
                TestComponent.prototype.update = function(passed) {
                    expect(passed).to.equal(state);
                };

                test.addComponent(TestComponent);

                test.runComponentsStart(); // start
                test.runComponentsUpdate(state); // update
            });

            it("should ignore components without update", function() {
                test.addComponent(TestComponent);

                test.runComponentsStart(); // start
                test.runComponentsUpdate(); // update
            });

            it("should run start on first update only", function() {
                var testStub = sinon.stub();
                TestComponent.prototype.update = testStub;
                var startStub = sinon.stub();
                TestComponent.prototype.start = startStub;

                test.addComponent(TestComponent);

                test.runComponentsStart(); // start
                test.runComponentsUpdate(); // update
                test.runComponentsStart(); // start
                test.runComponentsUpdate(); // update

                expect(startStub.called, 'TestComponent start called').to.equal(true);
                expect(startStub.calledTwice, 'AnotherComponent start not called twice').to.equal(false);
                expect(testStub.calledTwice, 'TestComponent update called twice').to.equal(true);
            });

            it("should not run update before start", function() {
                var TestComponent1 = function(){};
                var startStub = sinon.stub();
                var updateStub = sinon.stub();
                TestComponent1.prototype.start = startStub;
                TestComponent1.prototype.update = updateStub;

                TestComponent.prototype.start = function(){
                    test.addComponent(TestComponent1);
                };
                test.addComponent(TestComponent);

                test.runComponents();
                expect(startStub.callCount).to.equal(0);
                expect(updateStub.callCount).to.equal(0);

                test.runComponents();
                expect(startStub.callCount).to.equal(1);
                expect(updateStub.callCount).to.equal(1);
            });
        });

        describe("removeComponent", function() {
            it("should call destroy if the component has it", function() {
                var stub = sinon.stub();
                TestComponent.prototype.destroy = stub;

                var component = test.addComponent(TestComponent);
                test.removeComponent(component);

                expect(stub.called, 'destroy called').to.equal(true);
            });

            it('should not call update on a component that has been removed', function() {
                var stub = sinon.stub();
                TestComponent.prototype.update = stub;

                var component = test.addComponent(TestComponent);
                test.removeComponent(component);
                test.runComponentsStart(); // start
                test.runComponentsUpdate(); // update

                expect(stub.called, 'update called').to.equal(false);
            });

            it('should do nothing if the entity does not have the component', function() {
                var AnotherComponent = function() {};

                test.addComponent(TestComponent);

                test.removeComponent(AnotherComponent);
            });

            it('should still have other components attached', function() {
                var AnotherComponent = function() {};

                var toRemove = test.addComponent(TestComponent);
                test.addComponent(AnotherComponent);

                test.removeComponent(toRemove);

                expect(test.hasComponent(AnotherComponent), 'still has component').to.equal(true);
            });

            it('should not cause problems when removing a component while running', function() {
                var Another = function() {};
                Another.prototype.update = function() { this.entity.removeComponent(this.entity.getComponent(TestComponent)); };
                var Third = function() {};
                var testStub = sinon.stub();
                TestComponent.prototype.update = testStub;
                var stub = sinon.stub();
                Third.prototype.update = stub;

                test.addComponent(Another);
                test.addComponent(TestComponent);
                test.addComponent(Third);

                test.runComponentsStart(); // start
                test.runComponentsUpdate(); // update

                expect(stub.called, 'Third Update called').to.equal(true);
                expect(testStub.called, 'test update called').to.equal(false);
            });

            it('should not cause problems when removing a previous component while running', function() {
                var Another = function() {};
                Another.prototype.update = function() { this.entity.removeComponent(this.entity.getComponent(TestComponent)); };
                var Third = function() {};
                var testStub = sinon.stub();
                TestComponent.prototype.update = testStub;
                var stub = sinon.stub();
                Third.prototype.update = stub;

                test.addComponent(TestComponent);
                test.addComponent(Another);
                test.addComponent(Third);

                test.runComponentsStart(); // start
                test.runComponentsUpdate(); // update

                expect(stub.called, 'Third Update called').to.equal(true);
                expect(testStub.called, 'test update called').to.equal(true);
            });

            it('should set entity to null on a removed component', function() {
                var component = test.addComponent(TestComponent);

                test.removeComponent(component);

                expect(component.entity).to.equal(null);
            });

            it('should delete the component from the entity', function() {
                var name = 'test1';
                var setup = { a : 1 };
                var component = test.addComponent(name, TestComponent, setup);
                test.removeComponent(component);

                expect(test[name]).to.equal(undefined);
            });

            it('should not delete the component from the entity the component has no name', function() {
                var setup = { a : 1 };
                var testObject = {};
                test[''] = testObject;
                var component = test.addComponent(TestComponent, setup);
                test.removeComponent(component);

                expect(test['']).to.equal(testObject);
            });
        });

        describe("removeAllComponents", function() {
            it("should call destroy if the component has it", function() {
                var stub = sinon.stub();
                TestComponent.prototype.destroy = stub;
                var anotherStub = sinon.stub();
                var AnotherComponent = function(){};
                AnotherComponent.prototype.destroy = anotherStub;

                test.addComponent(TestComponent);
                test.addComponent(AnotherComponent);
                test.removeAllComponents();

                expect(stub.called, 'destroy called').to.equal(true);
                expect(anotherStub.called, 'destroy 2 called').to.equal(true);
            });
        });

        describe("removeChild", function(){
            var child;

            beforeEach(function(){
                child = {};
                componentize(child);
            });

            it('should destroy this child', function(){
                test.addChild("child", child);
                test.removeChild(child);

                expect(child.parent).to.equal(null);
                expect(Object.keys(test.children).length).to.equal(0);
                expect(child.destroyed).to.equal(true);
            });

            it('should unlink the parent and child', function(){
                test.addChild("child", child);
                test.removeChild(child, true);

                expect(child.parent).to.equal(null);
                expect(Object.keys(test.children).length).to.equal(0);
                expect(child.destroyed).to.equal(false);
            });

            it('should not unparent if child is not a child', function(){
                var anotherEntity = {};
                componentize(anotherEntity);

                anotherEntity.addChild("child", child);

                test.removeChild(child);

                expect(child.parent).to.equal(anotherEntity);
                expect(Object.keys(anotherEntity.children).length).to.equal(1);
                expect(Object.keys(test.children).length).to.equal(0);
            });
        });

        describe("removeAllChildren", function(){
            it('should break the link between parent and child', function(){
                var child = {}, child2 = {};
                componentize(child);
                componentize(child2);
                test.addChild("child", child);
                test.addChild("child2", child2);

                test.removeAllChildren();

                expect(child.parent).to.equal(null);
                expect(child2.parent).to.equal(null);
                expect(Object.keys(test.children).length).to.equal(0);
            });
        });

        describe('destroy', function() {
            it('should set destroyed to true', function() {
                test.destroy();

                expect(test.destroyed).to.equal(true);
            });

            it('should remove all components', function() {
                test.addComponent(TestComponent);

                test.destroy();

                expect(test.hasComponent(TestComponent)).to.equal(false);
            });

            it('should destory all children', function(){
                var child = {};
                componentize(child);
                child.addComponent(TestComponent);
                sinon.spy(child, "destroy");

                test.addChild("child", child);

                test.destroy();

                expect(child.destroy.called).to.equal(true);
            });

            it('should not try to remove components again once destroyed', function(){
                sinon.spy(test, "removeAllComponents");
                sinon.spy(test, "removeAllChildren");

                test.destroy();
                test.destroy();

                expect(test.removeAllComponents.callCount).to.equal(1);
                expect(test.removeAllChildren.callCount).to.equal(1);
            });
        });
    });
});