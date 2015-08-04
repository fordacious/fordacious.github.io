/*global requirejs */
requirejs.config({
    'shim': {
        'jquery': { 'exports': '$' },
        'sinon': { 'exports': 'sinon' },
        'underscore':{ 'exports': '_' },
        'backbone': { 'deps': ['jquery', 'underscore'], 'exports': 'Backbone'}
    },
    'paths': {
        'jquery': '../../bower_components/jquery/dist/jquery',
        'underscore': '../../bower_components/underscore/underscore',
        'backbone': '../../bower_components/backbone/backbone',

        'ComponentSystem': "../../bower_components/componentSystem/componentSystem",
        'ComponentLibrary': "../../bower_components/sceneManager/app/scripts/ComponentLibrary",
        'SceneManager': '../../bower_components/sceneManager/sceneManager'
    }
});
