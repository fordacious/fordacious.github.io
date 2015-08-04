/*globals console, checkBrowser, document*/
define (function(require){
    var $ = require('jquery');
    var $body;

    require('sim-common/Detect');
    require('sim-common/VersionCheck');

    var notSupportedTemplate = require('text!sim-common/templates/notSupported.html');
    var BackboneAdapter = require ('api/snapshot/adapters/BackboneAdapter').getInstance();
    var Controller = require('api/snapshot/Controller');
    var Transporter = require('api/snapshot/Transporter').getInstance();

    var ComponentLibrary = require('ComponentLibrary');
    var components = require('components');
    var SceneManager = require('SceneManager');

    var scenes = require('scenes/index');

    function init() {
        scenes.parent = $body;

        scenes.pauseOnBlur = false;

        ComponentLibrary.init(components);
        SceneManager.create(scenes);
        SceneManager.startScene('preload');
    }

    function loadInitial(){
        Transporter.addInitialSetupCompleteListener(init);
        Controller.notifyOnReady();
    }


    $(document).ready(function() {
        $body = $('body');
        if (!checkBrowser()) {
            $body.prepend(notSupportedTemplate);
            return;
        }

        loadInitial();
    });
});
