/*globals document, window*/
define(function(require){
    var sinon = require('sinon');
    var $ = require('jquery');

    var Time = require('Time');

    // You cannot directly dispatch focus events on the window
    // otherwise I'd just use $window.focus()
    var dispatchFocus = function () {
        var eventObject = document.createEvent('Events');
        eventObject.initEvent('focus', true, false);
        window.dispatchEvent(eventObject);
    };

    describe('Time', function(){
        describe('creation', function(){

            it('should pause on window blur if pauseOnBlur is true', function(){
                var $window = $(window);
                var time = Time.create(true);
                expect(time.playing).to.equal(true);
                $window.blur();
                expect(time.playing).to.equal(false);
            });

            it('should play on window focus if pauseOnBlur is true', function(){
                var $window = $(window);
                var time = Time.create(true);
                expect(time.playing).to.equal(true);
                $window.blur();
                expect(time.playing).to.equal(false);
                dispatchFocus();
                expect(time.playing).to.equal(true);
            });

            it('should not pause on window blur if pauseOnBlur is false', function(){
                var $window = $(window);
                var time = Time.create(false);
                expect(time.playing).to.equal(true);
                $window.blur();
                expect(time.playing).to.equal(true);
            });

            it('should not play on window focus if pauseOnBlur is false', function(){
                var $window = $(window);
                var time = Time.create(false);
                expect(time.playing).to.equal(true);
                $window.blur();
                expect(time.playing).to.equal(true);
                dispatchFocus();
                expect(time.playing).to.equal(true);
                time.playing = false;
                dispatchFocus();
                expect(time.playing).to.equal(false);
            });
        });
    });
});