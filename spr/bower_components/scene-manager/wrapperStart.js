(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD.
        define(['jquery', 'ComponentSystem', 'ComponentLibrary'], factory);
    } else {
        // Browser globals
        root.SceneManager = factory();
    }
}(this, function (jquery, componentSystem, componentLibrary) {