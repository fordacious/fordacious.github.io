define(function(require){

    var $ = require('jquery');

    var escapeChars = ["<",">", "&", "\""];
    var cssFileTester = /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)[a-z0-9.-]+(:[0-9]{1,5})?(\/.*)?.css$/;

    function escape(str){
        return str.replace(new RegExp('[' + escapeChars.join('') + ']', 'g'), '');
    }

    function applyCSS (value) {
        if (cssFileTester.test(value)) {
            return $('<link rel="stylesheet" type="text/css"/>').attr('href', value);
        } else {
            return $('<style></style>').html(escape(value));
        }
    }

    return {applyCSS:applyCSS};
});