/*global requirejs */
requirejs.config({
    'shim': {
        'jquery': { 'exports': '$' },
        'sinon': { 'exports': 'sinon' },
        'underscore':{ 'exports': '_' },
        'backbone': {
            'deps': ['jquery', 'underscore'],
            'exports': 'Backbone'
        },
        'jquery-ui-touch-punch': {
            'deps': ['jquery-ui/mouse'],
            'exports': '$'
        },
        'jquery-ui-core': {
            'deps': ['jquery'],
            'exports': '$'
        },
        'jquery-ui-widget': {
            'deps': ['jquery-ui-core'],
            'exports': '$'
        },
        'jquery-ui-mouse': {
            'deps': ['jquery-ui-widget'],
            'exports': '$'
        },
        'jquery-ui-draggable': {
            'deps':['jquery-ui-widget', 'jquery-ui-mouse'],
            'exports': '$'
        },
        'jquery-ui-droppable': {
            'deps': [ 'jquery-ui-widget', 'jquery-ui-mouse', 'jquery-ui-draggable' ],
            'exports': '$'
        }
    },
    'paths': {
        'jquery': '../../bower_components/jquery/dist/jquery',
        'jquery-ui': '../../bower_components/jquery-ui/ui',
        'underscore': '../../bower_components/underscore/underscore',
        'backbone': '../../bower_components/backbone/backbone',

        'ExtendedModel': "../../bower_components/componentLibraryUtils/app/scripts/ExtendedBackboneModel",

        'jquery-ui-touch-punch': "../../bower_components/jqueryui-touch-punch/jquery.ui.touch-punch.min",
        'jquery-ui-core': "../../bower_components/jquery-ui/ui/jquery.ui.core",
        'jquery-ui-widget': "../../bower_components/jquery-ui/ui/jquery.ui.widget",
        'jquery-ui-mouse': "../../bower_components/jquery-ui/ui/jquery.ui.mouse",
        'jquery-ui-draggable': '../../bower_components/jquery-ui/ui/jquery.ui.draggable',
        'jquery-ui-droppable': '../../bower_components/jquery-ui/ui/jquery.ui.droppable',

        'ComponentSystem': "../../bower_components/componentSystem/componentSystem",
        'SceneManager': "../../bower_components/sceneManager/sceneManager",
        'ComponentLibrary': "../../bower_components/sceneManager/app/scripts/ComponentLibrary"
    }
});