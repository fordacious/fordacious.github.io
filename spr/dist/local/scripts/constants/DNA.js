define(function(){
    var DNA = {};

    Object.defineProperty(DNA, 'NONE', { value: 'none', enumerable: true });
    Object.defineProperty(DNA, 'ADENINE', { value: 'adenine', enumerable: true });
    Object.defineProperty(DNA, 'GUANINE', { value: 'guanine', enumerable: true });
    Object.defineProperty(DNA, 'THYMINE', { value: 'thymine', enumerable: true });
    Object.defineProperty(DNA, 'CYTOSINE', { value: 'cytosine', enumerable: true });
    Object.defineProperty(DNA, 'PHOSPHORUS', { value: 'phosphorus', enumerable: true });

    var valueArray = [];
    var keyArray = [];

    for(var i in DNA){
        valueArray.push(DNA[i]);
        keyArray.push(i);
    }

    Object.defineProperty(DNA, 'valuesArray', {
        get: function(){ return valueArray; }
    });

    Object.defineProperty(DNA, 'keysArray', {
        get: function(){ return keyArray; }
    });

    DNA.getModelName = function (base) {
        return base;
    };

    DNA.isPurine = function (base) {
        return base === DNA.ADENINE || base === DNA.GUANINE;
    };

    DNA.isPyrimidine = function (base) {
        return base === DNA.CYTOSINE || base === DNA.THYMINE;
    };

    DNA.matchingBase = function (base) {
        if (base === DNA.ADENINE) {
            return DNA.THYMINE;
        } else if (base === DNA.THYMINE) {
            return DNA.ADENINE;
        } else if (base === DNA.GUANINE) {
            return DNA.CYTOSINE;
        }
        return DNA.GUANINE;
    };

    DNA.isCorrectBasePair = function (a,b) {
        if (!a || !b) {
            return true;
        }
        if (a === DNA.ADENINE) {
            return b === DNA.THYMINE;
        } else if (a === DNA.THYMINE) {
            return b === DNA.ADENINE;
        } else if (a === DNA.GUANINE) {
            return b === DNA.CYTOSINE;
        }
        return b === DNA.GUANINE;
    };

    return DNA;
});