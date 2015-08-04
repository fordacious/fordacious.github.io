/*globals requirejs, THREE*/
requirejs.config({
    'shim': {
        'jquery': {
            'exports': '$'
        },
        'jquery-ui': {
            'deps': ['jquery'],
            'exports': '$'
        },
        'underscore': {
            'exports': '_'
        },
        'backbone': {
            'deps': ['jquery', 'underscore'],
            'exports': 'Backbone'
        },
        'sinon': {
            'exports': 'sinon'
        },
        'threejs': {
            'deps': ['polyfill-typedarray'] ,
            'exports': 'THREE' ,
            'init': function(){
                return THREE;
            }
        }
    },
    'paths': {
        'text': '../../../bower_components/requirejs-text/text',
        'jquery': '../../../bower_components/jquery/dist/jquery',
        'jquery-ui': '../../../bower_components/jquery-ui/ui',
        'underscore': '../../../bower_components/underscore/underscore',
        'backbone': '../../../bower_components/backbone/backbone',

        'check': "../../../bower_components/check-js/check.min",
        'sinon': '../../../test/libs/sinon-1.7.3',

        'templates': "../templates",

        'renderers': "../../../bower_components/renderers/app/scripts",
        'componentLibraryUtils': "../../../bower_components/componentLibraryUtils/app/scripts",

        'sim-common': '../../../bower_components/common/app/scripts/sim-common',

        'componentLibrary3D': '../../../bower_components/componentLibrary3D/app/scripts',
        'componentLibraryTween': '../../../bower_components/componentLibraryTween/app/scripts',
        'commonComponents': '../../../bower_components/componentLibraryCommon/app/scripts',

        'ComponentSystem': "../../../bower_components/componentSystem/componentSystem",
        'SceneManager': "../../../bower_components/scene-manager/sceneManager",
        'ComponentLibrary': "../../../bower_components/scene-manager/app/scripts/ComponentLibrary",

        //Mocking paths for Simcapi
        'api/snapshot/Transporter': '../../../bower_components/pipit/app/scripts/api/snapshot/Transporter',
        'api/snapshot/Controller': '../../../bower_components/pipit/app/scripts/api/snapshot/Controller',
        'api/snapshot/SimCapiHandler': '../../../bower_components/pipit/app/scripts/api/snapshot/SimCapiHandler',
        'api/snapshot/SimCapiMessage': '../../../bower_components/pipit/app/scripts/api/snapshot/SimCapiMessage',
        'api/snapshot/SimCapiValue': '../../../bower_components/pipit/app/scripts/api/snapshot/SimCapiValue',
        'api/snapshot/util/uuid': '../../../bower_components/pipit/app/scripts/api/snapshot/util/uuid',

        'api/snapshot/adapters/BackboneAdapter': '../../../bower_components/pipit/app/scripts/api/snapshot/adapters/BackboneAdapter',
        'api/snapshot/adapters/CapiAdapter': '../../../bower_components/pipit/app/scripts/api/snapshot/adapters/CapiAdapter',

        'polyfill-typedarray': "../../../bower_components/polyfill/typedarray",
        'threejs': "../../../bower_components/threejs/build/three"
    }
});