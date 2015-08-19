/*globals document, setTimeout */
define (function(require){

    //behavioural params 
    var colours = [
            [230,150, 50],  //orange
            [100,30,170],   //purple
            [40,120,210],   //blue
            [130,240,210],  //cyan
            [220,50,50]     //red
        ],
        segmentCount    = 6,
        radius          = 20,
        speed           = 0.7;

    //runtime variables
    var paused          = false,
        finishing       = false,
        g               = null,
        invert          = false,
        progress        = 0,
        easedProgress   = 0,
        colour          = [],
        el;


    function init(){
        el = document.createElement('div');
        el.style.width = el.style.height = (radius * 2) + 'px';
        el.style.top = el.style.left = '50%';
        el.style.marginLeft = el.style.marginTop = (-radius) + 'px';
        el.style.position = 'fixed';

        document.body.appendChild(el);
        el.appendChild(createSVGEl());

        g = el.getElementsByTagName('g')[0];

        colour = getRandomColour();
        progress = getInitialProgress();

        tick();
    }


    function tick() {
        if (paused) { return; }
        if (finishing) {

            if (progress > 1 && invert) {
                //complete unfold so it can crumple properly
                progress = getInitialProgress();
                invert = !invert;
            } else if (progress > 1) {
                //ensure we always finish on 1 (completely unfolded)
                progress = 1;
            } else if (progress === 1) {
                //play crumple
                crumple();
                paused = true;
                return;
            } else {
                //wrap up the animation quickly
                progress += (0.02 * speed);
            }

        } else {
            progress += (0.007 * speed);

            if (progress > 1) {
                progress = getInitialProgress();
                invert = !invert;
                if (!invert) {
                    colour = getRandomColour();
                }
            }
        }

        drawSegments(g, progress, invert);

        setTimeout(tick, 10);
    }


    /**
        the first fold starts halfway through it's animation, so 
        progress doesn't actually begin at 0 
    **/
    function getInitialProgress() {
        return 1 / segmentCount / 2;
    }


    function getRandomColour() {
        return colours[Math.floor(Math.random() * colours.length)];
    }


    function createSVGEl() {
        var svg = document.createElementNS('https://www.w3.org/2000/svg','svg');
        svg.setAttribute('version', '1.1');

        var g = document.createElementNS('https://www.w3.org/2000/svg','g');
        g.setAttribute('id', 'svgGroup');
        g.setAttribute('stroke', 'none');
        g.setAttribute('stroke-width', '0');
        svg.appendChild(g);

        return svg;
    }


    function drawSegments(el, progress, invert) {
        drawStaticSegments(el, Math.floor(progress * segmentCount), segmentCount, invert, colour);
        drawAnimatingSegment(el, progress, Math.floor(progress * segmentCount), invert, colour);
    }


    var animatingPath;
    function drawAnimatingSegment(el, progress, index, invert, colour) {
        if (!animatingPath) {
            animatingPath = document.createElementNS('https://www.w3.org/2000/svg','path');
        }

        var prevPct = (index - 1) / segmentCount;
        var currPct = index / segmentCount;
        var nextPct = (index + 1) / segmentCount;
        var pctDarken = 0;
        var maxDarkness = 0.4;
        var ease = invert ? easeOutQuad : easeInQuad;

        //tween the nextPct (fold)
        nextPct = ease(
                progress - currPct,     // relative progress
                prevPct,                // starting value
                nextPct - prevPct,      // change value 
                nextPct - currPct       // totalprogress
            );

        if (nextPct < currPct) {
            pctDarken = ((nextPct - prevPct) * segmentCount);
        } else {
            pctDarken = 1 - ((nextPct - currPct) * segmentCount);
        }

        var d = 'M ' + radius + ' ' + radius +
                        getArc(
                            currPct * 360,
                            nextPct * 360,
                            radius);

        animatingPath.setAttribute('d', d);

        //var newBlue = Math.round(255 - (255 - (255 * maxDarkness)) * pctDarken);
        //animatingPath.setAttribute('fill', 'rgb(0,0,' + newBlue + ')');
        animatingPath.setAttribute('fill', rgbDarken(colour[0],colour[1],colour[2], (1 - maxDarkness) * pctDarken));
        el.appendChild(animatingPath);
    }


    var staticPath;
    function drawStaticSegments(el, segments, totalSegments, invert, colour) {
        if (!staticPath) {
            staticPath = document.createElementNS('https://www.w3.org/2000/svg','path');
        }

        var d = 'M ' + radius + ' ' + radius;

        var i = invert ? segments : 0;
        var max = invert ? totalSegments : segments;

        while (i < max) {
            d += getArc(
                    i / totalSegments * 360,
                    (i + 1) / totalSegments * 360,
                    radius);
            i++;
        }

        staticPath.setAttribute('d', d);
        staticPath.setAttribute('fill', 'rgb('+colour[0]+','+colour[1]+','+colour[2]+')');
        el.appendChild(staticPath);
    }


    function getArc(degStart, degEnd, radius) {
        return    ' L ' + getPoint(-degStart, radius, radius, radius) +
                        ' L ' + getPoint(-degEnd, radius, radius, radius);
    }


    function getPoint(degrees, radius, offsetX, offsetY) {
        return (offsetX - Math.sin(toRad(degrees)) * radius) + ' ' + (offsetY - Math.cos(toRad(degrees)) * radius);
    }


    function toRad(deg) {
        return deg * Math.PI / 180;
    }

    function rgbDarken(r,g,b,blackness) {
        return 'rgb(' +
            Math.round(r - r * blackness) + ',' +
            Math.round(g - g * blackness) + ',' +
            Math.round(b - b * blackness) + ')';
    }

    function hexToRgb(hex) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }


    /**
        https://github.com/danro/jquery-easing/blob/master/jquery.easing.js
        t: current time, b: begInnIng value, c: change In value, d: duration
    **/
    function easeInQuad(t, b, c, d) {
        return c*(t/=d)*t + b;
    }


    /**
        https://github.com/danro/jquery-easing/blob/master/jquery.easing.js
        t: current time, b: begInnIng value, c: change In value, d: duration
    **/
    function easeOutQuad(t, b, c, d) {
        return -c *(t/=d)*(t-2) + b;
    }


    var animTemplate =
        '<svg>' +
        '  <g id="crumple0">' +
        '    <polyline style="fill:#7A7B7B;" points="-1.278,-0.576 12.74,27.652 15.619,2.465 -1.278,-0.576   "/>' +
        '    <polyline style="fill:#969696;" points="0,0 13.431,27.997 -17.4,28.497  "/>' +
        '    <polygon style="fill:#FFFFFF;" points="2.642,-20.265 26.561,-11.67 13.431,2.465 -0.355,0.162  "/>' +
        '    <polyline style="fill:#D8D8D8;" points="28.176,-13.337 28.843,11.58 13.103,26.33 13.431,2.465 26.561,-11.67   "/>' +
        '    <polyline style="fill:#D8D8D8;" points="2.642,-20.265 -25.462,-17.193 -1.278,0.062 0.271,0.447 2.642,-20.265  "/>' +
        '    <polygon style="fill:#FFFFFF;" points="-38.824,2.465 -0.43,0.008 -25.462,-17.193  "/>' +
        '    <polyline style="fill:#7A7B7B;" points="0.472,-1.312 -32.824,-0.375 -32.824,-0.375 -14.491,25.497 0.271,0.447     "/>' +
        '  </g>' +
        '  <g id="crumple1">' +
        '    <polyline style="fill:#7A7B7B;" points="0,0 0.707,19.456 9.987,7.906 0.022,-0.946   "/>' +
        '    <polyline style="fill:#7A7B7B;" points="1.48,-0.727 -16.424,-10.98 -16.424,-10.98 -19.284,10.982 0.634,0.357  "/>' +
        '    <polyline style="fill:#969696;" points="0.707,-0.346 0.707,21.744 -19.284,10.982  "/>' +
        '    <polygon style="fill:#FFFFFF;" points="10.587,-12.406 18.575,4.2 8.537,7.021 0.335,-0.085   "/>' +
        '    <polyline style="fill:#D8D8D8;" points="18.575,4.2 12.325,16.952 0.707,19.456 8.537,7.021 16.45,4.411   "/>' +
        '    <polyline style="fill:#D8D8D8;" points="8.575,-10.298 -7.79,-18.251 -0.236,-0.524 0.634,0.357 10.587,-12.406  "/>' +
        '    <polygon style="fill:#FFFFFF;" points="-16.424,-10.98 0.348,-0.217 -9.278,-21.744   "/>' +
        '  </g>' +
        '  <g id="crumple2">' +
        '    <polyline style="fill:#7A7B7B;" points="0,0 -5.565,10.779 6.011,10.377 0.31,-1.379  "/>' +
        '    <polyline style="fill:#7A7B7B;" points="1.475,-0.476 -6.274,-13.942 -7.398,-12.328 -13.475,-0.584 0.207,0.057   "/>' +
        '    <polyline style="fill:#969696;" points="-0.122,-0.375 -5.565,10.779 -13.475,-0.584  "/>' +
        '    <polygon style="fill:#FFFFFF;" points="5.69,-2.251 7.559,13.248 0.163,-0.475 0.163,-0.475   "/>' +
        '    <path style="fill:#D8D8D8;" d="M13.99,12.168"/>' +
        '    <line style="fill:#D8D8D8;" x1="-5.565" y1="10.779" x2="-5.565" y2="10.779"/>' +
        '    <polyline style="fill:#D8D8D8;" points="5.69,-2.251 1.475,-14.377 -0.122,-1.137 0.207,0.057 5.69,-2.251   "/>' +
        '    <polygon style="fill:#FFFFFF;" points="-11.274,-13.942 0.237,-0.584 1.768,-17.648   "/>' +
        '  </g>' +
        '  <g id="crumple3">' +
        '    <polyline style="fill:#7A7B7B;" points="0,0 -5.387,-0.137 -1.393,2.34 0.624,-0.323  "/>' +
        '    <polyline style="fill:#7A7B7B;" points="0.596,2.34 0.989,-1.51 2.757,-6.303 -5.532,-6.13 -0.23,1.777  "/>' +
        '    <polyline style="fill:#969696;" points="-0.122,-0.28 -5.387,0.272 -5.532,-6.13  "/>' +
        '    <polygon style="fill:#FFFFFF;" points="3.345,2.465 -1.393,2.34 0.052,-0.148 0.052,-0.148  "/>' +
        '    <polyline style="fill:#D8D8D8;" points="3.345,2.465 5.288,-2.141 0.308,-0.498 -0.23,0.029 2.423,1.837   "/>' +
        '    <polygon style="fill:#FFFFFF;" points="2.757,-6.303 0.145,-0.137 5.288,-2.141   "/>' +
        '  </g>' +
        '</svg>';


    function crumple() {

        el.innerHTML = animTemplate;

        var frameIndex = 0;
        var frames = 4;

        function draw(){
            for (var i=0; i < frames; i++) {
                var frame = document.getElementById('crumple'+ i);
                if (i === frameIndex + 1 ) {
                    frame.style.display = 'block';
                    frame.setAttribute('transform','translate('+ radius +',' + radius+ ')');

                    var paths = frame.childNodes;
                    for (var j in paths) {
                        if (paths[j].style) {
                            var darkness = getDarknessValFromFill(paths[j].style.fill);
                            paths[j].style.fill = rgbDarken(colour[0],colour[1],colour[2],darkness);
                        }
                    }
                } else {
                    frame.style.display = 'none';
                }
            }

            frameIndex++;

            if (frameIndex <= frames) {
                setTimeout(draw, 80);
            } else {
                remove();
            }
        }

        draw();
    }


    function getDarknessValFromFill(fillString) {
        var darknessVal = 0;
        var red = 255;

        if (fillString) {
            if (fillString.indexOf('#') > -1) {
                red = hexToRgb(fillString).r;
            } else {
                red = fillString.substring(fillString.indexOf('rgb(') + 4, fillString.indexOf(','));
            }
            darknessVal = (255 - red) / 255 / 3;
        }
        return darknessVal;
    }


    var endCallback;
    /**
        @callback is called when the final animation is finished and the dom element has been removed
    **/
    function end(callback) {
        endCallback = callback;
        finishing = true;
    }

    /**
        @colourArray array of colour arrays: [r,g,b]
    **/
    function setColours(colourArray) {
        colours = colourArray;
        colour = getRandomColour();
    }

    function remove() {
        el.parentNode.removeChild(el);
        if (endCallback) {
            endCallback();
        }
    }

    return {
        play:       init,
        end:        end,
        setColours: setColours,
        remove:     remove
    };
});