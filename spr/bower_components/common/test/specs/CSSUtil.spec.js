/*globals expect*/
define(function(require){

    var CSSUtil = require('sim-common/CSSUtil');

    var props = "#player{width:100%; height:12px}";
    var url = "http://www.example.com:1234/asdf.css";

    describe('CSSUtil', function(){
        describe('When given css props', function(){
            it('should return a style tag with the props inside', function(){
                expect(CSSUtil.applyCSS(props)[0].innerHTML).to.equal(props);
            });
        });
        describe('When given css url', function(){
            it('should return a style tag with url', function(){
                expect(CSSUtil.applyCSS(url)[0].href).to.equal(url);
            });
        });
    });
});