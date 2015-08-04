define(function(){
    var Atoms = {};

    Object.defineProperty(Atoms, 'SINGLE_STRAND', { value: 'SINGLE_STRAND', enumerable: true });
    Object.defineProperty(Atoms, 'DOUBLE_STRAND', { value: 'DOUBLE_STRAND', enumerable: true });

    var valueArray = [];
    var keyArray = [];

    for(var i in Atoms){
        valueArray.push(Atoms[i]);
        keyArray.push(i);
    }

    Object.defineProperty(Atoms, 'valuesArray', {
        get: function(){ return valueArray; }
    });

    Object.defineProperty(Atoms, 'keysArray', {
        get: function(){ return keyArray; }
    });

    return Atoms;
});