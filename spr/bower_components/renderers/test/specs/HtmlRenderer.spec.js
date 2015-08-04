/*globals HTMLDivElement, HTMLInputElement*/
define(function(require){
    var $ = require('jquery');
    var HtmlRenderer = require('HtmlRenderer');
    var SceneManager = require('SceneManager');

    describe('HtmlRenderer', function(){
        var underTest;
        beforeEach(function(){
            underTest = new HtmlRenderer();
        });

        describe('initialize', function(){
            it('should create a jquery element', function(){
                underTest.initialize();

                expect(underTest.$el).to.be.instanceOf($);
            });

            it('should create div element', function(){
                underTest.initialize();

                expect(underTest.$el.get(0)).to.be.instanceOf(HTMLDivElement);
            });

            it('should create input element', function(){
                underTest.type = 'input';
                underTest.initialize();

                expect(underTest.$el.get(0)).to.be.instanceOf(HTMLInputElement);
            });

            it('should add a class to the created element', function(){
                var testClass = 'myClass';
                underTest.class = testClass;
                underTest.initialize();

                expect(underTest.$el.hasClass(testClass)).to.equal(true);
            });

            it('should set attributes on that element', function(){
                underTest.attributes = {
                    a: 'asd',
                    b: 'bsd'
                };
                underTest.initialize();

                expect(underTest.$el.prop('a')).to.equal('asd');
                expect(underTest.$el.prop('b')).to.equal('bsd');
            });
        });

        describe('start', function(){
            var scene, renderer;
            beforeEach(function(){
                scene = {
                    $el: $('<div />')
                };
                SceneManager.ActiveScene = scene;
                underTest.initialize();


                renderer = new HtmlRenderer();
                renderer.initialize();
            });
            it('should use active scene if no parent is defined', function(){
                underTest.start();

                expect(underTest.parent).to.equal(scene);
            });
            it('should use active scene if the parent is defined but it doesn’t have an $el', function(){
                underTest.parent = {};
                underTest.start();

                expect(underTest.parent).to.equal(scene);
            });
            it('should use the provided parent if it has an $el', function(){
                underTest.parent = renderer;
                underTest.start();

                expect(underTest.parent).to.equal(renderer);
            });
            it('should append the $el to the parent’s $el', function(){
                underTest.parent = renderer;
                underTest.start();

                expect(renderer.$el.children()[0]).to.equal(underTest.$el[0]);
            });
            it('should apply all the initial values to the $el', function(){
                underTest.x = 10;
                underTest.y = 20;
                underTest.z = 30;
                underTest.rotation = 12;
                underTest.scaleX = 0.5;
                underTest.scaleY = 0.4;
                underTest.skewX = 23.3;
                underTest.skewY = 23;
                underTest.width = 40;
                underTest.height = 50;
                underTest.alpha = 60;
                underTest.forceValues = true;
                underTest.start();

                expect(underTest.x).to.equal(10);
                expect(underTest.y).to.equal(20);
                expect(underTest.z).to.equal(30);
                expect(underTest.rotation).to.equal(12);
                expect(underTest.scaleX).to.equal(0.5);
                expect(underTest.scaleY).to.equal(0.4);
                expect(underTest.skewX).to.equal(23.3);
                expect(underTest.skewY).to.equal(23);
                expect(underTest.width).to.equal(40);
                expect(underTest.height).to.equal(50);
                expect(underTest.alpha).to.equal(60);
                expect(underTest.forceValues).to.equal(true);
                var transform = underTest.$el.css('transform') || underTest.$el.css('-webkit-transform');

                expect(transform).to.equal('translate3d(10px, 20px, 0px) rotate3d(0, 0, 1, 12deg) scale3d(0.5, 0.4, 1) skewX(23.3deg) skewY(23deg)');
                expect(underTest.$el.get(0).style.msTransform).to.equal('translate(10px, 20px) rotate(12deg) scale(0.5, 0.4) skewX(23.3deg) skewY(23deg)');
                expect(underTest.$el.css('z-index')).to.equal('30');
                expect(underTest.$el.css('width')).to.equal('40px');
                expect(underTest.$el.css('height')).to.equal('50px');
                expect(underTest.$el.css('opacity')).to.equal('60');
            });
            it('should apply initial values even if forceValues if false', function(){
                underTest.x = 10;
                underTest.y = 20;
                underTest.z = 30;
                underTest.rotation = 12;
                underTest.scaleX = 0.5;
                underTest.scaleY = 0.4;
                underTest.skewX = 23.3;
                underTest.skewY = 23;
                underTest.width = 40;
                underTest.height = 50;
                underTest.alpha = 60;
                underTest.forceValues = false;
                underTest.start();

                expect(underTest.x).to.equal(10);
                expect(underTest.y).to.equal(20);
                expect(underTest.z).to.equal(30);
                expect(underTest.rotation).to.equal(12);
                expect(underTest.scaleX).to.equal(0.5);
                expect(underTest.scaleY).to.equal(0.4);
                expect(underTest.skewX).to.equal(23.3);
                expect(underTest.skewY).to.equal(23);
                expect(underTest.width).to.equal(40);
                expect(underTest.height).to.equal(50);
                expect(underTest.alpha).to.equal(60);
            });
        });

        describe('syncFromCss', function(){
            var renderer;
            beforeEach(function(){
                renderer = new HtmlRenderer();
                renderer.initialize();
                underTest.parent = renderer;
                underTest.initialize();
                underTest.start();
            });

            it('should sync all attributes with what exists in css', function(){
                underTest.x = 10;
                underTest.y = 20;
                underTest.z = 30;
                underTest.rotation = 30;
                underTest.scaleX = 30;
                underTest.scaleY = 30;
                underTest.skewX = 30;
                underTest.skewY = 30;
                underTest.width = 40;
                underTest.height = 50;
                underTest.alpha = 60;
                underTest.$el.css({
                    'transform': 'translate3d(1px, 2px, 0px) rotate3d(0, 0, 1, 40deg) scale3d(40, 40, 1) skewX(40deg) skewY(40deg)',
                    '-webkit-transform': 'translate3d(1px, 2px, 0px) rotate3d(0, 0, 1, 40deg) scale3d(40, 40, 1) skewX(40deg) skewY(40deg)',
                    '-ms-transform': 'translate3d(1px, 2px, 0px) rotate3d(0, 0, 1, 40deg) scale3d(40, 40, 1) skewX(40deg) skewY(40deg)',
                    'z-index': 3,
                    'width': '4px',
                    'height': '5px',
                    'opacity': 6
                });
                underTest.syncFromCss();
                expect(underTest.x).to.equal(1);
                expect(underTest.y).to.equal(2);
                expect(underTest.z).to.equal(3);
                expect(underTest.rotation).to.equal(40);
                expect(underTest.scaleX).to.equal(40);
                expect(underTest.scaleY).to.equal(40);
                expect(underTest.skewX).to.equal(40);
                expect(underTest.skewY).to.equal(40);
                expect(underTest.width).to.equal(4);
                expect(underTest.height).to.equal(5);
                expect(underTest.alpha).to.equal(6);
            });

            it('should sync ie9 css properties', function(){
                underTest.x = 10;
                underTest.y = 20;
                underTest.z = 30;
                underTest.rotation = 40;
                underTest.scaleX = 50;
                underTest.scaleY = 60;
                underTest.skewX = 70;
                underTest.skewY = 80;
                underTest.width = 90;
                underTest.height = 100;
                underTest.alpha = 110;
                underTest.$el.css({
                    'transform': 'translate(1px, 2px) rotate(3deg) scale(4, 5) skewX(6deg) skewY(7deg)',
                    '-webkit-transform': 'translate(1px, 2px) rotate(3deg) scale(4, 5) skewX(6deg) skewY(7deg)',
                    '-ms-transform': 'translate(1px, 2px) rotate(3deg) scale(4, 5) skewX(6deg) skewY(7deg)',
                    'z-index': 8,
                    'width': '9px',
                    'height': '10px',
                    'opacity': 11
                });
                underTest.syncFromCss();
                expect(underTest.x).to.equal(1);
                expect(underTest.y).to.equal(2);
                expect(underTest.z).to.equal(8);
                expect(underTest.rotation).to.equal(3);
                expect(underTest.scaleX).to.equal(4);
                expect(underTest.scaleY).to.equal(5);
                expect(underTest.skewX).to.equal(6);
                expect(underTest.skewY).to.equal(7);
                expect(underTest.width).to.equal(9);
                expect(underTest.height).to.equal(10);
                expect(underTest.alpha).to.equal(11);
            });

            it('should sync all attributes to null if they don’t exists in css', function(){
                underTest.x = 10;
                underTest.y = 20;
                underTest.z = 30;
                underTest.rotation = 40;
                underTest.scaleX = 50;
                underTest.scaleY = 60;
                underTest.skewX = 70;
                underTest.skewY = 80;
                underTest.width = 90;
                underTest.height = 100;
                underTest.alpha = 110;
                underTest.$el.css({
                    'transform': '',
                    '-webkit-transform': '',
                    '-ms-transform': '',
                    'z-index': '',
                    'width': '',
                    'height': '',
                    'opacity': ''
                });
                underTest.syncFromCss();
                expect(underTest.x).to.equal(null);
                expect(underTest.y).to.equal(null);
                expect(underTest.z).to.equal(null);
                expect(underTest.rotation).to.equal(null);
                expect(underTest.scaleX).to.equal(null);
                expect(underTest.scaleY).to.equal(null);
                expect(underTest.skewX).to.equal(null);
                expect(underTest.skewY).to.equal(null);
                expect(underTest.width).to.equal(null);
                expect(underTest.height).to.equal(null);
                expect(underTest.alpha).to.equal(null);
            });
        });

        describe('when transformational properties (x,y,rotation,scale,skew) are being set', function(){
            var renderer;
            beforeEach(function(){
                renderer = new HtmlRenderer();
                renderer.initialize();
                underTest.parent = renderer;
                underTest.initialize();
                underTest.start();
            });

            it('should translate the element', function(){
                underTest.$el.css('-webkit-transform', 'translate3d(10px, 10px, 0px)');
                underTest.x = 100;
                underTest.y = 99;
                var transform = underTest.$el.css('transform') || underTest.$el.css('-webkit-transform') || underTest.$el.css('-ms-transform');

                expect(underTest.x).to.equal(100);
                expect(underTest.y).to.equal(99);
                expect(transform).to.equal('translate3d(100px, 99px, 0px) rotate3d(0, 0, 1, 0deg) scale3d(1, 1, 1) skewX(0deg) skewY(0deg)');
                expect(underTest.$el.get(0).style.msTransform).to.equal('translate(100px, 99px) rotate(0deg) scale(1, 1) skewX(0deg) skewY(0deg)');
            });

            it('should rotate the element', function(){
                underTest.$el.css('-webkit-transform', 'rotate(10deg)');
                underTest.rotation = 100;
                var transform = underTest.$el.css('transform') || underTest.$el.css('-webkit-transform') || underTest.$el.css('-ms-transform');

                expect(underTest.rotation).to.equal(100);
                expect(transform).to.equal('translate3d(0px, 0px, 0px) rotate3d(0, 0, 1, 100deg) scale3d(1, 1, 1) skewX(0deg) skewY(0deg)');
                expect(underTest.$el.get(0).style.msTransform).to.equal('translate(0px, 0px) rotate(100deg) scale(1, 1) skewX(0deg) skewY(0deg)');
            });

            it('should scale the element', function(){
                underTest.$el.css('-webkit-transform', 'scale(10, 20)');
                underTest.scaleX = 4;
                underTest.scaleY = 3;
                var transform = underTest.$el.css('transform') || underTest.$el.css('-webkit-transform') || underTest.$el.css('-ms-transform');

                expect(underTest.scaleX).to.equal(4);
                expect(underTest.scaleY).to.equal(3);
                expect(transform).to.equal('translate3d(0px, 0px, 0px) rotate3d(0, 0, 1, 0deg) scale3d(4, 3, 1) skewX(0deg) skewY(0deg)');
                expect(underTest.$el.get(0).style.msTransform).to.equal('translate(0px, 0px) rotate(0deg) scale(4, 3) skewX(0deg) skewY(0deg)');
            });

            it('should skew the element', function(){
                underTest.$el.css('-webkit-transform', 'skewX(10deg) skewY(20)');
                underTest.skewX = 4;
                underTest.skewY = 3;
                var transform = underTest.$el.css('transform') || underTest.$el.css('-webkit-transform') || underTest.$el.css('-ms-transform');

                expect(underTest.skewX).to.equal(4);
                expect(underTest.skewY).to.equal(3);
                expect(transform).to.equal('translate3d(0px, 0px, 0px) rotate3d(0, 0, 1, 0deg) scale3d(1, 1, 1) skewX(4deg) skewY(3deg)');
                expect(underTest.$el.get(0).style.msTransform).to.equal('translate(0px, 0px) rotate(0deg) scale(1, 1) skewX(4deg) skewY(3deg)');
            });

            it('should set x as null when setting x to null, undefined or not a floating number', function(){
                underTest.x = 1;
                underTest.x = null;
                expect(underTest.x).to.equal(null);
                underTest.x = 1;
                underTest.x = undefined;
                expect(underTest.x).to.equal(null);
                underTest.x = 1;
                underTest.x = 'no number here sir';
                expect(underTest.x).to.equal(null);
            });

            it('should set y as null when setting y to null, undefined or not a floating number', function(){
                underTest.y = 1;
                underTest.y = null;
                expect(underTest.y).to.equal(null);
                underTest.y = 1;
                underTest.y = undefined;
                expect(underTest.y).to.equal(null);
                underTest.y = 1;
                underTest.y = 'no number here sir';
                expect(underTest.y).to.equal(null);
            });

            it('should set rotation as null when setting rotation to null, undefined or not a floating number', function(){
                underTest.rotation = 1;
                underTest.rotation = null;
                expect(underTest.rotation).to.equal(null);
                underTest.rotation = 1;
                underTest.rotation = undefined;
                expect(underTest.rotation).to.equal(null);
                underTest.rotation = 1;
                underTest.rotation = 'no number here sir';
                expect(underTest.rotation).to.equal(null);
            });

            it('should set scaleX as null when setting scaleX to null, undefined or not a floating number', function(){
                underTest.scaleX = 1;
                underTest.scaleX = null;
                expect(underTest.scaleX).to.equal(null);
                underTest.scaleX = 1;
                underTest.scaleX = undefined;
                expect(underTest.scaleX).to.equal(null);
                underTest.scaleX = 1;
                underTest.scaleX = 'no number here sir';
                expect(underTest.scaleX).to.equal(null);
            });

            it('should set scaleY as null when setting scaleY to null, undefined or not a floating number', function(){
                underTest.scaleY = 1;
                underTest.scaleY = null;
                expect(underTest.scaleY).to.equal(null);
                underTest.scaleY = 1;
                underTest.scaleY = undefined;
                expect(underTest.scaleY).to.equal(null);
                underTest.scaleY = 1;
                underTest.scaleY = 'no number here sir';
                expect(underTest.scaleY).to.equal(null);
            });

            it('should set skewX as null when setting skewX to null, undefined or not a floating number', function(){
                underTest.skewX = 1;
                underTest.skewX = null;
                expect(underTest.skewX).to.equal(null);
                underTest.skewX = 1;
                underTest.skewX = undefined;
                expect(underTest.skewX).to.equal(null);
                underTest.skewX = 1;
                underTest.skewX = 'no number here sir';
                expect(underTest.skewX).to.equal(null);
            });

            it('should set skewY as null when setting skewY to null, undefined or not a floating number', function(){
                underTest.skewY = 1;
                underTest.skewY = null;
                expect(underTest.skewY).to.equal(null);
                underTest.skewY = 1;
                underTest.skewY = undefined;
                expect(underTest.skewY).to.equal(null);
                underTest.skewY = 1;
                underTest.skewY = 'no number here sir';
                expect(underTest.skewY).to.equal(null);
            });

            it('should assume that properties are set to their default value if other values are valid', function(){
                underTest.x = 10;
                underTest.$el.css('-webkit-transform', ' translate3d(10px, 10px, 0px) rotate(10deg) scale(10, 10) skewX(10deg) skewY(10deg)');
                underTest.x = null;
                underTest.y = 99;
                underTest.rotation = null;
                underTest.scaleX = null;
                underTest.scaleY = null;
                underTest.skewX = null;
                underTest.skewY = null;
                var transform = underTest.$el.css('transform') || underTest.$el.css('-webkit-transform') || underTest.$el.css('-ms-transform');

                expect(transform).to.equal('translate3d(0px, 99px, 0px) rotate3d(0, 0, 1, 0deg) scale3d(1, 1, 1) skewX(0deg) skewY(0deg)');
                expect(underTest.$el.get(0).style.msTransform).to.equal('translate(0px, 99px) rotate(0deg) scale(1, 1) skewX(0deg) skewY(0deg)');
            });

            it('should remove all transform properties if all transformational properties are null', function(){
                underTest.x = 10;
                underTest.y = 10;
                underTest.rotation = 30;
                underTest.scaleX = 30;
                underTest.scaleY = 30;
                underTest.skewX = 30;
                underTest.skewY = 30;

                underTest.x = null;
                underTest.y = null;
                underTest.rotation = null;
                underTest.scaleX = null;
                underTest.scaleY = null;
                underTest.skewX = null;
                underTest.skewY = null;

                expect(underTest.$el.css('transform') === undefined || underTest.$el.css('transform') === '').to.equal(true);
                expect(underTest.$el.css('-webkit-transform') === undefined || underTest.$el.css('-webkit-transform') === '').to.equal(true);
                expect(underTest.$el.css('-ms-transform') === undefined || underTest.$el.css('-ms-transform') === '').to.equal(true);
            });
        });

        describe('when z is being set', function(){
            var renderer;
            beforeEach(function(){
                renderer = new HtmlRenderer();
                renderer.initialize();
                underTest.parent = renderer;
                underTest.initialize();
                underTest.start();
            });

            it('should set the z-index for the element', function(){
                underTest.$el.css('z-index', '10');
                underTest.z = 20;

                expect(underTest.z).to.equal(20);
                expect(underTest.$el.css('z-index')).to.equal('20');
            });

            it('should set z as null when setting z to null, undefined or not a floating number', function(){
                underTest.z = 1;
                underTest.z = null;
                expect(underTest.z).to.equal(null);
                underTest.z = 1;
                underTest.z = undefined;
                expect(underTest.z).to.equal(null);
                underTest.z = 1;
                underTest.z = 'no number here sir';
                expect(underTest.z).to.equal(null);
            });

            it('should remove the z-index property when set to null', function(){
                underTest.$el.css('z-index', '10');
                underTest.z = 1;
                underTest.z = null;
                expect(underTest.$el.css('z-index')).to.equal('');
            });
        });

        describe('when width is being set', function(){
            var renderer;
            beforeEach(function(){
                renderer = new HtmlRenderer();
                renderer.initialize();
                underTest.parent = renderer;
                underTest.initialize();
                underTest.start();
            });

            it('should set the width for the element', function(){
                underTest.$el.css('width', '10px');
                underTest.width = 20;

                expect(underTest.width).to.equal(20);
                expect(underTest.$el.css('width')).to.equal('20px');
            });

            it('should set width as null when setting width to null, undefined or not a floating number', function(){
                underTest.width = 1;
                underTest.width = null;
                expect(underTest.width).to.equal(null);
                underTest.width = 1;
                underTest.width = undefined;
                expect(underTest.width).to.equal(null);
                underTest.width = 1;
                underTest.width = 'no number here sir';
                expect(underTest.width).to.equal(null);
            });

            it('should remove the width property when set to null', function(){
                underTest.$el.css('width', '10px');
                underTest.width = 1;
                underTest.width = null;
                expect(underTest.$el.prop('style').cssText).to.equal('');
            });
        });

        describe('when height is being set', function(){
            var renderer;
            beforeEach(function(){
                renderer = new HtmlRenderer();
                renderer.initialize();
                underTest.parent = renderer;
                underTest.initialize();
                underTest.start();
            });

            it('should set the height for the element', function(){
                underTest.$el.css('height', '10px');
                underTest.height = 20;

                expect(underTest.height).to.equal(20);
                expect(underTest.$el.css('height')).to.equal('20px');
            });

            it('should set height as null when setting height to null, undefined or not a floating number', function(){
                underTest.height = 1;
                underTest.height = null;
                expect(underTest.height).to.equal(null);
                underTest.height = 1;
                underTest.height = undefined;
                expect(underTest.height).to.equal(null);
                underTest.height = 1;
                underTest.height = 'no number here sir';
                expect(underTest.height).to.equal(null);
            });

            it('should remove the height property when set to null', function(){
                underTest.$el.css('height', '10px');
                underTest.height = 1;
                underTest.height = null;
                expect(underTest.$el.prop('style').cssText).to.equal('');
            });
        });

        describe('when alpha is being set', function(){
            var renderer;
            beforeEach(function(){
                renderer = new HtmlRenderer();
                renderer.initialize();
                underTest.parent = renderer;
                underTest.initialize();
                underTest.start();
            });

            it('should set the opacity for the element', function(){
                underTest.$el.css('opacity', '10');
                underTest.alpha = 20;

                expect(underTest.alpha).to.equal(20);
                expect(underTest.$el.css('opacity')).to.equal('20');
            });

            it('should set alpha as null when setting alpha to null, undefined or not a floating number', function(){
                underTest.alpha = 1;
                underTest.alpha = null;
                expect(underTest.alpha).to.equal(null);
                underTest.alpha = 1;
                underTest.alpha = undefined;
                expect(underTest.alpha).to.equal(null);
                underTest.alpha = 1;
                underTest.alpha = 'no number here sir';
                expect(underTest.alpha).to.equal(null);
            });

            it('should remove the opacity property when set to null', function(){
                underTest.$el.css('opacity', '10');
                underTest.alpha = 1;
                underTest.alpha = null;
                expect(underTest.$el.prop('style').cssText).to.equal('');
            });
        });

        describe('when forceValue is being set', function(){
            var renderer;
            beforeEach(function(){
                renderer = new HtmlRenderer();
                renderer.initialize();
                underTest.parent = renderer;
                underTest.initialize();
                underTest.start();
            });

            it('should not allow values to be re-written when they are the same and flag is false', function(){
                underTest.x = 10;
                underTest.y = 20;
                underTest.z = 30;
                underTest.rotation = 40;
                underTest.scaleX = 50;
                underTest.scaleY = 60;
                underTest.skewX = 70;
                underTest.skewY = 80;
                underTest.width = 90;
                underTest.height = 100;
                underTest.alpha = 110;
                underTest.forceValues = false;

                underTest.$el.css({
                    'transform': 'translate3d(1px, 2px, 0px) rotate3d(0, 0, 1, 3deg) scale3d(4, 5, 1) skewX(6deg) skewY(7deg)',
                    '-webkit-transform': 'translate3d(1px, 2px, 0px) rotate3d(0, 0, 1, 3deg) scale3d(4, 5, 1) skewX(6deg) skewY(7deg)',
                    '-ms-transform': 'translate3d(1px, 2px, 0px) rotate3d(0, 0, 1, 3deg) scale3d(4, 5, 1) skewX(6deg) skewY(7deg)',
                    'z-index': '3',
                    'width': '4px',
                    'height': '5px',
                    'opacity': '6'
                });

                underTest.x = 10;
                underTest.y = 20;
                underTest.z = 30;
                underTest.rotation = 40;
                underTest.scaleX = 50;
                underTest.scaleY = 60;
                underTest.skewX = 70;
                underTest.skewY = 80;
                underTest.width = 90;
                underTest.height = 100;
                underTest.alpha = 110;

                var transform = underTest.$el.css('transform') || underTest.$el.css('-webkit-transform') || underTest.$el.css('-ms-transform');
                expect(transform).to.equal('translate3d(1px, 2px, 0px) rotate3d(0, 0, 1, 3deg) scale3d(4, 5, 1) skewX(6deg) skewY(7deg)');
                expect(underTest.$el.get(0).style.msTransform).to.equal('translate3d(1px, 2px, 0px) rotate3d(0, 0, 1, 3deg) scale3d(4, 5, 1) skewX(6deg) skewY(7deg)');
                expect(underTest.$el.css('z-index')).to.equal('3');
                expect(underTest.$el.css('width')).to.equal('4px');
                expect(underTest.$el.css('height')).to.equal('5px');
                expect(underTest.$el.css('opacity')).to.equal('6');
            });

            it('should allow values to be re-written even if they are the same and flag is true', function(){
                underTest.x = 10;
                underTest.y = 20;
                underTest.z = 30;
                underTest.rotation = 40;
                underTest.scaleX = 50;
                underTest.scaleY = 60;
                underTest.skewX = 70;
                underTest.skewY = 80;
                underTest.width = 90;
                underTest.height = 100;
                underTest.alpha = 110;
                underTest.forceValues = true;

                underTest.$el.css({
                    'transform': 'translate3d(1px, 2px, 0px) rotate3d(0, 0, 1, 3deg) scale3d(4, 5, 1) skewX(6deg) skewY(7deg)',
                    '-webkit-transform': 'translate3d(1px, 2px, 0px) rotate3d(0, 0, 1, 3deg) scale3d(4, 5, 1) skewX(6deg) skewY(7deg)',
                    '-ms-transform': 'translate3d(1px, 2px, 0px) rotate3d(0, 0, 1, 3deg) scale3d(4, 5, 1) skewX(6deg) skewY(7deg)',
                    'z-index': '3',
                    'width': '4px',
                    'height': '5px',
                    'opacity': '6'
                });

                underTest.x = 10;
                underTest.y = 20;
                underTest.z = 30;
                underTest.rotation = 40;
                underTest.scaleX = 50;
                underTest.scaleY = 60;
                underTest.skewX = 70;
                underTest.skewY = 80;
                underTest.width = 90;
                underTest.height = 100;
                underTest.alpha = 110;

                var transform = underTest.$el.css('transform') || underTest.$el.css('-webkit-transform');
                expect(transform).to.equal('translate3d(10px, 20px, 0px) rotate3d(0, 0, 1, 40deg) scale3d(50, 60, 1) skewX(70deg) skewY(80deg)');
                expect(underTest.$el.get(0).style.msTransform).to.equal('translate(10px, 20px) rotate(40deg) scale(50, 60) skewX(70deg) skewY(80deg)');
                expect(underTest.$el.css('z-index')).to.equal('30');
                expect(underTest.$el.css('width')).to.equal('90px');
                expect(underTest.$el.css('height')).to.equal('100px');
                expect(underTest.$el.css('opacity')).to.equal('110');
            });
        });
    });
});