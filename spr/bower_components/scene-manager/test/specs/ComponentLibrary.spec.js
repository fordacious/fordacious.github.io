define(function(require){
    var sinon = require('sinon');
    var ComponentLibrary = require('ComponentLibrary');

    describe('ComponentLibrary', function(){

        describe('getAllComponents', function(){
            it('should return what is passed to init', function(){
                var components = { key1: "value1", key2: 35, key3: function(blah) { return blah; } };
                ComponentLibrary.init(components);

                expect(ComponentLibrary.getAllComponents()).to.eql(components);
            });
        });
    });
});
