/*globals document, setTimeout, window*/
define(function(require){

    var Createjs = require('preloadjs');
    var $ = require('jquery');

    var Circle = require('sim-common/loader/Circle');
    var PercentageText = require('sim-common/loader/PercentageText');

    //shim request animation frame with setTimeout fallback (for IE9)
    window.requestAnimationFrame = (function(){
        return (
            window.requestAnimationFrame       ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame    ||
            window.oRequestAnimationFrame      ||
            window.msRequestAnimationFrame     ||
            function( callback ){
                return window.setTimeout( callback , 1000 / 60 );
            }
        );
    })();

    //shim cancel animation frame with setTimeout fallback (for IE9)
    window.cancelAnimFrame = (function(){
        return (
            window.cancelAnimationFrame       ||
            window.webkitCancelAnimationFrame ||
            window.mozCancelAnimationFrame    ||
            window.oCancelAnimationFrame      ||
            window.msCancelAnimationFrame     ||
            window.clearTimeout
        );
    })();



    var circle;
    var percentageText;

    var loadingDiv;
    var requestId;

    var completedCallback;

    var currentPercentage = 0, targetPercentage = 0;

    var canvas, ctx;
    var hideText = false;

    var loader;

    var init = function(el, options){
        options = options || {};

        var canvasWidth = options.canvasWidth || "900";
        var canvasHeight = options.canvasHeight || "550";

        var width = Number(canvasWidth);
        var height = Number(canvasHeight);

        var widthBy2 = width/2;
        var heightBy2 = height/2;

        circle = new Circle(80, 30, 'black', {x:widthBy2, y:heightBy2});
        percentageText = new PercentageText(options.fontStyle || "14px Arial", {x:widthBy2, y:heightBy2, width: width, height:height});

        completedCallback = options.completedCallback;

        var element = document.querySelector(el);

        loadingDiv = document.createElement('div');
        loadingDiv.className = 'loader';

        canvas = document.createElement('canvas');
        canvas.style.position = "absolute";
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;

        loadingDiv.appendChild(canvas);

        element.appendChild(loadingDiv);

        ctx = canvas.getContext('2d');

        circle.setCanvasContext(ctx);
        percentageText.setCanvasContext(ctx);

        //options will config loader
        if(options.circleColor){ circle.color = options.circleColor; }
        if(options.textColor){ percentageText.color = options.textColor; }
        hideText = hideText || false;
    };

    var start = function(env, imagesManifest){
        window.requestAnimationFrame(animloop);

        imagesManifest = imagesManifest || {};

        preload(env, imagesManifest);
    };


    function preload(env, imagesManifest){
        $.get(env.assets + "manifest.csv", function(data) {

            if(data !== ""){
                var assetList = data.split(',');


                var manifest = [];

                var filterFunc = function(e){ return e; };

                for (var i =0 ; i  < assetList.length; i++) {

                    var loc;

                    if (assetList[i].split('/')[0] === 'app') {
                        //remove app/scripts
                        loc = assetList[i].split('/').filter(filterFunc).slice(2,assetList[i].split('/').length).join('/');

                    } else {

                        loc = assetList[i].split('/').filter(filterFunc).slice(3,assetList[i].split('/').length).join('/');

                    }

                    loc = env.assets + loc;

                    manifest.push({
                        src:loc
                    });
                }

                var numLoaded   = 0;
                var numRequired = assetList.length;

                loader = new Createjs.LoadQueue(false);
                loader.addEventListener("fileload", function(e) {
                    numLoaded += 1;
                    //console.log('loaded ' + e.item.src);

                    //HACK: adding everything to images even if not image.
                    if(imagesManifest[e.item.id]){
                        window.images[env.assets + imagesManifest[e.item.id]] = e.result;
                    }
                    //to work with local build
                    else if(imagesManifest[e.item.id.replace(env.assets, '')]){
                        window.images[imagesManifest[e.item.id.replace(env.assets, '')]] = e.result;
                    }

                    targetPercentage = (numLoaded/numRequired * 100);

                });

                loader.addEventListener("error",  function(e) {
                    //Should do something
                });

                loader.addEventListener("complete", function () {
                    //completed();
                });
                loader.loadManifest(manifest);
                loader.load();
            }
            else{
                completed();
            }

        }, 'text');
    }

    var completed = function(){
        window.cancelAnimFrame(requestId);
        requestId = undefined;

        setTimeout(function(){
            loadingDiv.style.display = "none";
            completedCallback();
        }, 1000);
    };

    function animloop(){
        requestId = window.requestAnimationFrame(animloop);

        currentPercentage += 2;
        if(currentPercentage > targetPercentage){
            currentPercentage = targetPercentage;
        }

        ctx.clearRect(0,0, canvas.width, canvas.height);

        if(!hideText){
            percentageText.update(currentPercentage);
        }
        circle.update(currentPercentage);

        if(currentPercentage === 100){
            completed();
        }
    }

    function getResult(id){
        return loader.getResult(id);
    }

    return {
        init: init,
        start: start,
        getResult: getResult
    };

});