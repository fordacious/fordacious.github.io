/*global requirejs */
requirejs.config({
    'shim': {
        'jquery': { 'exports': '$' },
        'sinon': { 'exports': 'sinon' },
        'underscore':{ 'exports': '_' }
    },
    'paths': {
        'jquery': '../../bower_components/jquery/dist/jquery',
        'underscore': '../../bower_components/underscore/underscore',

        'ComponentSystem': "../../bower_components/componentSystem/componentSystem",
        'SceneManager': "../../bower_components/sceneManager/app/scripts/Manager",
        'SceneManager/Scene': "../../bower_components/sceneManager/app/scripts/Scene",
        'ComponentLibrary': "../../bower_components/sceneManager/app/scripts/ComponentLibrary",
        'SceneManager/ComponentQuery': "../../bower_components/sceneManager/app/scripts/ComponentQuery",
        'SceneManager/Time': '../../bower_components/sceneManager/app/scripts/Time',
        'SceneManager/ResolutionProperty': '../../bower_components/sceneManager/app/scripts/ResolutionProperty'
    }
});