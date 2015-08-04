/*globals console*/
define (function(require){

    var _ = require('underscore');



    /*
     *   Private function that gets the value to format. value may be a number
     *   or an object. If its an object then we assume that the value to
     *   to format is an attribute called value.
     *   @param {Number | {value: Number} } value - the value to format
     *   @return {Number} the value
     */
    var getValueToFormat = function(value){

        if(_.isNumber(value)){
            return value;
        }

        //assume that value is an object and to value to format
        //sits on an attribute called value
        return value.value;

    };


    var NumberFormatter = {};




    /*
     *   Formats a value using the format function
     *   @param {Number | {value: Number} } value - the value to format
     *   @param {Function(value: Number): String} formatFunction - the function used to format
     *   @return {String} the formatted number
     */
    NumberFormatter.Format = function (value, formatFunction){

        var valueToFormat = getValueToFormat(value);

        return formatFunction.call(null, valueToFormat);
    };

    /*
     *   Formats a value using Levi's set of rules
     *   @param {Number | {value: Number} } value - the value to format
     *   @param {Object} params - list of options
     *           @param {Boolean} useDashOnNaN - if value is Nan, then return -
     *   @return {String} the formatted number
     */
    NumberFormatter.AstroFormat = function(value, params){
        var valueToFormat = getValueToFormat(value);
        params = params || {};

        var formattedValue;

        if(isNaN(value) && params.useDashOnNaN){
            formattedValue = '-';
        }
        else if(value === 0){
            formattedValue = "0";
        }
        else if(value >=1 && value <1000){
            formattedValue = value.toPrecision(4);
        }
        else if(value>=1000 && value <=999999){
            formattedValue = value.toFixed(0);
        }
        else
        {
            formattedValue =value.toPrecision(3);
        }

        return formattedValue;
    };

    /*
     *   Formats a number to number of decimal places.
     *   @param {Number | {value: Number} } value - the value to format
     *   @param {Number} decimalPlaces - The number of digits after the decimal point. Default is 0 (no digits after the decimal point)
     *   @return {String} the formatted number
     */
    NumberFormatter.NumberFormat = function(value, decimalPlaces){

        var valueToFormat = getValueToFormat(value);

        if(decimalPlaces < 0){
            throw new Error('Decimal places can not be less than 0');
        }

        var exp = Math.pow(10, decimalPlaces);
        return parseFloat(Math.round(valueToFormat * exp) / exp).toFixed(decimalPlaces);
    };

    /*
     *   Formats a number into scientific notation.
     *   @param {Number | {value: Number} } value - the value to format
     *   @param {Object} params - list of options
     *           @param {Number} decimalPlaces - An integer between 0 and 20 representing the number of digits in the notation after the decimal point. If omitted, it is set to as many digits as necessary to represent the value
     *           @param {Boolean} use10notation - if true, use x 10 ^ instead of e.
     *   @return {String} the formatted number
     */
    NumberFormatter.ExponentialFormat = function(value, params){
        params = params || {};

        var valueToFormat = getValueToFormat(value);

        var decimalPlaces = params.decimalPlaces;
        //use e notation by default
        var use10notation = params.use10notation || false;

        var valueToReturn = valueToFormat.toExponential(decimalPlaces);

        if(use10notation){
            valueToReturn = valueToReturn.replace("e", "x 10^");
        }

        return valueToReturn;

    };

    /*
     *   Formats a number into short format.
     *   k = returned value * 10^3
     *   m = returned value * 10^6
     *   b = returned value * 10^9
     *   t = returned value * 10^12
     *   @param {Number | {value: Number} } value - the value to format
     *   @return {String} the formatted number
     */
    NumberFormatter.ShortFormat = function(value){
        value = parseFloat( value );
        var newValue = Math.round( value * 100) / 100;
        var sign = value > 0 ? 1 : -1;
        var shortValue = '';
        value = Math.abs(value);

        if( isNaN( newValue ) ){
            return newValue;
        }

        if( value >= 1000 ){
            var suffixes = [ '' , 'K' , 'M' , 'B' , 'T' ];
            var suffixNum = Math.floor( ( '' + value ).length / 3 );
            for( var precision = 4 ; precision >= 1 ; precision-- ){
                var pow10 = Math.pow( 10 , precision );
                var tempShortValue = ( suffixNum !== 0 ? ( value / Math.pow( 1000 , suffixNum ) ) : value );
                shortValue = parseFloat( Math.floor( tempShortValue * pow10 ) / pow10 );

                var dotLessShortValue = ( shortValue + '' ).replace( /[^a-zA-Z 0-9]+/g , '' );
                if( dotLessShortValue.length <= 3 ){
                    break;
                }
            }
            newValue = shortValue + suffixes[ suffixNum ];
        }
        if( sign < 0 && shortValue && shortValue > 0 ){
            newValue = '-' + newValue;
        }
        return newValue;
    };


    NumberFormatter.TimeFormat = function (seconds) {
        seconds = Math.round(seconds < 0 ? 0 : seconds);
        var minutes = (Math.floor(seconds / 60)).toString();
        seconds = (seconds % 60).toString();
        seconds = seconds.length === 1 ? "0" + seconds : seconds;
        minutes = minutes.length === 1 ? "0" + minutes : minutes;
        return minutes + ":" + seconds;
    };


    return NumberFormatter;
});
