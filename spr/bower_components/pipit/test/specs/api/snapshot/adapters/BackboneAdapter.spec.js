/*globals sinon*/
define(function(require) {

    var BackboneModel = require('backbone').Model;
    var BackboneAdapter = require('api/snapshot/adapters/BackboneAdapter').BackboneAdapter;
    var Transporter = require('api/snapshot/Transporter').Transporter;
    var SimCapiValue = require('api/snapshot/SimCapiValue');

    require('sinon');


    describe('BackboneAdapter', function() {

        var model = null;
        var modelAttributes = {};
        var modelsMapping = {};
        var sandbox = null;


        var transporter = null;
        var adapter = null;

        beforeEach(function() {

            sandbox = sinon.sandbox.create();

            model = new(BackboneModel.extend({
                'defaults': {
                    'attr1': 5,
                    'attr2': []
                }
            }))();

            modelsMapping = {};

            transporter = new Transporter();
            adapter = new BackboneAdapter({
                transporter: transporter,
                modelsMapping: modelsMapping
            });

        });

        afterEach(function() {
            sandbox.restore();
        });



        it('should create SimCapiValues properly', function() {
            sandbox.stub(transporter, 'expose', function(capiValue) {
                expect(capiValue).to.be.a(SimCapiValue);
            });

            adapter.expose('attr1', model, {
                readonly: false
            });

            expect(transporter.expose.callCount).to.be(1);
        });

        it('should create SimCapiValues properly when of type array', function() {
            sandbox.stub(transporter, 'expose', function(capiValue) {
                expect(capiValue.value).to.be('[]');
            });

            adapter.expose('attr2', model, {
                readonly: false
            });
        });

        it('should create SimCapiValues properly when of type array_point', function() {
            sandbox.stub(transporter, 'expose', function(capiValue) {
                expect(capiValue.value).to.be('[]');
            });

            adapter.expose('attr2', model, {
                readonly: false,
                type: SimCapiValue.TYPES.ARRAY_POINT
            });
        });

        it('should pass the writeonly param into the SimCapiValue', function() {
            sandbox.stub(transporter, 'expose', function(capiValue) {
                expect(capiValue.writeonly).to.be(true);
            });

            adapter.expose('attr1', model, {
                writeonly: true
            });

            expect(transporter.expose.callCount).to.be(1);
        });

        it('should delete attributes from its mapping when unexposed', function() {
            adapter.expose('attr2', model, {
                readonly: false
            });

            expect(modelsMapping['attr2']).to.not.equal(undefined);

            adapter.unexpose('attr2', model);

            expect(modelsMapping['attr2']).to.equal(undefined);
        });

        it('should delete corresponding model attributes from its alias mapping when unexposed', function() {
            var model1 = model;

            var model2 = new(BackboneModel.extend({
                'defaults': {
                    'attr1': 2,
                    'attr2': []
                }
            }))();

            var model3 = new(BackboneModel.extend({
                'defaults': {
                    'attr1': 2,
                    'attr2': []
                }
            }))();

            adapter.expose('attr2', model1, {
                alias: "model1.attr2",
                readonly: false
            });

            adapter.expose('attr2', model2, {
                alias: "model2.attr2",
                readonly: false
            });

            adapter.expose('attr2', model3, {
                alias: "model3.attr2",
                readonly: false
            });

            expect(modelsMapping['model1.attr2']).to.not.equal(undefined);
            expect(modelsMapping['model2.attr2']).to.not.equal(undefined);
            expect(modelsMapping['model3.attr2']).to.not.equal(undefined);

            adapter.unexpose('attr2', model2);

            expect(modelsMapping['model1.attr2']).to.not.equal(undefined);
            expect(modelsMapping['model2.attr2']).to.equal(undefined);
            expect(modelsMapping['model3.attr2']).to.not.equal(undefined);
        });

        it('should set new values when recieved', function() {
            adapter.expose('attr1', model);

            sandbox.stub(model, 'set');

            adapter.handleValueChange([new SimCapiValue({
                key: 'attr1',
                value: 6
            })]);

            expect(model.set.callCount).to.be(1);
        });

        it('should set new value of array type to be an array when recieved', function() {
            adapter.expose('attr2', model);

            sandbox.stub(model, 'set', function(m, v) {
                expect(v).to.be.a(Array);
            });

            adapter.handleValueChange([new SimCapiValue({
                key: 'attr2',
                value: '[10]'
            })]);

        });

        it('should remove SimCapiValues when unwatch', function() {
            sandbox.stub(transporter, 'removeValue', function(alias) {
                expect(alias).to.equal('attr1.newName');
            });

            sandbox.stub(model, 'off', function(eventName, funct) {
                expect(eventName).to.equal('change:attr1');
            });

            adapter.expose('attr1', model, {
                readonly: false,
                alias: "attr1.newName"
            });
            adapter.unexpose('attr1', model);

            expect(transporter.removeValue.callCount).to.equal(1);
        });

        describe('when the value is changed from a listener', function() {
            it('should write back the new value to the transporter', function() {
                var originalValue = 2;
                var otherValue = 10;

                sandbox.stub(transporter, 'setValue', function(simCapiValue) {
                    expect(simCapiValue.value).to.equal(otherValue);
                });

                model.on('change:attr1', function() {
                    model.set('attr1', otherValue);
                });

                adapter.expose('attr1', model);
                model.set('attr1', originalValue);

                expect(transporter.setValue.callCount).to.equal(2);
            });
        });
    });

});
