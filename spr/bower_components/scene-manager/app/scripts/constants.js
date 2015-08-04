define(function(require) {
    var Constants = {};
    
    Object.defineProperty(Constants, 'FACTORY', {
        value: '+', 
        enumerable: true
    });
    
    Object.defineProperty(Constants, 'REFERENCE', {
        value: '&', 
        enumerable: true
    });
    
    Object.defineProperty(Constants, 'MEMBER', {
        value: '.', 
        enumerable: true
    });

    Object.defineProperty(Constants, 'PATTERN_ALL', {
        value: '*', 
        enumerable: true
    });

    Object.defineProperty(Constants, 'PATTERN_PARENT', {
        value: '^',
        enumerable: true
    });
    
    return Constants;
});
