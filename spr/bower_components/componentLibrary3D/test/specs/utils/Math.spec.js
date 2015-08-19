define(function(require){

    var MathConverter = require('utils/Math');

    describe('Math Converter', function(){
        describe('Degrees to Radians', function(){

            it('should convert correctly', function(){

                expect(MathConverter.degToRad(90)).to.equal(Math.PI/2);
                expect(MathConverter.degToRad(180)).to.equal(Math.PI);
            });

        });

        describe('Radians to Degrees', function(){

            it('should convert correctly', function(){

                expect(MathConverter.radToDeg(Math.PI/2)).to.equal(90);
                expect(MathConverter.radToDeg(Math.PI)).to.equal(180);
            });

        });

    });
});