/*global requirejs*/
requirejs.config({
    'shim': {
        'jquery': {
            'exports': '$'
        },
        'sinon': {
            'exports' : 'sinon'
        }
    },
    'paths': {
        'sinon': "../../test/libs/sinon-1.4.2",
        'jquery': '../../bower_components/jquery/dist/jquery',
        'ComponentSystem': '../../bower_components/componentSystem/componentSystem'
    }
});
