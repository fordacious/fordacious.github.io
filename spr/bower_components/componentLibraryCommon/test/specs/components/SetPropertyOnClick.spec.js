define(function(require) {
    var $ = require('jquery');
    var PropertySetter = require('components/SetPropertyOnClick');
    var Model = require('ExtendedModel');

    describe('Zoom', function() {
        var testArea, underTest, model, propertyName, value;

        beforeEach(function() {
            testArea = $('<div></div>');
            $('body').append(testArea);

            model = new Model();
            propertyName = 'soma';
            value = 'holiday';

            underTest = new PropertySetter();
            underTest.renderer = {
                $el: testArea
            };
            underTest.model = model;
            underTest.propertyName = propertyName;
            underTest.propertyValue = value;
        });

        afterEach(function() {
            testArea.remove();
        });

        describe('start', function() {
            it('should throw if the renderer is not provided', function() {
                delete underTest.renderer;

                expect(function() { underTest.start(); }).to.throw('The renderer must be specified.');
            });

            it('should throw if the model is not provided', function() {
                delete underTest.model;

                expect(function() { underTest.start(); }).to.throw('The model must be specified.');
            });

            it('should throw if the property name is not provided', function() {
                delete underTest.propertyName;

                expect(function() { underTest.start(); }).to.throw('The property name must be specified.');
            });
        });

        describe('when the element is clicked', function() {
            beforeEach(function() {
                underTest.start();
            });

            it('should set the model property to the specified value', function() {
                underTest.renderer.$el.trigger('click');

                expect(model.get(propertyName)).to.equal(value);
            });
        });

        describe('destroy', function() {
            var startValue = "brave";

            beforeEach(function() {
                model.set(propertyName, startValue);

                underTest.start();
            });

            it('should no longer update the model property when the element is clicked', function() {
                underTest.destroy();

                underTest.renderer.$el.trigger('click');

                expect(model.get(propertyName)).to.equal(startValue);
            });
        });

        describe('disable', function() {
            var startValue = "brave";

            beforeEach(function() {
                model.set(propertyName, startValue);

                underTest.start();
            });

            it('should disable clicking when disabled', function() {
                underTest.disable();
                underTest.renderer.$el.trigger('click');

                expect(model.get(propertyName)).to.equal(value);

                underTest.disable();
                underTest.renderer.$el.trigger('click');

            });
        });
    });
});