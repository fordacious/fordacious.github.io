define(function(require) {
    var $ = require('jquery');
    var Invisible = require('components/PropertyVisibilityToggle');
    var Model = require('ExtendedModel');

    describe('Property visiblity toggle', function() {
        var underTest, element, model, propertyName, propertyValue;

        beforeEach(function() {
            element = $('<div></div>');
            $('body').append(element);

            model = new Model();
            propertyName = "chicken";
            propertyValue = "hot and sour";

            underTest = new Invisible();
            underTest.renderer = {
                $el: element
            };
            underTest.model = model;
            underTest.propertyName = propertyName;
            underTest.propertyValue = propertyValue;
        });

        describe('starting', function() {
            it("should throw if renderer isn't provided", function() {
                delete underTest.renderer;

                expect(function() { underTest.start(); }).to.throw("Renderer must be specified.");
            });

            it("should throw if model isn't provided", function() {
                delete underTest.model;

                expect(function() { underTest.start(); }).to.throw("Model must be specified.");
            });

            it("should throw if property name isn't provided", function() {
                delete underTest.propertyName;

                expect(function() { underTest.start(); }).to.throw("Property name must be specified.");
            });

            describe('with the matching flag set to true', function() {
                it('should make the element invisible if the property is not the propertyValue', function() {
                    model.set(propertyName, "something else");

                    underTest.start();

                    expect(underTest.renderer.$el.is(":visible")).to.equal(false);
                });

                it('should leave the element visible if the property is the propertyValue', function() {
                    model.set(propertyName, propertyValue);

                    underTest.start();

                    expect(underTest.renderer.$el.is(':visible')).to.equal(true);
                });
            });

            describe('with the matching flag set to false', function() {
                beforeEach(function() {
                    underTest.matching = false;
                });

                it('should make the property invisible if property is the propertyValue', function() {
                    model.set(propertyName, propertyValue);

                    underTest.start();

                    expect(underTest.renderer.$el.is(":visible")).to.equal(false);
                });

                it('should make the element visible if the property is not the propertyValue', function() {
                    model.set(propertyName, "something else");

                    underTest.start();

                    expect(underTest.renderer.$el.is(":visible")).to.equal(true);
                });
            });
        });

        describe('when the property changes', function() {
            describe('with the matching flag set to true', function() {
                beforeEach(function() {
                    model.set(propertyName, propertyValue);

                    underTest.start();
                });

                it('should make the element invisible if the property is not the propertyValue', function() {
                    model.set(propertyName, 'something else');

                    expect(underTest.renderer.$el.is(":visible")).to.equal(false);
                });

                it('should make the element visible when switching back to the propertyValue', function() {
                    model.set(propertyName, 'something else');

                    model.set(propertyName, propertyValue);

                    expect(underTest.renderer.$el.is(":visible")).to.equal(true);
                });
            });

            describe('with the matching flag set to false', function() {
                beforeEach(function() {
                    underTest.matching = false;
                    model.set(propertyName, propertyValue);

                    underTest.start();
                });

                it('should make the element visible if the property is not the propertyValue', function() {
                    model.set(propertyName, 'something else');

                    expect(underTest.renderer.$el.is(":visible")).to.equal(true);
                });

                it('should make the element invisible when switching back to the propertyValue', function() {
                    model.set(propertyName, 'something else');

                    model.set(propertyName, propertyValue);

                    expect(underTest.renderer.$el.is(":visible")).to.equal(false);
                });
            });
        });
    });
});