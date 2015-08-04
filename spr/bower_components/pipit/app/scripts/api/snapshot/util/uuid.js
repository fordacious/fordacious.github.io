define(function(require) {
    // Private array of chars to use
    var CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');

    var uuid = function() {
        var uuid = "";
        var r;
        for (var i = 0; i < 46; i++) {
            r = 0 | Math.random() * 36;
            uuid += CHARS[r];
        }

        return uuid;
    };

    return uuid;

});
