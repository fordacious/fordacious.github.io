define(function (require) {

    var CapiModelSync = require('components/CapiModelSync');

    var ExtendedModel = require('ExtendedModel');

    var Capi = ExtendedModel.extend({
        defaults: {
            a: 1,
            b: 2,
            c: 3,
            d: 4
        }
    });

    var Model = ExtendedModel.extend({
        defaults: {
            a: null,
            b: 'b',
            c: 2
        }
    });

    describe('Capi Model Sync', function (){
        var underTest, model, capi, attributes;

        beforeEach(function () {
            underTest = new CapiModelSync();

            model = new Model();
            capi = new Capi();
            attributes = ['a','b','c'];

            underTest.model = model;
            underTest.capi = capi;
            underTest.attributes = attributes;
        });

        it('Should sync from capi to model initially', function () {
            underTest.start();
            expect(underTest.capi.get('a')).to.equal(1);
            expect(underTest.capi.get('b')).to.equal(2);
            expect(underTest.capi.get('c')).to.equal(3);
            expect(underTest.capi.get('d')).to.equal(4);

            expect(underTest.model.get('a')).to.equal(1);
            expect(underTest.model.get('b')).to.equal(2);
            expect(underTest.model.get('c')).to.equal(3);
        });

        it('Should sync from capi to model on capi change', function () {
            underTest.start();
            capi.set('a', 2);

            expect(underTest.capi.get('a')).to.equal(2);
            expect(underTest.capi.get('b')).to.equal(2);
            expect(underTest.capi.get('c')).to.equal(3);
            expect(underTest.capi.get('d')).to.equal(4);

            expect(underTest.model.get('a')).to.equal(2);
            expect(underTest.model.get('b')).to.equal(2);
            expect(underTest.model.get('c')).to.equal(3);
        });

        it('Should sync from model to capi on model change', function () {
            underTest.start();
            model.set('b', 3);

            expect(underTest.capi.get('a')).to.equal(1);
            expect(underTest.capi.get('b')).to.equal(3);
            expect(underTest.capi.get('c')).to.equal(3);
            expect(underTest.capi.get('d')).to.equal(4);

            expect(underTest.model.get('a')).to.equal(1);
            expect(underTest.model.get('b')).to.equal(3);
            expect(underTest.model.get('c')).to.equal(3);
        });

        it('Should not sync properties not specified in attributes', function () {
            underTest.start();
            expect(underTest.model.get('d')).to.equal(undefined);
            capi.set('d', 2);
            expect(underTest.model.get('d')).to.equal(undefined);
        });

        it('Should sync all properties if no attributes specified', function () {
            underTest.attributes = undefined;
            underTest.start();

            capi.set('a', 10);
            capi.set('b', 10);
            capi.set('c', 10);

            expect(underTest.capi.get('a')).to.equal(10);
            expect(underTest.capi.get('b')).to.equal(10);
            expect(underTest.capi.get('c')).to.equal(10);

            expect(underTest.model.get('a')).to.equal(10);
            expect(underTest.model.get('b')).to.equal(10);
            expect(underTest.model.get('c')).to.equal(10);
        });
    });
});