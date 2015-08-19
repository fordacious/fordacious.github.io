define(function(require){
    var sinon = require('sinon');
    var EntityFactory = require('EntityFactory');

    describe('EntityFactory', function(){
        var sandbox = sinon.sandbox.create();

        var scene = {
            addEntity: function(name, config){},
            resolveReferences: function(){}
        };

        beforeEach(function(){
            sandbox.stub(scene, 'addEntity');
            sandbox.stub(scene, 'resolveReferences');
        });

        afterEach(function(){
            sandbox.restore();
        });

        describe('create method', function(){

            it('should call addEntity', function(){
                var config = {};
                var name = "name";

                var underTest = new EntityFactory(scene, config);
                expect(underTest).is.not.equal(undefined);

                underTest.create(name);

                expect(scene.addEntity.calledWith(name, config)).to.equal(true);
            });
            
            it('should be able to extend the factory config', function() {
                var config = {a: 0};
                var name = "name";
                var testConfig = {b: 1};
                var resultConfig = {a: 0, b: 1};

                var underTest = new EntityFactory(scene, config);

                underTest.create(name, testConfig);

                expect(scene.addEntity.calledWith(name, resultConfig)).to.equal(true);
            });
            
            it('should not change original factory config when extending config on create', function() {
                var underTest = new EntityFactory(scene, {a: 0});

                underTest.create("name", {a: 1});
                expect(underTest.config).is.deep.equal({a: 0});
            });

            it('should resolve references', function(){
                var config = {};
                var name = "name";

                var underTest = new EntityFactory(scene, config);
                expect(underTest).is.not.equal(undefined);

                underTest.create(name);

                expect(scene.resolveReferences.calledOnce).to.equal(true);
            });

            it('should not overwrite properties in the external config with properties from the default config', function(){
                var config = { test: 1 };
                var name = "name";

                var underTest = new EntityFactory(scene, config);
                expect(underTest).is.not.equal(undefined);

                underTest.create(name, { test: 2});

                expect(scene.addEntity.getCall(0).args[1]).to.deep.equal({ test: 2 });
            });
        });

    });

});
