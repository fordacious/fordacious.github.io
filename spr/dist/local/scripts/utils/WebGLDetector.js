/* globals window*/
define(function(require) {

    function wglAvailable () {
        try {
            var canvas = window.document.createElement( 'canvas' );
            return !!( window.WebGLRenderingContext && (
                canvas.getContext( 'webgl' ) ||
                canvas.getContext( 'experimental-webgl' ) )
            );
        } catch ( e ) {
            return false;
        }
        return false;
    }

    return {
        WebGLAvailable: wglAvailable
    };
});