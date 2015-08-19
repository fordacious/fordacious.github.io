define(function(require){

    var ExtendedBackboneModel = require('ExtendedBackboneModel');
    var sinon = require('sinon');


    describe('ExtendedBackboneModel', function(){
        var UnderTest = null;
        var underTest = null;

        beforeEach(function(){
            UnderTest = ExtendedBackboneModel.extend({
                defaults: { val: "test" }
            });

            underTest = new UnderTest();
        });

        describe('initialize', function(){

            it('should throw if attribute name is value', function(){
                var Model= ExtendedBackboneModel.extend({
                    defaults: { value: "test" }
                });

                expect(function(){ new Model(); }).to.throw('Can not have attribute name of value');

            });

            it('should create the relevant getter and setter', function(){
                expect(underTest.getVal).to.not.equal(undefined);
                expect(underTest.setVal).to.not.equal(undefined);
            });

            it('should not override getters and setters', function(){
                var setFn = function(){};
                var getFn = function(){};

                UnderTest = ExtendedBackboneModel.extend({
                    defaults: { val: "test" },
                    setVal: setFn,
                    getVal: getFn
                });

                underTest = new UnderTest();

                expect(underTest.setVal).to.equal(setFn);
                expect(underTest.getVal).to.equal(getFn);
            });

            it('should remove the initialize function after execution', function(){
                var underTest = new UnderTest();

                expect(underTest.initialize).to.equal(undefined);
            });
        });

        describe('get', function(){
            it('should create the relevant getter when it doesn\'t exist', function(){
                underTest.getValue('test');
                expect(underTest.getTest).to.not.equal(undefined);
                expect(underTest.getTest()).to.equal(undefined);
            });

            it('should return the value of an already created attribute', function(){
                var value = underTest.get('val');
                expect(underTest.getVal()).to.equal('test');
                expect(value).to.equal('test');
            });
        });

        describe('set', function(){
            it('should create the relevant setter when it doesn\'t exist', function(){
                underTest.setValue('test', 'a value');
                expect(underTest.setTest).to.not.equal(undefined);
                expect(underTest.getTest()).to.equal('a value');
            });

            it('should return the new value of an already created attribute', function(){
                underTest.set('val', 'a new test');
                expect(underTest.getVal()).to.equal('a new test');
                expect(underTest.get('val')).to.equal('a new test');
            });
        });

        describe('destroy', function(){
            it('should not throw', function(){
                expect(function(){ underTest.destroy(); }).to.not.throw();
            });
        });
    });

});