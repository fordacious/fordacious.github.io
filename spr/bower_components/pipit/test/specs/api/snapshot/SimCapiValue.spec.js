define(function(require) {

    var SimCapiValue = require('api/snapshot/SimCapiValue');

    describe('SimCapiValue', function() {



        it('should determine the proper types', function() {
            var value = new SimCapiValue({
                key: 'test',
                value: 2
            });
            var value2 = new SimCapiValue({
                key: 'test',
                value: "50"
            });
            var value3 = new SimCapiValue({
                key: 'test',
                value: 50,
                type: SimCapiValue.TYPES.NUMBER
            });

            expect(value.type).to.equal(SimCapiValue.TYPES.NUMBER);
            expect(value2.type).to.equal(SimCapiValue.TYPES.STRING);
            expect(value3.type).to.equal(SimCapiValue.TYPES.NUMBER);
        });

        it('should determine the type to be ENUM and throw error if value is not allowed', function() {
            var allowedValues = ["enum1", "enum2", "enum3"];
            var value = new SimCapiValue({
                key: 'test',
                value: "enum1",
                allowedValues: allowedValues
            });

            expect(value.type).to.equal(SimCapiValue.TYPES.ENUM);
            expect(value.allowedValues).to.equal(allowedValues);

            expect(function() {
                value.setValue('enumUndefined');
            }).throwError();

        });

        it('should throw error allowed values is not valid', function() {

            expect(function() {
                new SimCapiValue({
                    key: 'test',
                    value: "enum1",
                    allowedValues: "enum1"
                });
            }).throwError();
            expect(function() {
                new SimCapiValue({
                    key: 'test',
                    value: 1,
                    allowedValues: [1]
                });
            }).throwError();
            expect(function() {
                new SimCapiValue({
                    key: 'test',
                    value: 1,
                    allowedValues: null
                });
            }).to.not.throwError();

        });

        it('should throw if Math Expression is anything but a String', function() {
            expect(function() {
                new SimCapiValue({
                    key: 'test',
                    value: 2,
                    type: SimCapiValue.TYPES.MATH_EXPR
                });
            }).throwError();

            expect(function() {
                new SimCapiValue({
                    key: 'test',
                    value: [],
                    type: SimCapiValue.TYPES.MATH_EXPR
                });
            }).throwError();

            expect(function() {
                new SimCapiValue({
                    key: 'test',
                    value: "",
                    type: SimCapiValue.TYPES.MATH_EXPR
                });
            }).to.not.throwError();
        });

        it('should throw if Array Point is anything but an Array', function() {
            expect(function() {
                new SimCapiValue({
                    key: 'test',
                    value: 2,
                    type: SimCapiValue.TYPES.ARRAY_POINT
                });
            }).throwError();

            expect(function() {
                new SimCapiValue({
                    key: 'test',
                    value: "",
                    type: SimCapiValue.TYPES.ARRAY_POINT
                });
            }).throwError();

            expect(function() {
                new SimCapiValue({
                    key: 'test',
                    value: [],
                    type: SimCapiValue.TYPES.ARRAY_POINT
                });
            }).to.not.throwError();
        });

    });

});
