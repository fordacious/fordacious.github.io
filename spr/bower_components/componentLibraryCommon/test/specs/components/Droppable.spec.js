define(function(require) {
    var $ = require('jquery');
    var Droppable = require('components/Droppable');
    var SceneManager = require('SceneManager');

    describe("droppable behavior", function() {
        var element, underTest, sceneElement;

        beforeEach(function() {
            element = $('<div></div>');
            $('body').append(element);

            sceneElement = $('<div></div>');
            $('body').append(sceneElement);
            SceneManager.ActiveScene = {
                $el: sceneElement
            };

            underTest = new Droppable();
            underTest.renderer = {
                $el : element
            };
        });

        afterEach(function() {
            element.remove();
            sceneElement.remove();
        });

        describe('start', function() {
            it('should make the element droppable', function() {
                underTest.start();

                expect(underTest.renderer.$el.hasClass('ui-droppable')).to.equal(true);
            });

            it('should set configuration options on the droppable', function() {
                underTest.config = { greedy: true };

                underTest.start();

                expect(underTest.renderer.$el.droppable('option', 'greedy')).to.equal(true);
            });

            it('should use the active scene element if no renderer is provided', function() {
                delete underTest.renderer;

                underTest.start();

                expect(sceneElement.hasClass('ui-droppable')).to.equal(true);
            });
        });
    });
});