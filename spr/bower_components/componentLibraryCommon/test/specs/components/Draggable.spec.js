define(function(require) {
    var $ = require('jquery');
    var Draggable = require('components/Draggable');

    describe("draggable behavior", function() {
        var element, underTest;

        beforeEach(function() {
            element = $('<div></div>');
            $('body').append(element);

            underTest = new Draggable();
            underTest.renderer = {
                $el : element
            };
        });

        afterEach(function() {
            element.remove();
        });

        describe('start', function() {
            it("should throw if the renderer isn't provided", function() {
                delete underTest.renderer;

                expect(function() { underTest.start(); }).to.throw("Renderer must be specified.");
            });

            it('should make the element draggable', function() {
                underTest.start();

                expect(underTest.renderer.$el.hasClass('ui-draggable')).to.equal(true);
            });

            it('should set configuration options on the draggable', function() {
                underTest.config = { helper: "clone" };

                underTest.start();

                expect(underTest.renderer.$el.draggable('option', 'helper')).to.equal('clone');
            });
        });
    });
});