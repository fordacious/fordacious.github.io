/**
 * Test for check.js
 */
define(function(require) {

    var check = require('check');
    var _     = require('underscore');
    var Backbone = require('backbone');

    describe('check', function() {

        describe('isString', function() {

            it('should return false for 1', function() {
                expect(check(1).passive().isString()).to.be(false);
            });

            it('should return true for "string"', function() {
                expect(check('string').passive().isString()).to.be(true);
            });

            it('should return false for true', function() {
                expect(check(true).passive().isString()).to.be(false);
            });

            it('should return false for []', function() {
                expect(check([]).passive().isString()).to.be(false);
            });

            it('should return false for {}', function() {
                expect(check({}).passive().isString()).to.be(false);
            });

            it('should return false for "function(){}"', function() {
                expect(check(function() {}).passive().isString()).to.be(false);
            });

            it('should return false for null', function() {
                expect(check(null).passive().isString()).to.be(false);
            });

            it('should return false for undefined', function() {
                expect(check(undefined).passive().isString()).to.be(false);
            });

        });

        describe('isNumber', function() {

            it('should return true for 1', function() {
                expect(check(1).passive().isNumber()).to.be(true);
            });

            it('should return true for 0', function() {
                expect(check(0).passive().isNumber()).to.be(true);
            });

            it('should return true for parseInt("2")', function() {
                expect(check(parseInt("2", 10)).passive().isNumber()).to.be(true);
            });

            it('should return true for parseFloat("2.3")', function() {
                expect(check(parseFloat("2.3")).passive().isNumber()).to.be(true);
            });

            it('should return false for "string"', function() {
                expect(check('string').passive().isNumber()).to.be(false);
            });

            it('should return false for true', function() {
                expect(check(true).passive().isNumber()).to.be(false);
            });

            it('should return false for []', function() {
                expect(check([]).passive().isNumber()).to.be(false);
            });

            it('should return false for {}', function() {
                expect(check({}).passive().isNumber()).to.be(false);
            });

            it('should return false for "function(){}"', function() {
                expect(check(function() {}).passive().isNumber()).to.be(false);
            });

            it('should return false for null', function() {
                expect(check(null).passive().isNumber()).to.be(false);
            });

            it('should return false for undefined', function() {
                expect(check(undefined).passive().isNumber()).to.be(false);
            });

        });

        describe('isBoolean', function() {

            it('should return false for 0', function() {
                expect(check(0).passive().isBoolean()).to.be(false);
            });

            it('should return false for "string"', function() {
                expect(check('string').passive().isBoolean()).to.be(false);
            });

            it('should return true for true', function() {
                expect(check(true).passive().isBoolean()).to.be(true);
            });

            it('should return true for false', function() {
                expect(check(false).passive().isBoolean()).to.be(true);
            });

            it('should return false for []', function() {
                expect(check([]).passive().isBoolean()).to.be(false);
            });

            it('should return false for {}', function() {
                expect(check({}).passive().isBoolean()).to.be(false);
            });

            it('should return false for "function(){}"', function() {
                expect(check(function() {}).passive().isBoolean()).to.be(false);
            });

            it('should return false for null', function() {
                expect(check(null).passive().isBoolean()).to.be(false);
            });

            it('should return false for undefined', function() {
                expect(check(undefined).passive().isBoolean()).to.be(false);
            });

        });

        describe('isArray', function() {

            it('should return false for 0', function() {
                expect(check(0).passive().isArray()).to.be(false);
            });

            it('should return false for "string"', function() {
                expect(check('string').passive().isArray()).to.be(false);
            });

            it('should return false for true', function() {
                expect(check(true).passive().isArray()).to.be(false);
            });

            it('should return true for []', function() {
                expect(check([]).passive().isArray()).to.be(true);
            });

            it('should return false for {}', function() {
                expect(check({}).passive().isArray()).to.be(false);
            });

            it('should return false for "function(){}"', function() {
                expect(check(function() {}).passive().isArray()).to.be(false);
            });

            it('should return false for null', function() {
                expect(check(null).passive().isArray()).to.be(false);
            });

            it('should return false for undefined', function() {
                expect(check(undefined).passive().isArray()).to.be(false);
            });

        });

        describe('isObject', function() {

            it('should return false for 1', function() {
                expect(check(1).passive().isObject()).to.be(false);
            });

            it('should return false for "string"', function() {
                expect(check('string').passive().isObject()).to.be(false);
            });

            it('should return false for true', function() {
                expect(check(true).passive().isObject()).to.be(false);
            });

            it('should return true for []', function() {
                expect(check([]).passive().isObject()).to.be(true);
            });

            it('should return true for {}', function() {
                expect(check({}).passive().isObject()).to.be(true);
            });

            it('should return true for "function(){}"', function() {
                expect(check(function() {}).passive().isObject()).to.be(true);
            });

            it('should return false for null', function() {
                expect(check(null).passive().isObject()).to.be(false);
            });

            it('should return false for undefined', function() {
                expect(check(undefined).passive().isObject()).to.be(false);
            });

        });

        describe('isFunction', function() {

            it('should return false for 1', function() {
                expect(check(1).passive().isFunction()).to.be(false);
            });

            it('should return false for "string"', function() {
                expect(check('string').passive().isFunction()).to.be(false);
            });

            it('should return false for true', function() {
                expect(check(true).passive().isFunction()).to.be(false);
            });

            it('should return false for []', function() {
                expect(check([]).passive().isFunction()).to.be(false);
            });

            it('should return false for {}', function() {
                expect(check({}).passive().isFunction()).to.be(false);
            });

            it('should return true for "function(){}"', function() {
                expect(check(function() {}).passive().isFunction()).to.be(true);
            });

            it('should return false for null', function() {
                expect(check(null).passive().isFunction()).to.be(false);
            });

            it('should return false for undefined', function() {
                expect(check(undefined).passive().isFunction()).to.be(false);
            });

        });

        describe('isDefined', function() {
            it('should return false for undefined', function() {
                expect(check(undefined).passive().isDefined()).to.be(false);
            });

            it('should return false for null', function() {
                expect(check(null).passive().isDefined()).to.be(false);
            });

            it('should return true for Number', function() {
                expect(check(0).passive().isDefined()).to.be(true);
                expect(check(1).passive().isDefined()).to.be(true);
                expect(check(-1).passive().isDefined()).to.be(true);
            });

            it('should return true for String', function() {
                expect(check('string').passive().isDefined()).to.be(true);
            });

            it('should return true for Boolean', function() {
                expect(check(false).passive().isDefined()).to.be(true);
                expect(check(true).passive().isDefined()).to.be(true);
            });

            it('should return true for Function', function() {
                expect(check(function(){}).passive().isDefined()).to.be(true);
            });

            it('should return true for Object', function() {
                expect(check({}).passive().isDefined()).to.be(true);
            });

            it('should return true for Array', function() {
                expect(check([]).passive().isDefined()).to.be(true);
            });
        });

        describe('isOfType', function() {

            var CustomType = function() {
                this.C = 'C';
                this.u = 'u';
                this.s = 's';
                this.t = 't';
                this.o = 'o';
                this.m = 'm';
                this.T = 'T';
                this.y = 'y';
                this.p = 'p';
                this.e = 'e';
                this.call = function() {
                    return 'CustomType';
                };
            };
            CustomType.prototype.F = function() {};

            it('should return false for 1', function() {
                expect(check(1).passive().isOfType(CustomType)).to.be(false);
            });

            it('should return false for "string"', function() {
                expect(check('string').passive().isOfType(CustomType)).to.be(false);
            });

            it('should return false for true', function() {
                expect(check(true).passive().isOfType(CustomType)).to.be(false);
            });

            it('should return false for []', function() {
                expect(check([]).passive().isOfType(CustomType)).to.be(false);
            });

            it('should return false for {}', function() {
                expect(check({}).passive().isOfType(CustomType)).to.be(false);
            });

            it('should return false for "function(){}"', function() {
                expect(check(function() {}).passive().isOfType(CustomType)).to.be(false);
            });

            it('should return true for "new CustomType()"', function() {
                expect(check(new CustomType()).passive().isOfType(CustomType)).to
                        .be(true);
            });

            it('should return false for null', function() {
                expect(check(null).passive().isOfType(CustomType)).to.be(false);
            });

            it('should return false for undefined', function() {
                expect(check(undefined).passive().isOfType(CustomType)).to.be(false);
            });

        });

        describe('strict', function() {

            it('should throw exception when mismatch occurs', function() {
                expect(function() {
                    check(1).strict().isString();
                }).to.throwError();
            });

            it('should be strict by default', function() {
                expect(function() {
                    check(1).isString();
                }).to.throwError();
            });

            it('should NOT throw exception when match occurs', function() {
                expect(function() {
                    check('a').strict().isString();
                }).not.to.throwError();
            });

            describe('msg', function() {

                it('should support custom exception message', function() {
                    expect(function() {
                        check(1).strict().msg('custom message').isString();
                    }).to.throwError('custom message');
                });

                it('should support custom message for null', function() {
                    expect(function() {
                        check(null).strict().msg('custom message').isString();
                    }).to.throwError('custom message');
                });

                it('should support custom message for undefined', function() {
                    expect(function() {
                        check(undefined).strict().msg('custom message')
                                .isString();
                    }).to.throwError('custom message');
                });

            });

        });

        describe('each', function() {

            it('should return false when not an iterable', function() {
                expect(check(1).passive().each().isNumber()).to.be(false);
                expect(check(true).passive().each().isBoolean()).to.be(false);
            });

            it('should throw error when not iterable and strict', function() {
                expect(function() { check(1).each().isNumber(); })
                    .to.throwError();
            });

            describe('object', function() {
                it('should return true when attrs are the same', function() {
                    var obj = { a : true, b : true };
                    expect(check(obj).passive().each().isBoolean()).to.be(true);
                    expect(check(obj).passive().each().isString()).to.be(false);
                });

                it('should return false when attrs are not the same', function() {
                    var obj = { a : true, b : 1 };
                    expect(check(obj).passive().each().isBoolean()).to.be(false);
                    expect(check(obj).passive().each().isNumber()).to.be(false);
                });

                it('should throw error when strict', function() {
                    var obj = {a : true, b : 2};
                    expect(function(){ check(obj).each().isBoolean(); })
                        .to.throwError();
                });
            });

            describe('array', function() {
                it('should return true when attrs are the same', function() {
                    var arr = [true, true];
                    expect(check(arr).passive().each().isBoolean()).to.be(true);
                    expect(check(arr).passive().each().isString()).to.be(false);
                });

                it('should return false when attrs are NOT the same', function() {
                    var arr = [true, 1];
                    expect(check(arr).passive().each().isBoolean()).to.be(false);
                    expect(check(arr).passive().each().isNumber()).to.be(false);
                });
            });

            describe('filter', function() {

                it('should allow filter for object', function() {
                    var obj = {a : true, b : 1};
                    expect(check(obj).passive().each(function(val, key) {
                        return key === 'a';
                    }).isBoolean()).to.be(true);

                    expect(check(obj).passive().each(function(val, key) {
                        return key === 'b';
                    }).isNumber()).to.be(true);
                });

                it('should allow filter for array', function() {
                    var arr = [true, 1];
                    expect(check(arr).passive().each(function(val, key) {
                        return key === 0;
                    }).isBoolean()).to.be(true);

                    expect(check(arr).passive().each(function(val, key) {
                        return key === 1;
                    }).isNumber()).to.be(true);
                });

            });

        });

        describe('inheritence', function() {

            it('should return true for prototype subclasses', function() {
                var Animal = function() {};
                Animal.prototype.whatAmI = function() { return 'animal'; };
                Animal.prototype.run = function() { return 'run'; };

                var Cat = function() {};
                Cat.prototype = new Animal();
                Cat.prototype.whatAmI = function() { return 'cat'; };
                Cat.prototype.constructor = Cat;

                var cat = new Cat();
                var animal = new Animal();

                expect(cat.whatAmI()).to.be('cat');
                expect(cat.run()).to.be('run');
                expect(check(cat).passive().isOfType(Animal)).to.be(true);
                expect(check(cat).passive().isOfType(Cat)).to.be(true);

                expect(animal.whatAmI()).to.be('animal');
                expect(animal.run()).to.be('run');
                expect(check(animal).passive().isOfType(Cat)).to.be(false);
                expect(check(animal).passive().isOfType(Animal)).to.be(true);
            });

            it('should return true for backbone.extend', function() {
                var Animal = Backbone.Model.extend({
                    whatAmI : function() { return 'animal'; },
                    run : function() { return 'run'; }
                });
                var Cat = Animal.extend({
                    whatAmI : function() { return 'cat'; }
                });

                var cat = new Cat();
                var animal = new Animal();

                expect(cat.whatAmI()).to.be('cat');
                expect(cat.run()).to.be('run');
                expect(check(cat).passive().isOfType(Animal)).to.be(true);
                expect(check(cat).passive().isOfType(Cat)).to.be(true);
                expect(check(cat).passive().isOfType(Backbone.Model)).to.be(true);

                expect(animal.whatAmI()).to.be('animal');
                expect(animal.run()).to.be('run');
                expect(check(animal).passive().isOfType(Cat)).to.be(false);
                expect(check(animal).passive().isOfType(Animal)).to.be(true);
                expect(check(animal).passive().isOfType(Backbone.Model)).to.be(true);
            });

        });

        describe('globals', function() {

            describe('on', function() {
                it('should turn off verification if false', function() {
                    check.globals.on = true;
                    expect(function() { check(1).isBoolean(); })
                        .to.throwError();

                    check.globals.on = false;
                    check(1).isBoolean();

                    check.globals.on = true;
                });

                xdescribe('timing 1M iterations', function() {
                    var iterations = 1000000;
                    it('on', function() {
                        check.globals.on = true;
                        for (var i = 0; i < iterations; i++) {
                            check(1).passive().isNumber();
                        }
                    });
                    it('off', function() {
                        check.globals.on = false;
                        for (var i = 0; i < iterations; i++) {
                            check(1).passive().isNumber();
                        }
                        check.globals.on = true;
                    });
                });

            });

        });

    });

});
