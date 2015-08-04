define(function(require){
    var $ = require('jquery');
    var HtmlRenderer = require('HtmlRenderer');
    var TemplateRenderer = require('TemplateRenderer');
    var ComponentLibrary = require('ComponentLibrary');

    describe('TemplateRenderer', function(){
        var underTest, components, renderer;
        beforeEach(function(){
            components = {
                'tpl1': '<div>Test template</div>',
                'tpl2': '<div><%= testVar %></div>',
                'tpl3': '<div>Test template</div><div>Second root</div>'
            };
            ComponentLibrary.init(components);
            renderer = new HtmlRenderer();

            underTest = new TemplateRenderer();
            underTest.parent = renderer;
        });

        it('should inherit the HtmlRenderer class', function(){
            expect(underTest).to.be.instanceOf(HtmlRenderer);
        });

        it('should have it’s self as a constructor', function(){
            expect(underTest.constructor).to.equal(TemplateRenderer);
        });

        describe('initialize', function(){
            it('should get the template from the component library and create an element', function(){
                underTest.template = 'tpl1';
                underTest.initialize();

                expect(underTest.$el.length).to.equal(1);
                expect(underTest.$el).to.be.instanceOf($);
                expect(underTest.$el.text()).to.equal('Test template');
            });

            it('should apply provided data to the template', function(){
                underTest.template = 'tpl2';
                underTest.templateData = { testVar: 4 };
                underTest.initialize();

                expect(underTest.$el.length).to.equal(1);
                expect(underTest.$el).to.be.instanceOf($);
                expect(underTest.$el.text()).to.equal('4');
            });

            it('should expose all template roots in $el', function(){
                underTest.template = 'tpl3';
                underTest.initialize();

                expect(underTest.$el.length).to.equal(2);
            });

            it('should add a class to the created element', function(){
                underTest.template = 'tpl1';
                var testClass = 'myClass';
                underTest.class = testClass;
                underTest.initialize();

                expect(underTest.$el.hasClass(testClass)).to.equal(true);
            });

            it('should set attributes on that element', function(){
                underTest.template = 'tpl1';
                underTest.attributes = {
                    a: 'asd',
                    b: 'bsd'
                };
                underTest.initialize();

                expect(underTest.$el.prop('a')).to.equal('asd');
                expect(underTest.$el.prop('b')).to.equal('bsd');
            });
        });
    });
});