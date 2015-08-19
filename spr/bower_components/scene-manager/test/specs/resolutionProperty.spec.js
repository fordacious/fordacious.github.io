define(function(require){
    var sinon = require('sinon');

    var ResolutionProperty = require('ResolutionProperty');


    describe('ResolutionProperty', function(){

        var entity, componentName, component, propName;

        beforeEach(function(){
            entity = {};
            component = {};

            componentName = 'componentName';
            propName = 'propName';
        });

        function setup(entity, componentName, component, propName, referenceString){
            component[propName] = referenceString;
            entity[componentName] = component;
        }


        describe('resolve - self', function(){

            it('should resolve to the correct reference', function(){
                var reference = {};
                setup(entity, componentName, component, propName, '&reference');
                entity.reference = reference;

                var underTest = new ResolutionProperty(entity, component, propName);

                expect(underTest.resolve([], [])).to.equal(reference);
            });

        });

        describe('resolve - external all', function(){

            it('should resolve to the correct reference', function(){
                var anotherEntity = {};

                var reference = {};
                setup(entity, componentName, component, propName, '&anotherEntity.*');
                anotherEntity.reference = reference;

                var entities = {'entity': entity, 'anotherEntity': anotherEntity};

                var underTest = new ResolutionProperty(entity, component, propName);

                expect(underTest.resolve(entities, [])).to.equal(anotherEntity);
            });

        });

        describe('resolve - external single', function(){

            it('should resolve to the correct reference', function(){
                var anotherEntity = {};

                var reference = {};
                setup(entity, componentName, component, propName, '&anotherEntity.reference');
                anotherEntity.reference = reference;

                var entities = {'entity': entity, 'anotherEntity': anotherEntity};

                var underTest = new ResolutionProperty(entity, component, propName);

                expect(underTest.resolve(entities, [])).to.equal(reference);
            });

        });

        describe('resolve - factory', function(){

            it('should resolve to the correct reference', function(){

                var reference = {};
                setup(entity, componentName, component, propName, '+reference');
                var entities = {'entity': entity};
                var factories = {'reference': reference};

                var underTest = new ResolutionProperty(entity, component, propName);

                expect(underTest.resolve(entities, factories)).to.equal(reference);
            });

        });

        describe('child referencing', function(){

            it('should resolve the correct child reference', function(){
                var anotherEntity = {}, component = {};
                component['test'] = "&entity.child.reference";
                anotherEntity[componentName] = component;

                var child = {};
                var reference = {};

                child.reference = reference;

                entity.children = {
                    child: child
                };

                var entities = {'entity': entity, 'anotherEntity': anotherEntity, 'entity.child': child};

                var underTest = new ResolutionProperty(entity, component, 'test');

                expect(underTest.resolve(entities)).to.equal(reference);
            });

            it('should resolve the correct child component', function(){
                var anotherEntity = {}, component = {};
                component['test'] = "&entity.child.*";
                anotherEntity[componentName] = component;

                var child = {};

                entity.children = {
                    child: child
                };

                var entities = {'entity': entity, 'anotherEntity': anotherEntity, 'entity.child': child};

                var underTest = new ResolutionProperty(entity, component, 'test');

                expect(underTest.resolve(entities)).to.equal(child);
            });

        });

        describe('deeper child referencing', function(){

            it('should resolve the correct child reference', function(){
                var anotherEntity = {}, component = {};
                component['test'] = "&entity.child.child2.reference";
                anotherEntity[componentName] = component;

                var child = {}, child2 = {};
                var reference = {};

                child2.reference = reference;
                child.children = { child2: child2 };

                entity.children = { child: child };

                var entities = {'entity': entity, 'anotherEntity': anotherEntity, 'entity.child': child, 'entity.child.child2': child2};

                var underTest = new ResolutionProperty(entity, component, 'test');

                expect(underTest.resolve(entities)).to.equal(reference);
            });

            it('should resolve the correct child reference', function(){
                var anotherEntity = {}, component = {};
                component['test'] = "&entity.child.child2.*";
                anotherEntity[componentName] = component;

                var child = {}, child2 = {};
                child.children = { child2: child2 };

                entity.children = { child: child };

                var entities = {'entity': entity, 'anotherEntity': anotherEntity, 'entity.child': child, 'entity.child.child2': child2};

                var underTest = new ResolutionProperty(entity, component, 'test');

                expect(underTest.resolve(entities)).to.equal(child2);
            });
        });

    });

});