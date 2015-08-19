/*globals window*/
var browserCheck = true;
var checkBrowser = function(extraUnsupports){

    var unsupportedBrowsers = [{
        browser       : "Explorer",
        beforeVersion : 9
    },{
        browser       : "Firefox",
        beforeVersion : 17 
    }];

    unsupportedBrowsers.push.apply(unsupportedBrowsers, extraUnsupports);

    for (var i in unsupportedBrowsers) {
        var name = unsupportedBrowsers[i].browser;
        var vers = unsupportedBrowsers[i].beforeVersion;

        if (name === window.BrowserDetect.browser && parseInt(window.BrowserDetect.version,10) < vers) {
            browserCheck = false;
            break;
        }
    }

    return browserCheck;

};