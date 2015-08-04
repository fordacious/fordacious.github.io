define(function(require){
    var sinon = require('sinon');
    var sandbox = sinon.sandbox.create();

    var HtmlRenderer = require('HtmlRenderer');
    var TextRenderer = require('TextRenderer');

    describe('TextRenderer', function(){
        var underTest, renderer;
        beforeEach(function(){
            renderer = new HtmlRenderer();
            renderer.initialize();

            underTest = new TextRenderer();
            underTest.parent = renderer;
        });

        afterEach(function(){
            sandbox.restore();
        });

        it('should inherit the HtmlRenderer class', function(){
            expect(underTest).to.be.instanceOf(HtmlRenderer);
        });

        it('should have it’s self as a constructor', function(){
            expect(underTest.constructor).to.equal(TextRenderer);
        });

        describe('start', function(){
            beforeEach(function(){
                underTest.initialize();
            });

            it('should call the super method', function(){
                sandbox.stub(HtmlRenderer.prototype, 'start');
                underTest.start();
                expect(HtmlRenderer.prototype.start.callCount).to.equal(1);
            });

            it('should apply all the initial values to the $el', function(){
                underTest.text = 'Test';
                underTest.forceValues = true;
                underTest.start();

                expect(underTest.text).to.equal('Test');
                expect(underTest.$el.html()).to.equal('Test');
            });
            it('should apply initial values even if forceValues if false', function(){
                underTest.text = 'Test';
                underTest.forceValues = false;
                underTest.start();

                expect(underTest.text).to.equal('Test');
                expect(underTest.$el.html()).to.equal('Test');
            });
        });

        describe('syncFromCss', function(){
            beforeEach(function(){
                underTest.initialize();
                underTest.start();
            });

            it('should call the super method', function(){
                sandbox.stub(HtmlRenderer.prototype, 'syncFromCss');
                underTest.syncFromCss();
                expect(HtmlRenderer.prototype.syncFromCss.callCount).to.equal(1);
            });

            it('should sync all attributes with what exists in css', function(){
                underTest.text = 'Test1';
                underTest.$el.html('Test2');
                underTest.syncFromCss();
                expect(underTest.text).to.equal('Test2');
            });
        });

        describe('when text is being set', function(){
            beforeEach(function(){
                underTest.initialize();
                underTest.start();
            });

            it('should set the text for the element', function(){
                underTest.$el.html('Other');
                underTest.text = 'My Test';

                expect(underTest.text).to.equal('My Test');
                expect(underTest.$el.html()).to.equal('My Test');
            });
        });

        describe('when forceValue is being set', function(){
            beforeEach(function(){
                underTest.initialize();
                underTest.start();
            });

            it('should not allow values to be re-written when they are the same and flag is false', function(){
                underTest.text = 'Test1';
                underTest.forceValues = false;
                underTest.$el.html('Test2');
                underTest.text = 'Test1';

                expect(underTest.$el.html()).to.equal('Test2');
            });

            it('should allow values to be re-written even if they are the same and flag is true', function(){
                underTest.text = 'Test1';
                underTest.forceValues = true;
                underTest.$el.html('Test2');
                underTest.text = 'Test1';

                expect(underTest.$el.html()).to.equal('Test1');
            });
        });
    });
});