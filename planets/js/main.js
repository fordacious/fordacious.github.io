window.onload = start;

/*
IDEAS:
Enemy that shoots normal projectiles (shotgun?)
Enemy that shoots homing projectiles
Enemy that shoots laser
Enemy that shoots gravity projectile
Enemy shots have rhythm, sound effect and particles. Should have line of sight testing
Mines that start chasing you extremely quickly if you go near them
Bounds.
Rectangular gravity boxes
One way doors
Black / white holes 
Triggers and scripting
Shell theorem level (trigger to explode planet to create opening?)
Level progression
Something that makes you zoom out and feel awe
Sound and music (Voyager?)
Moon orbits (inherit gravity from orbit target, implies recursive gravity calc)
Timing puzzles (planet kill on contact toggles?)
Sequential collectables.
Phone controls. Gamepad controls.
More fractals and background variety. 
Collectable patterns are constellations (megi idea)
Light rays https://github.com/Silverwolf90/2d-visibility/blob/master/src/visibility.js
Planet collisions, enemy collisions etc...
Planets that can change mass? Breathing planets? (two either side that expand and contract in an alternating manner)
Find someway to leverage the awe of zooming out and seeing the fractal
    Quiet time
    More backgrounds!
    (Awe-ful game lol)
    Breathing time spent zooming out and basking in the fractal awe
        Maybe end of each "chapter" has a section like this
            Black hole you get orbit and get sucked into
    Should make a different game about exploring fractal
Death zones (horizontal, virtical, diagonal)
    This limits space and movement. Since this game is about movement and flow, adding more constraints on movement is interesting.
Title / text should be in-engine particles or similar
Nuno found dodging and weaving more fun than getting the collectables. (Mse too somewhat). Lean into this
Alternate controls
    Accelerate towards mouse (can be a simple onclick)
    Rotate view tank controls

Simple sounds to create a dynamic soundscape to complement the flowing visuals and gameplay
    Try to have no assets (voyager?). Would be an interesting challenge

Map where you have to control things homing in on you / orbiting you to take them somewhere or hit something else
    Maybe there is a destructable object blocking where you need to go? Or another enemy?

Opening. Text title, fade it, player orbiting planet, gain control, music kicks in (Voyager), more planets and collectables appear, this is the tutorial,
get a sense of controls and how to move, once collected all things around planet it explodes, once collected all collectables warp to next level opens up.  

Level end - black hole appears - hyperspace effect with background shader

Better player visbility, less particle obscuring / framerate drops (esp with music), better color design

Thing that swaps gravity for the player (player becomes red?)

Black and white version... opposites... attraction etc...

Game is about circles overlapping and interacting in interesting ways, harmony, flows etc...

Level where you dont control player, you control gravity of object to get it towards a goal / collectabless

Make sound design entirely sine ways and cyclical things. Remove voyagers. Start intro with beat timed to player orbit and tone based on current gravity, speed and position

Now that we have a barrier, it is meaningful when we remove it :)

Then XR architecture + Hand interaction game. (Playable on desktop and mobile too). That or PD / DE style fps? Use webXR (aframe, 3js) or existing engine (vrchat?)
    Explore fractal?

Give planets trails?

Distance field gravity rendering?

https://en.wikipedia.org/wiki/Three-body_problem#/media/File:5_4_800_36_downscaled.gif
http://three-body.ipb.ac.rs/
https://observablehq.com/@rreusser/periodic-planar-three-body-orbits
https://www.youtube.com/watch?v=9U6J_D0LphA

Is it possible to implement a lorenz attractor? Do we need more than gravity? Differentiate to get accelration based on position and place static planets there?

*/

const USE_TANK_CONTROLS = false;

let canvas = null;
let context = null;
let webglcanvas = null;
let gl = null;
let program = null;
let shaderResourcesInitialized = false;
let fieldValuesTexture = null;
let fieldValues = null;

let state = null;

const frameTime = 1000 / 60;

const canvasDesignWidth = 640;

// Num points in the field (square grid of points)
// so numFields x numFields
const numFields = 60;
//const numFields = 120;

let renderWarping = false;

// Set up shaders
// Most basic vertex shader
// Were just rendering a quad to show a fragment shader
const vertexShaderSource = `
    attribute vec2 position;
    void main() {
        gl_Position = vec4(position, 0.0, 1.0);
    }`;

const fragmentShaderSource = `
    // Set float precision
    precision highp float;

    // Uniform for camera coordinates
    uniform vec2 cameraPosition;
    uniform float cameraScale;

    uniform float iTime;

    uniform float seed;

    // Field
    uniform vec2 fieldStartPosition;
    uniform vec2 fieldEndPosition;
    // Field values as texture
    uniform sampler2D fieldValues;

    //CBS
    //Parallax scrolling fractal galaxy.
    //Inspired by JoshP's Simplicity shader: https://www.shadertoy.com/view/lslGWr

    // http://www.fractalforums.com/new-theories-and-research/very-simple-formula-for-fractal-patterns/
    float field(in vec3 p,float s, float time) {
        float strength = 7. + .03 * log(1.e-6 + fract(sin(time) * 4373.11));
        float accum = s/4.;
        float prev = 0.;
        float tw = 0.;
        for (int i = 0; i < 26; ++i) {
            float mag = dot(p, p);
            p = abs(p) / mag + vec3(-.5, -.4, -1.5);
            float w = exp(-float(i) / 7.);
            accum += w * exp(-strength * pow(abs(mag - prev), 2.2));
            tw += w;
            prev = mag;
        }
        return max(0., 5. * accum / tw - .7);
    }

    // Less iterations for second layer
    float field2(in vec3 p, float s, float time) {
        float strength = 7. + .03 * log(1.e-6 + fract(sin(time) * 4373.11));
        float accum = s/4.;
        float prev = 0.;
        float tw = 0.;
        for (int i = 0; i < 18; ++i) {
            float mag = dot(p, p);
            p = abs(p) / mag + vec3(-.5, -.4, -1.5);
            float w = exp(-float(i) / 7.);
            accum += w * exp(-strength * pow(abs(mag - prev), 2.2));
            tw += w;
            prev = mag;
        }
        return max(0., 5. * accum / tw - .7);
    }

    vec3 nrand3( vec2 co )
    {
        vec3 a = fract( cos( co.x*8.3e-3 + co.y )*vec3(1.3e5, 4.7e5, 2.9e5) );
        vec3 b = fract( sin( co.x*0.3e-3 + co.y )*vec3(8.1e5, 1.0e5, 0.1e5) );
        vec3 c = mix(a, b, 0.5);
        return c;
    }

    void main() {
        //float iTime = iTime / 100000.;

        float oldiTime = iTime / 10000.;
        float iTime = iTime / 1000.;
        //float iTime = 0.;

        // TODO pass in
        vec2 iResolution = vec2(1280.0, 960.0);
        vec2 fragCoord = gl_FragCoord.xy;

        vec2 uv = 2. * fragCoord.xy / iResolution.xy - 1.;
        vec2 uvs = uv * iResolution.xy / max(iResolution.x, iResolution.y);
        vec2 uvsold = uvs;

        uvs *= cameraScale / (5. * (iResolution.x / iResolution.y));

        vec3 p = vec3(uvs / 4., 0) + vec3(1., -1.3, iTime / 2500.0);
        //p += .2 * vec3(sin(iTime / 16.), sin(iTime / 12.),  sin(iTime / 128.));
        vec3 p2 = vec3(uvs / (4.+0.2+0.4), 1.5) + vec3(2., -1.3, -1. + iTime / 5000.0);
        //p2 += 0.25 * vec3(sin(iTime / 16.), sin(iTime / 12.),  sin(iTime / 128.));

        // modify p and p2 based on camera position

        float cameraFactor = 100000.;
        vec2 cameraPosition = cameraPosition;
        cameraPosition.y *= -1.;

        p.xy += (cameraPosition / cameraFactor)  / 0.5;
        p2.xy += (cameraPosition / cameraFactor) / 2.;

        float freqs[4];
        //Sound
        freqs[0] = 0.; // texture( iChannel0, vec2( 0.01, 0.25 ) ).x;
        freqs[1] = 0.; // texture( iChannel0, vec2( 0.07, 0.25 ) ).x;
        freqs[2] = 0.; // texture( iChannel0, vec2( 0.15, 0.25 ) ).x;
        freqs[3] = 0.; // texture( iChannel0, vec2( 0.30, 0.25 ) ).x;

        p.z += seed;
        p2.z += seed;

        // sample field values at uvs
        vec2 fieldCoords = uvs;
        //fieldCoords *= cameraScale / 6.66666666;
        //fieldCoords.y += 0.5;

        //fieldCoords.xy = fieldCoords.yx;
        fieldCoords += (cameraPosition.xy / cameraFactor) * 23.5;
        fieldCoords += vec2(0.5, 0.5);

        fieldCoords.y = 1. - fieldCoords.y;
        vec4 fieldValuesTex = texture2D(fieldValues, fieldCoords);

        vec2 offset = (fieldValuesTex.xy - 0.5) * 0.125;
        vec2 offset2 = (fieldValuesTex.xy - 0.5) * 0.125;

        p.xy += offset;
        p2.xy += offset2;

        float t = field(p,freqs[2], seed);
        float v = (1. - exp((abs(uv.x) - 1.) * 6.)) * (1. - exp((abs(uv.y) - 1.) * 6.));
        
        //Second Layer
        float t2 = field2(p2,freqs[3], seed);
        float g = 1.8 * t2 * t2 * t2;
        float b = 1.2  * t2 * t2;
        float r = t2* freqs[0];
        float a = t2;
        vec4 c2 = mix(.4, 1., v) * vec4(r, g, b, a);
        
        //Let's add some stars
        //Thanks to http://glsl.heroku.com/e#6904.0
        vec2 seed = p.xy * 2.0; 
        seed = floor(seed * iResolution.x);
        vec3 rnd = nrand3( seed );
        vec4 starcolor = vec4(pow(rnd.y,40.0));
        
        //Second Layer
        vec2 seed2 = p2.xy * 2.0;
        seed2 = floor(seed2 * iResolution.x);
        vec3 rnd2 = nrand3( seed2 );
        starcolor += vec4(pow(rnd2.y,40.0));

        gl_FragColor = vec4(0., 0., 0., 1.0);
        //gl_FragColor += c2+starcolor + fieldValuesTex / 2.;
        gl_FragColor += c2+starcolor;
        //gl_FragColor = starcolor;

        //gl_FragColor = vec4(offset.x, offset.y, 0., 1.);

        //gl_FragColor.rg = ((fieldValuesTex.xy - 128.) / 128.) * 10.;
    }`;

function initShaders() {
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexShaderSource);
    gl.compileShader(vertexShader);
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        console.error("Error compiling vertex shader", gl.getShaderInfoLog(vertexShader));
        return;
    }

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentShaderSource);
    gl.compileShader(fragmentShader);
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        console.error("Error compiling fragment shader", gl.getShaderInfoLog(fragmentShader));
        return;
    }

    program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);
}

function renderShaders(state) {
    // Draw a quad covering the canvas that we can render our fragment shader to
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        -1, -1,
        1, -1,
        -1, 1,
        -1, 1,
        1, -1,
        1, 1
    ]), gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    // Set camera position and size uniforms
    //state.camera.x = 0;
    //state.camera.y = 0;
    //state.camera.scale = 5;
    //state.camera.scale = state.player.x / 100 + 1;
    const cameraPositionLocation = gl.getUniformLocation(program, "cameraPosition");
    gl.uniform2f(cameraPositionLocation, state.camera.x, state.camera.y);
    const cameraScaleLocation = gl.getUniformLocation(program, "cameraScale");
    gl.uniform1f(cameraScaleLocation, state.camera.scale);

    // random seed for aesthetics control
    const seedLocation = gl.getUniformLocation(program, "seed");
    gl.uniform1f(seedLocation, state.seed);

    // set time uniform
    const timeLocation = gl.getUniformLocation(program, "iTime");
    gl.uniform1f(timeLocation, state.timestamp);

    // Upload field values
    // Field start
    const fieldStartPositionLocation = gl.getUniformLocation(program, "fieldStartPosition");
    gl.uniform2f(fieldStartPositionLocation, state.field[0].x, state.field[0].y);
    // Field end
    const fieldEndPositionLocation = gl.getUniformLocation(program, "fieldEndPosition");
    gl.uniform2f(fieldEndPositionLocation, state.field[state.field.length - 1].x, state.field[state.field.length - 1].y);
    // Field values
    if (!shaderResourcesInitialized) {
        // Create a numFields x numFields texture to store the field values
        fieldValuesTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, fieldValuesTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, numFields, numFields, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        // Set texture parameters
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        shaderResourcesInitialized = true;
    }

    function toInt(float) {
        return Math.floor(float * 255);
    }

    let max = 0;
    let min = 1000;
    // Set field values
    fieldValues = new Uint8Array(numFields * numFields * 4);
    for (let i = 0; i < numFields; ++i) {
        for (let j = 0; j < numFields; ++j) {
            let index = i * numFields + j;
            let field = state.field[index];
            fieldValues[index * 4] = renderWarping ?
                Math.floor(Math.min(Math.max(-128, (field.acceleration.x * 50)), 128) + 128)
                : 128;
            fieldValues[index * 4 + 1] = renderWarping ?
                Math.floor(Math.min(Math.max(-128, (field.acceleration.y * 50)), 128) + 128)
                : 128;
            fieldValues[index * 4 + 2] = 0;
            fieldValues[index * 4 + 3] = 255;
            //console.log(field.acceleration.x);
            if (fieldValues[index * 4] > max) {
                max = fieldValues[index * 4];
            }
            if (fieldValues[index * 4] < min) {
                min = fieldValues[index * 4];
            }
            if (fieldValues[index * 4] > 160 || fieldValues[index * 4] < 100) {
                //console.log(fieldValues[i * 4]);
            }
        }
    }
    //console.log(max);
    //console.log(min);
    gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, numFields, numFields, gl.RGBA, gl.UNSIGNED_BYTE, fieldValues);

    const fieldValuesLocation = gl.getUniformLocation(program, "fieldValues");
    gl.uniform1i(fieldValuesLocation, 0);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
}

function dist(point1, point2) {
    return Math.sqrt(Math.pow(point1.x - point2.x, 2) + Math.pow(point1.y - point2.y, 2));
}

function mag(vector) {
    return Math.sqrt(Math.pow(vector.x, 2) + Math.pow(vector.y, 2));
}

// Convert camera coordinates to world coordinates with scale
function cameraToWorld(x, y) {
    return {x: (x - state.camera.width / 2) * state.camera.scale + state.camera.x,
            y: (y - state.camera.height / 2) * state.camera.scale + state.camera.y};
}

// Convert world coordinates to camera coordinates with scale
// TODO angle doesn't work
function worldToCamera(x, y, angle = 0) {
    if (angle == 0) {
        return {x: (x - state.camera.x) / state.camera.scale + state.camera.width / 2,
                y: (y - state.camera.y) / state.camera.scale + state.camera.height / 2};
    }

    let camera = {x: state.camera.x, y: state.camera.y};
    let cosAngle = Math.cos(-angle);
    let sinAngle = Math.sin(-angle);
    let tempX = x - camera.x;
    let tempY = y - camera.y;
    camera.x = tempX * cosAngle - tempY * sinAngle + state.camera.width / 2;
    camera.y = tempX * sinAngle + tempY * cosAngle + state.camera.height / 2;

    return camera;
}

function makeEntity(props) {
    const entity = {
        entityType: "entity",
        exists: true,
        x: 0,
        y: 0,
        velocity: {x:0, y:0},
        acceleration: {x:0, y:0},
        radius: 10,
        mass: 10,
        update: null,
        renderState: null,
    };
    for (const [key, value] of Object.entries(props)) {
        entity[key] = value;
    }
    return entity;
}

const cameraZoomEaseFactor = 0.1;

const map_singleton = {
    seed: -0.5,
    name: "map_singleton",
    player: {entityType: "player", x: 0, y: -400, radius: 10, mass: 1, velocity: {x:-3, y: 0}, color: "#00ffff"},
    camera: {x: 1, y: 1, width: "CANVAS_WIDTH", height: "CANVAS_HEIGHT", scale: 4, targetScale: 1, easeFactor: 0.1, zoomEaseFactor: cameraZoomEaseFactor, easeMode: "quadtratic"},
    planets: [{
        entityType: "planet",
        x: 0,
        y: 0,
        radius: 100,
        mass: 5000,
        velocity: {x: 0, y: 0},
        color: "#ffaa00",
    }]
};

const map_dao = {
    seed: 0.5,
    name: "map_dao",
    player: {entityType: "player", x: 0, y: -900, radius: 10, mass: 1, velocity: {x:0, y: 0}, color: "#00ffff"},
    camera: {x: 1, y: 1, width: "CANVAS_WIDTH", height: "CANVAS_HEIGHT", scale: 4, targetScale: 1, easeFactor: 0.1, zoomEaseFactor: cameraZoomEaseFactor, easeMode: "quadtratic"},
    planets: [{
        entityType: "planet",
        x: 0,
        y: -250,
        radius: 100,
        mass: 5000,
        orbit: 1,
        velocity: {x: 2.5, y: 0},
        color: "RANDOM",
    },
    {
        entityType: "planet",
        x: 0,
        y: 250,
        radius: 100,
        mass: 5000,
        orbit: 0,
        velocity: {x: -2.5, y: 0},
        color: "RANDOM",
    }]
};

const map_threebody = {
    seed: 0.2,
    name: "map_threebody",
    player: {entityType: "player", x: 0, y: -1300, radius: 10, mass: 1, velocity: {x:0, y: 0}, color: "#00ffff"},
    camera: {x: 1, y: 1, width: "CANVAS_WIDTH", height: "CANVAS_HEIGHT", scale: 4, targetScale: 1, easeFactor: 0.1, zoomEaseFactor: cameraZoomEaseFactor, easeMode: "quadtratic"},
    planets: [{
        entityType: "planet",
        x: 0,
        y: -250,
        radius: 100,
        mass: 5000,
        orbit: 1,
        velocity: {x: 2.5, y: 0},
        color: "RANDOM",
    },
    {
        entityType: "planet",
        x: 0,
        y: 250,
        radius: 100,
        mass: 5000,
        orbit: 0,
        velocity: {x: -2.5, y: 0},
        color: "RANDOM",
    },
    {
        entityType: "planet",
        x: 0,
        y: -1000,
        radius: 100,
        mass: 5000,
        velocity: {x: -3.5, y: 0},
        color: "RANDOM",
    }]
};

const map_level = {
    seed: 0,
    name: "map_level",
    player: {entityType: "player", x: 0, y: -2000, radius: 10, mass: 1, velocity: {x:0, y: 0}, color: "#00ffff"},
    camera: {x: 1, y: 1, width: "CANVAS_WIDTH", height: "CANVAS_HEIGHT", scale: 4, targetScale: 1, easeFactor: 0.1, zoomEaseFactor: cameraZoomEaseFactor, easeMode: "quadtratic"},
    planets: [{
        entityType: "planet",
        x: 0,
        y: 0,
        radius: 100,
        mass: 10000,
        orbit: -1,
        velocity: {x: 0, y: 0},
        color: "#ffaa00",
    },
    {
        entityType: "planet",
        x: 0,
        y: -1000,
        radius: 100,
        mass: 5000,
        velocity: {x: -3.5, y: 0},
        color: "#aacc88",
    }],
    collectables: [{
        entityType: "collectable",
        x: 0,
        y: 500,
        radius: 20,
        mass: 1,
        orbit: -1,
        velocity: {x: 0, y: 0},
        color: "#ffff00",
    },
    {
        entityType: "collectable",
        x: -150,
        y: 0,
        radius: 20,
        mass: 1,
        orbit: -1,
        velocity: {x: 0, y: 0},
        color: "#ffff00",
    },
    {
        entityType: "collectable",
        x: 300,
        y: 0,
        radius: 20,
        mass: 1,
        orbit: -1,
        velocity: {x: 0, y: 0},
        color: "#ffff00",
    },
    {
        entityType: "collectable",
        x: 0,
        y: -300,
        radius: 20,
        mass: 1,
        orbit: -1,
        velocity: {x: 0, y: 0},
        color: "#ffff00",
    },
    {
        entityType: "collectable",
        x: 0,
        y: -1300,
        radius: 20,
        mass: 1,
        velocity: {x: 0, y: 0},
        color: "#ffff00",
    }],
};

const map_inverse_mass_test = {
    seed: -0.2,
    name: "map_inverse_mass_test",
    player: {entityType: "player", x: 0, y: 0, radius: 10, mass: 1, velocity: {x:0, y: 0}, color: "#00ffff"},
    camera: {x: 1, y: 1, width: "CANVAS_WIDTH", height: "CANVAS_HEIGHT", scale: 4, targetScale: 1, easeFactor: 0.1, zoomEaseFactor: cameraZoomEaseFactor, easeMode: "quadtratic"},
    planets: [{
        entityType: "planet",
        x: 0,
        y: -500,
        radius: 100,
        mass: -1000,
        velocity: {x:0, y: 0},
        color: "RANDOM",
    },
    {
        entityType: "planet",
        x: 0,
        y: 500,
        radius: 100,
        mass: -1000,
        velocity: {x: 0, y: 0},
        color: "RANDOM",
    },
    {
        entityType: "planet",
        x: 0,
        y: -2000,
        radius: 100,
        mass: -50000,
        orbit: -1,
        velocity: {x: 0, y: 0},
        color: "RANDOM",
    },
    {
        entityType: "planet",
        x: 0,
        y: 2000,
        radius: 100,
        mass: -50000,
        orbit: -1,
        velocity: {x: 0, y: 0},
        color: "RANDOM",
    },
    {
        entityType: "planet",
        x: -2000,
        y: 0,
        radius: 100,
        mass: -50000,
        orbit: -1,
        velocity: {x: 0, y: 0},
        color: "RANDOM",
    },
    {
        entityType: "planet",
        x: 2000,
        y: 0,
        radius: 100,
        mass: -50000,
        orbit: -1,
        velocity: {x: 0, y: 0},
        color: "RANDOM",
    }]
};

// TODO large death sun that kills on contact with many orbiting planets with many moons
// TODO how to make orbits work properly?
    // Probably need to leash the planets together
// TODO probably need planet collision

const map_large = {
    seed: 0.2,
    name: "map_large",
    player: {entityType: "player", x: 0, y: -2000, radius: 10, mass: 1, velocity: {x:-7, y: 0}, color: "#00ffff"},
    camera: {x: 1, y: 1, width: "CANVAS_WIDTH", height: "CANVAS_HEIGHT", scale: 4, targetScale: 1, easeFactor: 0.1, zoomEaseFactor: cameraZoomEaseFactor, easeMode: "quadtratic"},
    planets: [{
        entityType: "planet",
        x: 0,
        y: 0,
        orbit: -1,
        radius: 500,
        mass: 250000,
        killOnContact: true,
        glow: true,
        velocity: {x: 0, y: 0},
        color: "#bb2200",
    },
    {
        entityType: "planet",
        x: 0,
        y: -1500,
        //orbit: 0, // TODO bug with this?
        radius: 100,
        mass: 5000,
        velocity: {x: -12.5, y: 0},
        color: "RANDOM",
    },
    {
        entityType: "planet",
        x: 350,
        y: -1500,
        radius: 50,
        mass: 1000,
        orbit: 1,
        attach: 1,
        velocity: {x: -0, y: 3.5},
        color: "#aacc88",
    },
    // TODO get moon working
    // {
    //     entityType: "planet",
    //     x: 500,
    //     y: -1500,
    //     radius: 20,
    //     mass: 500,
    //     orbit: 2,
    //     attach: 1,
    //     velocity: {x: -2.5, y: 1},
    //     color: "#aacc88",
    // }
    ]
};

const map_homing = {
    seed: 0.7,
    name: "map_homing",
    player: {entityType: "player", x: 0, y: -1300, radius: 10, mass: 1, velocity: {x:0, y: 0}, color: "#00ffff"},
    camera: {x: 1, y: 1, width: "CANVAS_WIDTH", height: "CANVAS_HEIGHT", scale: 4, targetScale: 1, easeFactor: 0.1, zoomEaseFactor: cameraZoomEaseFactor, easeMode: "quadtratic"},
    planets: [{
        entityType: "planet",
        x: 0,
        y: -250,
        radius: 100,
        mass: 5000,
        orbit: 1,
        velocity: {x: 2.5, y: 0},
        color: "RANDOM",
    },
    {
        entityType: "planet",
        x: 0,
        y: 250,
        radius: 100,
        mass: 5000,
        orbit: 0,
        velocity: {x: -2.5, y: 0},
        color: "RANDOM",
    }],
    enemies: [
    {
        entityType: "enemy",
        x: 150,
        y: -250,
        orbit: 0,
        attach: 0,
        radius: 30,
        mass: 1,
        cooldownMax: 3000,
        shotSpeed: 7,
        shotAccel: 0.05,
        velocity: {x: 0, y: 5.5},
        shot: "homing",
        color: "#ddffee",
    }]
};

const map_homing_2 = {
    seed: 0.7,
    name: "map_homing_2",
    player: {entityType: "player", x: 0, y: -1300, radius: 10, mass: 1, velocity: {x:0, y: 0}, color: "#00ffff"},
    camera: {x: 1, y: 1, width: "CANVAS_WIDTH", height: "CANVAS_HEIGHT", scale: 4, targetScale: 1, easeFactor: 0.1, zoomEaseFactor: cameraZoomEaseFactor, easeMode: "quadtratic"},
    planets: [{
        entityType: "planet",
        x: 0,
        y: -500,
        radius: 100,
        mass: 5000,
        orbit: 1,
        killOnContact: true,
        glow: true,
        velocity: {x: 1.5, y: 0},
        color: "#bb2200",
    },
    {
        entityType: "planet",
        x: 0,
        y: 500,
        radius: 100,
        mass: 5000,
        orbit: 0,
        killOnContact: true,
        glow: true,
        velocity: {x: -1.5, y: 0},
        color: "#bb2200",
    }],
    collectables: [{
        entityType: "collectable",
        x: 0,
        y: -150,
        radius: 20,
        mass: 1,
        orbit: -1,
        velocity: {x: 0, y: 0},
        color: "#ffff00",
    },
    {
        entityType: "collectable",
        x: 0,
        y: 150,
        radius: 20,
        mass: 1,
        orbit: -1,
        velocity: {x: 0, y: 0},
        color: "#ffff00",
    },
    {
        entityType: "collectable",
        x: 150,
        y: 0,
        radius: 20,
        mass: 1,
        orbit: -1,
        velocity: {x: 0, y: 0},
        color: "#ffff00",
    },
    {
        entityType: "collectable",
        x: -150,
        y: 0,
        radius: 20,
        mass: 1,
        orbit: -1,
        velocity: {x: 0, y: 0},
        color: "#ffff00",
    },
    {
        entityType: "collectable",
        x: 0,
        y: -350,
        radius: 20,
        mass: 1,
        orbit: -1,
        velocity: {x: 0, y: 0},
        color: "#ffff00",
    },
    {
        entityType: "collectable",
        x: 0,
        y: 350,
        radius: 20,
        mass: 1,
        orbit: -1,
        velocity: {x: 0, y: 0},
        color: "#ffff00",
    },
    {
        entityType: "collectable",
        x: 350,
        y: 0,
        radius: 20,
        mass: 1,
        orbit: -1,
        velocity: {x: 0, y: 0},
        color: "#ffff00",
    },
    {
        entityType: "collectable",
        x: -350,
        y: 0,
        radius: 20,
        mass: 1,
        orbit: -1,
        velocity: {x: 0, y: 0},
        color: "#ffff00",
    },
    {
        entityType: "collectable",
        x: 0,
        y: -550,
        radius: 20,
        mass: 1,
        orbit: -1,
        velocity: {x: 0, y: 0},
        color: "#ffff00",
    },
    {
        entityType: "collectable",
        x: 0,
        y: 550,
        radius: 20,
        mass: 1,
        orbit: -1,
        velocity: {x: 0, y: 0},
        color: "#ffff00",
    },
    {
        entityType: "collectable",
        x: 550,
        y: 0,
        radius: 20,
        mass: 1,
        orbit: -1,
        velocity: {x: 0, y: 0},
        color: "#ffff00",
    },
    {
        entityType: "collectable",
        x: -550,
        y: 0,
        radius: 20,
        mass: 1,
        orbit: -1,
        velocity: {x: 0, y: 0},
        color: "#ffff00",
    }],
    enemies: [
    {
        entityType: "enemy",
        x: 0,
        y: 0,
        orbit: -1,
        radius: 30,
        mass: 1,
        cooldownMax: 1000,
        shotSpeed: 0,
        shotAccel: 0.025,
        velocity: {x: 0, y: 0},
        shot: "homing",
        color: "#ddffee",
    }],
    misc: [{
        entityType: "border", // TODO implement as planets using shell theorem?
        x: 0,
        y: 0,
        radius: 2500
    }]
};

function makePlanetRing() {
    // circle of planets
    // planets are of type
    /*
    {
        entityType: "planet",
        x: 0,
        y: 0,
        orbit: -1,
        radius: 100,
        mass: 5000,
        velocity: {x: 0, y: 0},
        color: "RANDOM",
    }
    */

    let planets = [];
    let numPlanets = 25;
    let radius = 1000;
    for (let i = 0; i < numPlanets; ++i) {
        let angle = i / numPlanets * Math.PI * 2;
        let x = Math.cos(angle) * radius;
        let y = Math.sin(angle) * radius;
        planets.push({
            entityType: "planet",
            x: x,
            y: y,
            orbit: -1,
            radius: 100,
            mass: 5000,
            velocity: {x: 0, y: 0},
            color: "RANDOM",
        });
    }
    return planets;
}

// This acts as a perf test since perf scales based on num planets
const map_shell = {
    seed: 0.2,
    name: "map_shell",
    player: {entityType: "player", x: 0, y: -2000, radius: 10, mass: 1, velocity: {x:-8.5, y: 0}, color: "#00ffff", hasControl: false},
    camera: {x: 1, y: 1, width: "CANVAS_WIDTH", height: "CANVAS_HEIGHT", scale: 4, targetScale: 1, easeFactor: 0.1, zoomEaseFactor: cameraZoomEaseFactor, easeMode: "quadtratic"},
    planets: makePlanetRing() // TODO remove. Should be static level definition
};

const map_sound_and_border_test = {
    seed: -0.5,
    name: "map_sound_and_border_test",
    player: {entityType: "player", x: 0, y: -400, radius: 10, mass: 1, velocity: {x:-3, y: 0}, color: "#00ffff"},
    camera: {x: 1, y: 1, width: "CANVAS_WIDTH", height: "CANVAS_HEIGHT", scale: 4, targetScale: 1, easeFactor: 0.1, zoomEaseFactor: cameraZoomEaseFactor, easeMode: "quadtratic"},
    planets: [{
        entityType: "planet",
        x: 0,
        y: 0,
        radius: 100,
        mass: 5000,
        velocity: {x: 0, y: 0},
        color: "#ffaa00",
    }],
    collectables: [{
        entityType: "collectable",
        x: 0,
        y: 200,
        radius: 20,
        mass: 1,
        orbit: -1,
        velocity: {x: 0, y: 0},
        color: "#ffff00",
    },
    {
        entityType: "collectable",
        x: 50,
        y: 200,
        radius: 20,
        mass: 1,
        orbit: -1,
        velocity: {x: 0, y: 0},
        color: "#ffff00",
    },
    {
        entityType: "collectable",
        x: 100,
        y: 200,
        radius: 20,
        mass: 1,
        orbit: -1,
        velocity: {x: 0, y: 0},
        color: "#ffff00",
    },{
        entityType: "collectable",
        x: 150,
        y: 200,
        radius: 20,
        mass: 1,
        orbit: -1,
        velocity: {x: 0, y: 0},
        color: "#ffff00",
    },{
        entityType: "collectable",
        x: 200,
        y: 200,
        radius: 20,
        mass: 1,
        orbit: -1,
        velocity: {x: 0, y: 0},
        color: "#ffff00",
    },{
        entityType: "collectable",
        x: 250,
        y: 200,
        radius: 20,
        mass: 1,
        orbit: -1,
        velocity: {x: 0, y: 0},
        color: "#ffff00",
    }],
    // TODO implement and render border
    // TODO make specific property?
    misc: [{
        entityType: "border", // TODO implement as planets using shell theorem?
        x: 0,
        y: 0,
        radius: 2500
    }] // TODO entities that control the game state / sequence things
    // TODO Make intro
};

const map_new_test = {
    seed: -0.5,
    name: "map_new_test",
    player: {entityType: "player", x: 0, y: -400, radius: 10, mass: 1, velocity: {x:-3, y: 0}, color: "#00ffff"},
    camera: {x: 1, y: 1, width: "CANVAS_WIDTH", height: "CANVAS_HEIGHT", scale: 4, targetScale: 1, easeFactor: 0.1, zoomEaseFactor: cameraZoomEaseFactor, easeMode: "quadtratic"},
    planets: [
        {
            entityType: "planet",
            x: -500,
            y: 0,
            radius: 200,
            mass: 7000,
            velocity: {x: 0, y: 4},
            color: "#ff0000",
        },
        {
            entityType: "planet",
            x: 500,
            y: 0,
            radius: 200,
            mass: 7000,
            velocity: {x: 0, y: -4},
            color: "#0000ff",
        },
        {
            entityType: "planet",
            x: 0,
            y: 500,
            radius: 200,
            mass: 7000,
            velocity: {x: 4, y: 0},
            color: "#00ff00",
        }
    ],
    collectables: [
        {
            entityType: "collectable",
            x: -300,
            y: 200,
            radius: 20,
            mass: 1,
            orbit: -1,
            velocity: {x: 0, y: 0},
            color: "#ffff00",
        },
        {
            entityType: "collectable",
            x: 300,
            y: 200,
            radius: 20,
            mass: 1,
            orbit: -1,
            velocity: {x: 0, y: 0},
            color: "#ffff00",
        },
        {
            entityType: "collectable",
            x: 0,
            y: -300,
            radius: 20,
            mass: 1,
            orbit: -1,
            velocity: {x: 0, y: 0},
            color: "#ffff00",
        }
    ],
    misc: [] // TODO entities that control the game state / sequence things
};

let d = 500;
let m = 5000;
let v = 2;
let vx = v * 0.9;
let vy = v * -1.5;
const map_lucidity_logo = {
    seed: -0.5,
    name: "map_lucidity_logo",
    player: {entityType: "player", x: 0, y: 0, radius: 10, mass: 1, velocity: {x:vx, y: vy}, color: "#00ffff"},
    camera: {x: 1, y: 1, width: "CANVAS_WIDTH", height: "CANVAS_HEIGHT", scale: 4, targetScale: 1, easeFactor: 0.1, zoomEaseFactor: cameraZoomEaseFactor, easeMode: "quadtratic"},
    planets: [
        {
            entityType: "planet",
            x: 0,
            y: d,
            radius: 50,
            mass: m,
            velocity: {x: 0, y: 0},
            color: "#00ff00",
            orbit: -1,
        },
        {
            entityType: "planet",
            x: 0,
            y: -d,
            radius: 50,
            mass: m,
            velocity: {x: 0, y: 0},
            color: "#00ff00",
            orbit: -1,
        },
        {
            entityType: "planet",
            x: d,
            y: 0,
            radius: 50,
            mass: m,
            velocity: {x: 0, y: 0},
            color: "#00ff00",
            orbit: -1,
        },
        {
            entityType: "planet",
            x: -d,
            y: 0,
            radius: 50,
            mass: m,
            velocity: {x: 0, y: 0},
            color: "#00ff00",
            orbit: -1,
        }
    ],
    collectables: [
    ],
    misc: [] // TODO entities that control the game state / sequence things
};

const levels = [map_singleton, map_dao, map_threebody, map_level, map_inverse_mass_test, map_large, map_homing, map_homing_2, map_shell, map_sound_and_border_test, map_new_test, map_lucidity_logo];
let currentLevel = 11;
function startGame () {
    initState(JSON.stringify(levels[currentLevel]))
}

function loadLevelFromJSON(json) {
    let mapobj = JSON.parse(json);

    mapobj.planets = mapobj.planets || [];
    mapobj.collectables = mapobj.collectables || [];
    mapobj.enemies = mapobj.enemies || [];

    mapobj.player.update = playerUpdate;
    mapobj.player.currentMovementVec = {x: 0, y:0}; // TODO where to init these? Shouldn't put in level data
    mapobj.player.targetMovementVec = {x: 0, y:0}; 
    mapobj.player.exists = true;

    for (let planet of mapobj.planets) {
        if (planet.color === "RANDOM") {
            planet.color = randomColor();
        }

        planet.update = planetUpdate;
        planet.exists = true;
    }

    // Make collectables exist
    for (let collectable of mapobj.collectables) {
        collectable.update = collectablesUpdate;
        collectable.exists = true;
    }

    for (let enemy of mapobj.enemies) {
        if (enemy.color === "RANDOM") {
            enemy.color = randomColor();
        }

        enemy.cooldown = enemy.cooldownMax;

        // TODO will need different updates for different enemies based on type
        // Bullets should just be enemies or generic entities
        enemy.update = enemyUpdate; 
        enemy.exists = true;
    }

    if (mapobj.camera.width === "CANVAS_WIDTH") {
        mapobj.camera.width = canvas.width;
    }
    if (mapobj.camera.height === "CANVAS_HEIGHT") {
        mapobj.camera.height = canvas.height;
    }

    return mapobj;
}

function makeInitParticles() {
    return [];
    let fieldLength = 4000;
    let numFields = 60;
    let particles = [];
    for (let i = 0; i < numFields; ++i) {
        for (let j = 0; j < numFields; ++j) {
            particles.push(makeEntity({
                entityType: "particle",
                x: i * fieldLength / numFields - fieldLength / 2,
                y: j * fieldLength / numFields - fieldLength / 2,
                radius: 1,
                mass: 1,
                velocity: {x: 0, y: 0},
                color: Math.random(), // TODO move to render state later,
                lifetime: 10000000,
                update: particleUpdate,
            }));
        }
    }
    return particles;
}

function makeField() {
    // Make 50 x 50 field entities and return them as a list
    let fieldLength = 4000;
    let entities = [];
    for (let i = 0; i < numFields; ++i) {
        for (let j = 0; j < numFields; ++j) {
            entities.push(makeEntity({
                entityType: "field",
                x: j * fieldLength / numFields - fieldLength / 2,
                y: i * fieldLength / numFields - fieldLength / 2,
                mass: 0,
                static: true,
                color: "#ff0000"
            }));
        }
    }
    return entities;
}

function randomColor() {
    return "#" + Math.floor(Math.random() * 16777215).toString(16);
}

function renderArrow(x, y, dir) {
    // Normalize dir
    let ndir = normalize(dir);

    // Scale up a bit based on dir magnitude
    let m = mag(dir);

    if (m < 0.02) { 
        return;
    }

    // scale up by min 1 or m
    let scaleFactor = Math.min(Math.max(1, m * 10), 5);
    ndir = scaleVec(ndir, scaleFactor);

    let coords = worldToCamera(x, y);
    /*let endCoords = addVec(coords, scaleVec(ndir, 5));
    
    // Draw a V from coords converging at endCoords
    let left = rotateVectorAngle(ndir, Math.PI / 6 + Math.PI);
    let right = rotateVectorAngle(ndir, -Math.PI / 6 + Math.PI);

    // Line from left to endCoords
    context.beginPath();
    context.moveTo(endCoords.x, endCoords.y);
    context.lineTo(endCoords.x + right.x, endCoords.y + right.y);
    context.stroke();

    // Line from right to endCoords
    context.beginPath();
    context.moveTo(endCoords.x, endCoords.y);
    context.lineTo(endCoords.x + left.x, endCoords.y + left.y);

    // Set color to be more red based on m
    context.strokeStyle = "rgba(255, 0, 0, " + Math.min(10, 10 * m) + ")";

    context.stroke();*/

    // Render a gray circle with the size dependent on the magnitude of dir
    // Move it slightly towards dir
    let circleCoords = addVec({x:x, y:y}, scaleVec(ndir, 10));
    drawCircle(circleCoords, 30 * Math.min(m, 1), "#888888");

}

function renderField(entities) {
    if (renderWarping) return;
    // For each entity, render them as an arrow at their location pointing in the direction of their acceleration
    for (let entity of entities) {
        renderArrow(entity.x, entity.y, entity.acceleration);
    }
}

function computeGravityForce(entity, otherEntity) {
    let distance = dist(entity, otherEntity);
    if (distance == 0) {
        distance = 0.00001;
    }
    let angle = Math.atan2(otherEntity.y - entity.y, otherEntity.x - entity.x);

    // TODO factor in your own mass? Is that doable?
    let gravitationForceFromOtherEntity = (otherEntity.mass / (distance * distance));
    return {x: gravitationForceFromOtherEntity * Math.cos(angle), y: gravitationForceFromOtherEntity * Math.sin(angle)};
}

function makeGravityField(planets) {
    // Field of gravity values based on planets with orbit === -1
    // Final object contains start, end, numElements and values
    let field = [];
    let start = {x: -10000, y: -10000};
    let end = {x: 10000, y: 10000};
    let numElements = 1000;
    let values = [];
    for (let i = 0; i < numElements; ++i) {
        let x = start.x + (end.x - start.x) * i / numElements;
        for (let j = 0; j < numElements; ++j) {
            let y = start.y + (end.y - start.y) * j / numElements;
            let acceleration = {x: 0, y: 0};
            for (let planet of planets) {
                if (planet.orbit !== -1) continue;
                let f = computeGravityForce({x: x, y: y, mass: 1}, planet);
                acceleration.x += f.x;
                acceleration.y += f.y;
            }
            values.push(acceleration);
        }
    }
    return {start: start, end: end, numElements: numElements, values: values};
}

function getFieldPositionFromIndex(field, index) {
    let fieldStart = field.start;
    let fieldEnd = field.end;
    let numElements = field.numElements;
    let x = Math.floor(index / numElements);
    let y = index % numElements;
    let xCoord = fieldStart.x + (fieldEnd.x - fieldStart.x) * x / numElements;
    let yCoord = fieldStart.y + (fieldEnd.y - fieldStart.y) * y / numElements;
    return {x: xCoord, y: yCoord};
} 

function getGravityFieldValue(entity, field) {
    let x = Math.floor((entity.x - field.start.x) / (field.end.x - field.start.x) * field.numElements);
    let y = Math.floor((entity.y - field.start.y) / (field.end.y - field.start.y) * field.numElements);
    let isInField = x >= 0 && x < field.numElements && y >= 0 && y < field.numElements;
    if (!isInField) return null;
    return field.values[x * field.numElements + y];
}

function initState(json) {
    console.log("Loading level: " + json);
    let levelData = loadLevelFromJSON(json);
    console.log(levelData);
    state = {
        timestamp: 0,
        gameOver: false,
        seed: levelData.seed || 0,
        camera: levelData.camera,
        player: levelData.player,
        planets: levelData.planets || [],
        collectables: levelData.collectables || [],
        enemies: levelData.enemies || [],
        bullets: levelData.bullets || [], // TODO can probably factor this out. Just need render function
        particles: makeInitParticles(),
        field: makeField(),
        misc: levelData.misc || [],
        // TODO could compute this statically
        gravityField: makeGravityField(levelData.planets || []), // TODO update into a secondary map then swap them?
        input: {
            wPressed: false,
            sPressed: false,
            aPressed: false,
            dPressed: false,
            ePressed: false,
            rPressed: false,
            spacePressed: false,
            mouseX: 0,
            mouseY: 0,
            mouseIsDown: false
        },
        score: 0,
    };
}

function lineIntersects(p1, p2, q1, q2) {
    let r = {x: p2.x - p1.x, y: p2.y - p1.y};
    let s = {x: q2.x - q1.x, y: q2.y - q1.y};
    let rxs = r.x * s.y - r.y * s.x;
    let qpxr = (q1.x - p1.x) * r.y - (q1.y - p1.y) * r.x;
    let qpxs = (q1.x - p1.x) * s.y - (q1.y - p1.y) * s.x;
    let t = qpxr / rxs;
    let u = qpxs / rxs;
    return rxs != 0 && t >= 0 && t <= 1 && u >= 0 && u <= 1;
}

function render(state) {
    // gobal alpha
    context.globalAlpha = 1;

    // Clear canvas black
    //context.fillStyle = "#000000";
    context.clearRect(0, 0, canvas.width, canvas.height);

    /*
    // Set awesome canvas background
    // linear gradient from #333333 to #444444
    let grdcoords1 = worldToCamera(-200, -200);
    let grdcoords2 = worldToCamera(canvas.width - 500, canvas.height - 400);
    let grd = context.createLinearGradient(grdcoords1.x, grdcoords1.y, grdcoords2.x, grdcoords2.y);
    grd.addColorStop(0, "#333333");
    grd.addColorStop(1, "#444444");
    context.fillStyle = grd;
    context.fillRect(0, 0, canvas.width, canvas.height);
    */

    renderField(state.field);

    // Draw particles
    for (let particle of state.particles) {
        let color = particle.color;
        // Set particle color alpha to closer to 0 based on lifetime

        context.save();
        // Set additive hue blending
        context.globalCompositeOperation = "lighter";
        context.globalAlpha = (particle.maxAlpha || 1) * particle.lifetime / 100;
        
        drawCircle({x: particle.x, y: particle.y}, particle.radius * 2, particle.color);

        context.restore();
    }

    // Draw planets
    for (let planet of state.planets) {
        if (!planet.glow) {
            drawCircle({x: planet.x, y: planet.y}, planet.radius, planet.color);
        } else {
            drawCircle({x: planet.x, y: planet.y}, planet.radius * 1, planet.color);
            drawCircle({x: planet.x, y: planet.y}, planet.radius * 1.2, planet.color, true);
        }
    }

    // Draw enemies
    for (let enemy of state.enemies) {
        // Render size based on cooldown
        let radius = enemy.radius * (0.2 + (enemy.cooldown / enemy.cooldownMax) * 0.8);
        if (radius < 0) radius = 0;
        drawCircle({x: enemy.x, y: enemy.y}, radius, enemy.color);
    }

    // Draw bullets
    // TODO draw with tail and particles
    for (let bullet of state.bullets) {
        drawCircle({x: bullet.x, y: bullet.y}, bullet.radius, bullet.color);
    }

    // draw collectables as circle but with larger empty circle around it
    context.save();
    context.globalCompositeOperation = "lighter";
    for (let collectable of state.collectables) {
        drawCircle({x: collectable.x, y: collectable.y}, collectable.radius * 1, collectable.color);
        drawCircle({x: collectable.x, y: collectable.y}, collectable.radius * 1.2, collectable.color, true);
    }
    context.restore();

    // render misc
    for (var i = 0; i < state.misc.length; i++) {
        let entity = state.misc[i];
        if (entity.entityType === "border") {
            // Render as a thin hollow circle
            drawHollowCircle({x: entity.x, y: entity.y}, entity.radius, "#ffffff");
        }
    }

    // Draw player circle last so its on top at all times
    if (state.player) {
        drawCircle({x: state.player.x, y: state.player.y}, state.player.radius, state.player.color);
    }
}

// Audio
let audioContext = null;
let filter = null;
let channelMerger = null;
let maxAudioChannels = 6;
let currentAudioChannel = 0;

// set up web audio
function initAudio() {
    // create web audio api context
    audioContext = new (window.AudioContext || window.webkitAudioContext)();

    // Set up low pass filter
    filter = audioContext.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 440;
    filter.Q.value = 1;
    filter.gain.value = 0;
    filter.connect(audioContext.destination);

    // Set up channel merger
    channelMerger = audioContext.createChannelMerger(maxAudioChannels);
    channelMerger.connect(filter);
}

function randomNote() {
    // a set of notes that harmonize with 440hz
    let notes = [440, 220, 880, 660, 330, 1760, 1320];
    return notes[Math.floor(Math.random() * notes.length)];
}

function nextAudioChannel() {
    currentAudioChannel++
    if (currentAudioChannel >= maxAudioChannels) {
        currentAudioChannel = 0;
    }
    return currentAudioChannel;
}

function playTone (f, t) {
    //if (audioContext) {
        //for (let i = 0 ; i < 15; i ++) {
            let totalTime = t + Math.random() * 1000 - 500;
            let fadeStartTime = t/10 + Math.random() * 100 - 50

            let oscillator = audioContext.createOscillator();
            let gain = audioContext.createGain();

            oscillator.connect(gain);
            gain.connect(filter);
            //gain.connect(channelMerger, 0, nextAudioChannel());

            // Ramp up values to avoid annoying click sound
            gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.1, audioContext.currentTime + 0.01);

            oscillator.type = "sine";
            //let m = 4;
            //oscillator.frequency.setValueAtTime(440 + (((Math.random() * 2 - 1) * m) * 440), audioContext.currentTime);

            oscillator.frequency.setValueAtTime(f, audioContext.currentTime);

            oscillator.start(0);

            // TODO may eventually want to schedule these by checking timestamps. Whichever is more performant
            console.log("start " + audioContext.currentTime);
            setTimeout(function() {
                console.log("fade " + audioContext.currentTime);
                gain.gain.setValueAtTime(gain.gain.value, audioContext.currentTime);
                gain.gain.linearRampToValueAtTime(0.0001, audioContext.currentTime + ((totalTime - fadeStartTime) / 1000 / 4));

                setTimeout(function() {
                    console.log("stop " + audioContext.currentTime);
                    oscillator.stop(0);
                }, totalTime - fadeStartTime);
            }, fadeStartTime);
        //}
    //}
}

function rotateVectorAngle(vec, angle) {
    let x = vec.x * Math.cos(angle) - vec.y * Math.sin(angle);
    let y = vec.x * Math.sin(angle) + vec.y * Math.cos(angle);
    return {x: x, y: y};
}

// TODO this is just a scale of dir by vec's magnitude, so maybe not needed?
// Rotate vector around origin towards direction vector
function rotateVector(vec, dir) {
    let angle = Math.atan2(dir.y, dir.x);
    let x = vec.x * Math.cos(angle) - vec.y * Math.sin(angle);
    let y = vec.x * Math.sin(angle) + vec.y * Math.cos(angle);
    return {x: x, y: y};
}

function copyvec(vec) {
    return {x: vec.x, y: vec.y};
}

// Scale a vector by a scalar
function scaleVector(a, s) {
    return {
        x: a.x * s,
        y: a.y * s
    };
}

// lerp
function lerp(a, b, t) {
    return a + (b - a) * t;
}

// Project point onto line
function projectPointOntoLine(point, lineStart, lineEnd) {
    let lineVector = normalize({x: lineEnd.x - lineStart.x, y: lineEnd.y - lineStart.y});
    let lineToPoint = {x: point.x - lineStart.x, y: point.y - lineStart.y};
    let projection = dotProduct(lineToPoint, lineVector);
    return addVec(lineStart, scaleVector(lineVector, projection));
}

// Add vectors
function addVec(vec1, vec2) {
    return {
        x: vec1.x + vec2.x,
        y: vec1.y + vec2.y
    };
}

// Vector difference
function subVec(vec1, vec2) {
    return {
        x: vec1.x - vec2.x,
        y: vec1.y - vec2.y
    };
}

function drawCircle(worldPos, radius, fillStyle, isGradient)
{
    isGradient = isGradient || false;
    let coords = worldToCamera(worldPos.x, worldPos.y);
    context.beginPath();
    context.arc(coords.x, coords.y, radius / state.camera.scale, 0, 2 * Math.PI);
    if (isGradient) {
        let grd = context.createRadialGradient(coords.x, coords.y, 0, coords.x, coords.y, radius / state.camera.scale);
        grd.addColorStop(0, fillStyle);
        grd.addColorStop(1, "rgba(255, 255, 255, 0)");
        context.fillStyle = grd;
    } else {
        context.fillStyle = fillStyle;
    }
    context.fill();
}

function drawHollowCircle(worldPos, radius, strokeStyle)
{
    let coords = worldToCamera(worldPos.x, worldPos.y);
    context.beginPath();
    context.arc(coords.x, coords.y, radius / state.camera.scale, 0, 2 * Math.PI);
    context.strokeStyle = strokeStyle;
    context.stroke();
}

function drawRectangle(worldPos, width, height, fillStyle) {
    let coords = worldToCamera(worldPos.x, worldPos.y);
    context.beginPath();
    context.rect(coords.x, coords.y, width / state.camera.scale, height / state.camera.scale);
    context.fillStyle = fillStyle;
    context.fill();
}

// Map x and y to index of 1000 x 1000 array
function pointToGravMapIndex(x, y) {
    return Math.floor(x) + Math.floor(y) * 1000;
}

function drawCurve(origin, controlPoint1, controlPoint2, destination, color, thickness) {
    let coords = worldToCamera(origin.x, origin.y);
    let cp1 = worldToCamera(controlPoint1.x, controlPoint1.y);
    let cp2 = worldToCamera(controlPoint2.x, controlPoint2.y);
    let dest = worldToCamera(destination.x, destination.y);
    context.beginPath();
    context.moveTo(coords.x, coords.y);
    context.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, dest.x, dest.y);
    context.strokeStyle = color;
    // set no dash
    context.setLineDash([]);
    // set line thickness to thickness
    context.lineWidth = thickness;
    context.stroke();
}

function circleLineSegmentCollision(object, radius, lineStart, lineEnd) {
    // Get the vector from the start of the line to the object
    let lineToObject = {x: object.x - lineStart.x, y: object.y - lineStart.y};
    // Get the vector from the start of the line to the end of the line
    let lineVector = {x: lineEnd.x - lineStart.x, y: lineEnd.y - lineStart.y};
    // Get the length of the line vector
    let lineLength = mag(lineVector);
    // Normalize the line vector
    lineVector.x /= lineLength;
    lineVector.y /= lineLength;
    // Get the dot product of the lineToObject vector and the lineVector
    let dotProductStart = dotProduct(lineToObject, lineVector);
    // Get the closest point on the line
    let closestPoint = {x: lineStart.x + lineVector.x * dotProductStart, y: lineStart.y + lineVector.y * dotProductStart};
    // Check if the closes point is withing the line segment
    let lineEndToObject = {x: object.x - lineEnd.x, y: object.y - lineEnd.y};
    let dotProductEnd = dotProduct(lineEndToObject, lineVector);
    if (dotProductStart < 0 || dotProductEnd > 0) {
        return null;
    }
    // Get the distance between the object and the closest point on the line
    let distance = dist(object, closestPoint);
    // Return the collision point if the distance is less than the radius
    if (distance < radius) {
        return closestPoint;
    }
    return null;
}

function scaleVec(vector, factor) {
    vector.x *= factor;
    vector.y *= factor;
    return vector;
}

function normalize(vector) {
    let length = mag(vector);
    if (length == 0) { return {x: 0, y: 0 }; }
    return {x: vector.x / length, y: vector.y / length};
}

function dotProduct(vector1, vector2) {
    return vector1.x * vector2.x + vector1.y * vector2.y;
}

function crossProduct(vector1, vector2) {
    return vector1.x * vector2.y - vector1.y * vector2.x;
}

function circleCollision(p1, r1, p2, r2) {
    return dist(p1, p2) < r1 + r2;
}

function physicsUpdate (entity, entities, gravitySources, attachmentList, field)
{
    entity.acceleration = {x:0, y:0};

    let readStaticGrav = true;
    // assumes planets are first in the list of entities
    if (entity.orbit != undefined) {
        if (entity.orbit == -1) {
            //gravitySources = [];
            return;
        } else {
            // TODO this will be an issue when planets are destroyed (orbit will be wrong)
            gravitySources = [entities[entity.orbit]];
            readStaticGrav = false;
        }
    }

    // TODO this is the main perf sink. Optimize it somehow
        // Only idea I can think of here is a gravity field updated with cellular automata rules
            // For a cell we would have a gravity force vector v, which we wish to propagate according to 1/d^2
            // Propagation rule for a cell of vector v would be TODO
        // Would be bounded on field size and not number of entities
        // Another idea would be to use a quadtree to partition the space
            // e.g. for the player, take the combined gravity of all objects in a different quad
        // Or some kind of spatial lookup based on the area that gravity producing objects could affect
        // Can we leverage the fact that gravity values for planets wont change (since their mass wont change), only their location?
            // Then total gravity is just blending a set of textures together
            // So we have a field for each planet and the planet location, use that to read values computed in advance
                // If we change planet size we invalidate the values and recompute the whole thing (only do for small num planet maps)
                // Can do on GPU? https://stackoverflow.com/questions/13626606/read-pixels-from-a-webgl-texture
                    // How performant is reading these pixels?
                // Still scales with num planets; just becomes lookups and adds instead of atan cos sin etc...
            // Could similarly compute a single gravity map, then a delta map for planets that move
        // Easiest initial solution is static gravity field (for static planets) and then add dynamic planets manually
    // Note: the problem with the field approach is that planets are then affected by their own gravity, which makes them fly away
        // Can solve this by removing its own gravity from the nearest field value before computing acceleration
        // 2 fields, static and dynamic
        // Dynamic field is initialized to 0
        // For each entity, add its gravity to the dynamic field at its location
        // Each frme propagate the gravity values by 
        // Each frame, for each planet, remove its gravity from the dynamic field at its location
        // Then move the planet and add its gravity back to the dynamic field at its new location

    if (readStaticGrav) {
        // Get gravity from each entity
        let fieldValue = getGravityFieldValue(entity, field);
        if (fieldValue) {
            entity.acceleration.x += fieldValue.x;
            entity.acceleration.y += fieldValue.y;
        }
    }
    for (let otherEntity of gravitySources) {
        if (otherEntity === entity || otherEntity.orbit === -1) {
            continue;
        }
        let f = computeGravityForce(entity, otherEntity);
        entity.acceleration.x += f.x;
        entity.acceleration.y += f.y;
    }

    // TODO unify this and orbit (though still want to compute gravity for field entities)
    if (entity.static) {
        return;
    }

    entity.velocity.x += entity.acceleration.x;
    entity.velocity.y += entity.acceleration.y;
    entity.y += entity.velocity.y;
    entity.x += entity.velocity.x;

    if (attachmentList) {
        for (let attachment of attachmentList) {
            attachment.x += entity.velocity.x;
            attachment.y += entity.velocity.y;
        }
    }
}

function CameraScaleRatio() {
    return canvas.width / canvasDesignWidth;
}

function removeEntity(e)
{
    e.exists = false; // won't be updated in update()
}

function planetUpdate(entity, timeMs, timeDelta) {
}

function enemyUpdate(entity, timeMs, timeDelta) {
    // TODO will need different updates for different enemies

    // Countdown cooldown timer and fire a shot if it reaches 0
    entity.cooldown -= timeDelta;
    if (state.player && entity.cooldown <= 0) {
        entity.cooldown = entity.cooldownMax;

        let launchVector = {x: 0, y: 0};
        if (entity.attach !== undefined){
            let vectorFromPlanet = subVec(entity, state.planets[entity.attach]);
            launchVector = normalize(vectorFromPlanet);
        } else {
            // Get vector towards player
            let vectorToPlayer = subVec(state.player, entity);
            launchVector = normalize(vectorToPlayer);
        }

        // play a crunchy sound around low A
        playTone(220, 50);

        // Create bullet
        // TODO line of sight
        state.bullets.push(makeEntity({
            entityType: "bullet",
            x: entity.x,
            y: entity.y,
            radius: 15,
            mass: 1,
            velocity: scaleVec(launchVector, entity.shotSpeed),
            color: entity.color,
            shotAccel: entity.shotAccel,
            update: bulletUpdate,
        }));

        // Fire some particles in that direction
        for (let i = 0; i < 10; ++i) {
            state.particles.push(makeEntity({
                entityType: "particle",
                x: entity.x,
                y: entity.y,
                radius: 1,
                mass: 1,
                velocity: {x: Math.random() * 10 - 5, y: Math.random() * 10 - 5},
                color: entity.color,
                lifetime: 20 + Math.random() * 50,
                update: particleUpdate,
            }));
        }
    }
}

// TODO make this more fun
function bulletUpdate(entity, timeMs, timeDelta) {
    // Accelrate towards player
    if (state.player) {
        let vectorToPlayer = subVec(state.player, entity);
        let normalizedVectorToPlayer = normalize(vectorToPlayer);
        let movement = {x: normalizedVectorToPlayer.x * entity.shotAccel, y: normalizedVectorToPlayer.y * entity.shotAccel};

        entity.velocity.x += movement.x;
        entity.velocity.y += movement.y;

        // TODO this doesn't look very good :c
        outputFlameParticles(entity, movement);
    }

    
    // Create some particles
    state.particles.push(makeEntity({
        entityType: "particle",
        x: entity.x,
        y: entity.y,
        radius: 1,
        mass: 1,
        velocity: {x: Math.random() * 10 - 5, y: Math.random() * 10 - 5},
        color: entity.color,
        lifetime: 10 + Math.random() * 20,
        update: particleUpdate,
    }));
    

    // Player collision
    if (state.player && circleCollision(entity, entity.radius, state.player, state.player.radius)) {
        explodeEntity(state.player);
        explodeEntity(entity);
        return;
    }

    // Planet collisions
    // TODO pass planets in
    // TODO merge with player. Could also have them bounce off planets? Would have to destroy them another way. Time?
    for (let planet of state.planets) {
        if (circleCollision(entity, entity.radius, planet, planet.radius)) {
            explodeEntity(entity);

            // TODO refactor this
            // Make planet particles
            for (let i = 0; i < 100; ++i) {
                state.particles.push(makeEntity({
                    entityType: "particle",
                    x: entity.x,
                    y: entity.y,
                    radius: 1,
                    mass: 1,
                    velocity: {x: Math.random() * 10 - 5, y: Math.random() * 10 - 5},
                    color: planet.color,
                    lifetime: 100 + Math.random() * 100,
                    update: particleUpdate,
                }));
            }

            return;
        }
    }
}

function collectablesUpdate(entity, timeMs, timeDelta) {
    state.particles.push(makeEntity({
        entityType: "particle", // TODO probably dont need to differentiate
        x: entity.x + Math.random() * entity.radius / 2,
        y: entity.y + Math.random() * entity.radius / 2,
        radius: 1,
        mass: 1,
        orbit: entity.orbit,
        velocity: {x: -entity.velocity.x + (Math.random() * 5) - 2.5, y: -entity.velocity.y + (Math.random() * 5) - 2.5},
        color: entity.color, // TODO move to render state later,
        lifetime: 20 + Math.random() * 20,
        update: particleUpdate,
    }));
}

function outputFlameParticles(entity, movement) {
    for (let i = 0; i < 5; ++i) {
        state.particles.push(makeEntity({
            entityType: "particle",
            x: entity.x + entity.velocity.x + movement.x,
            y: entity.y + entity.velocity.y + movement.y,
            radius: 2,
            mass: 1,
            velocity: {x: entity.velocity.x + -movement.x * 10 + Math.random() * 1 - 0.5, y: entity.velocity.y + -movement.y * 10 + Math.random() * 1 - 0.5},
            color: entity.color, //"#ffaa00", // TODO move to render state later,
            lifetime: 20 + Math.random() * 20,
            update: particleUpdate,
            removeOnSpeedThreshold: false
        }));
    }
}

function playerUpdate(entity, timeMs, timeDelta)
{
    // TODO put these constants somewhere
    const maxSpeed = 10;
    const accel = 0.1;
    let movement = {x: 0, y: 0};
    // TODO if (entity.hasControl !== false) {
        if (state.input.wPressed) {
            movement.y -= accel;
        }
        if (state.input.aPressed) {
            movement.x -= accel;
        }
        if (state.input.sPressed) {
            movement.y += accel;
        }
        if (state.input.dPressed) {
            movement.x += accel;
        }

        // If mouse is down, override the movement vector and accelerate player towards the mouse position
        if (state.input.mouseIsDown) {
            let vectorToMouse = subVec({x: state.input.mouseX, y: state.input.mouseY}, entity);
            let normalizedVectorToMouse = normalize(vectorToMouse);
            movement = scaleVec(normalizedVectorToMouse, accel);
        }
    // TODO }

    if (USE_TANK_CONTROLS) {
        // Rotate movement vector based on mouse position relative to player
        // TODO
    }

    let isInputting = movement.x != 0 && movement.y != 0; 

    // For each planet, if its colliding, bounce off
    // TODO add collisions to enemies
    for (let planet of state.planets) {
        if (circleCollision(entity, entity.radius, planet, planet.radius)) {
            // First move the player such that its not colliding
            let normal = normalize(subVec(entity, planet));
            let distance = dist(entity, planet);
            let overlap = entity.radius + planet.radius - distance + 0.5;
            entity.x += normal.x * overlap;
            entity.y += normal.y * overlap;

            // TODO if grounded on planet, give extra boost to get off it
            // or figure out some other way player doesn't get stuck

            // Bounce off
            let velocityDifference = subVec(entity.velocity, planet.velocity);
            let dot = dotProduct(velocityDifference, normal);
            let bounceFriction = 0.8;
            let bounceFactor = 1; // TODO was 2
            let amount = scaleVec(normal, 2 * dot * bounceFriction * (isInputting ? bounceFactor : 1));
            entity.velocity = subVec(entity.velocity, amount);
            let surfaceFriction = 0.99;
            entity.velocity.x *= surfaceFriction;
            entity.velocity.y *= surfaceFriction;

            // Add the velocity of the object
            // TODO reativate with a coefficient?
            //entity.velocity.x += planet.velocity.x;
            //entity.velocity.y += planet.velocity.y;

            // Make a particle burst
            if (mag(amount) > 5) {
                for (let i = 0; i < 100; ++i) {
                    state.particles.push(makeEntity({
                        entityType: "particle",
                        x: entity.x,
                        y: entity.y,
                        radius: 1,
                        mass: 1,
                        // Velocity should be amount * random offset
                        //velocity: {x: -amount.x / 5 + Math.random() * 4 - 2, y: -amount.y / 5 + Math.random() * 4 - 2},
                        velocity: {x: Math.random() * 10 - 5, y: Math.random() * 10 - 5},
                        color: planet.color, // TODO move to render state later,
                        lifetime: 100 + Math.random() * 400,
                        update: particleUpdate,
                    }));
                }

                // play a tone based on the magnitude of the impact and the planet size
                playTone(220 + 100 * 10, mag(amount) * 100);
            }

            if (planet.killOnContact) {
                explodeEntity(entity);
                return;
            }
        }
    }

    // If there is a border in misc, and we hit it, bounce off
    // TODO factor this
    for (let border of state.misc) {
        if (border.entityType === "border") {
            if (!circleCollision(entity, entity.radius, border, border.radius)) {
                // First move the player such that is colliding (back inside border)
                let normal = normalize(subVec(entity, border));
                let distance = dist(entity, border);
                let overlap = entity.radius + border.radius - distance;
                entity.x += normal.x * overlap;
                entity.y += normal.y * overlap;

                // Bounce off
                let velocityDifference = entity.velocity;
                let dot = dotProduct(velocityDifference, normal);
                let bounceFriction = 0.8;
                let bounceFactor = 1; // TODO was 2
                let amount = scaleVec(normal, 2 * dot * bounceFriction * (isInputting ? bounceFactor : 1));
                entity.velocity = subVec(entity.velocity, amount);
                let surfaceFriction = 0.95;
                entity.velocity.x *= surfaceFriction;
                entity.velocity.y *= surfaceFriction;

                // Make a particle burst
                if (mag(amount) > 5) {
                    for (let i = 0; i < 100; ++i) {
                        state.particles.push(makeEntity({
                            entityType: "particle",
                            x: entity.x,
                            y: entity.y,
                            radius: 1,
                            mass: 1,
                            // Velocity should be amount * random offset
                            //velocity: {x: -amount.x / 5 + Math.random() * 4 - 2, y: -amount.y / 5 + Math.random() * 4 - 2},
                            velocity: {x: Math.random() * 10 - 5, y: Math.random() * 10 - 5},
                            color: "#ffffff", // TODO move to render state later,
                            lifetime: 100 + Math.random() * 400,
                            update: particleUpdate,
                        }));
                    }

                    // play a tone based on the magnitude of the impact and the planet size
                    // Modulate the frequency based on the location of the entity
                    let normalizedEntityVectorFromCenter = normalize(entity);
                    let angle = Math.atan2(normalizedEntityVectorFromCenter.y, normalizedEntityVectorFromCenter.x);
                    let frequency = 220 + (angle + 3.14 / 2) * 10;
                    playTone(frequency, mag(amount) * 100);
                }
            }
        }
    }

    // Check collision with collectables. If we hit them, explode them
    // TODO should be in collectable update fun?
    for (let collectable of state.collectables) {
        if (circleCollision(entity, entity.radius, collectable, collectable.radius)) {
            collectable.velocity.x = entity.velocity.x / 2;
            collectable.velocity.y = entity.velocity.y / 2;
            explodeEntity(collectable);
            state.score += 1;

            playTone(randomNote(), 5000);

            if (state.collectables.length == 1) {
                // Kill player on last collectable
                //explodeEntity(entity);
            }
        }
    }

    // lerp state.currentMovementVec to state.targetMovementVec
    state.targetMovementVec = movement;
    state.player.currentMovementVec = {
        x: lerp(state.player.currentMovementVec.x, movement.x, 0.1),
        y: lerp(state.player.currentMovementVec.y, movement.y, 0.1)
    };

    /*
    state.particles.push(makeEntity({
        entityType: "particle", // TODO probably dont need to differentiate
        x: entity.x + Math.random() * entity.radius / 2,
        y: entity.y + Math.random() * entity.radius / 2,
        radius: 1,
        mass: 1,
        velocity: {x: -entity.velocity.x + (Math.random() * 0.1) - 0.05, y: -entity.velocity.y + (Math.random() * 0.1) - 0.05},
        color: entity.color, // TODO move to render state later,
        maxAlpha: 1,
        lifetime: 100 + Math.random() * 100,
        update: particleUpdate,,
        removeOnSpeedThreshold: false
    }));
    */

    state.particles.push(makeEntity({
        entityType: "particle", // TODO probably dont need to differentiate
        x: entity.x + entity.velocity.x + state.player.currentMovementVec.x + Math.random() * entity.radius / 2,
        y: entity.y + entity.velocity.y + state.player.currentMovementVec.y + Math.random() * entity.radius / 2,
        radius: 1,
        mass: 1,
        velocity: {x: entity.velocity.x - state.player.currentMovementVec.x * 10 + (Math.random() * 0.1) - 0.05, y: entity.velocity.y - state.player.currentMovementVec.y * 10 + (Math.random() * 0.1) - 0.05},
        color: entity.color, // TODO move to render state later,
        maxAlpha: 1,
        lifetime: 100 + Math.random() * 100,
        update: particleUpdate
    }));

    // Output flame particles in the direction of your movement
    if (movement.x != 0 || movement.y != 0) {
        outputFlameParticles(entity, movement);
    }

    // velocity vector with movement applied
    let newVelocity = addVec(entity.velocity, movement);
    //if (mag(newVelocity) < maxSpeed) {
        // apply it
        entity.velocity = newVelocity;
    //}
}

function particleUpdate (entity) {
    entity.lifetime -= 1;
    if (entity.lifetime < 0) {
        removeEntity(entity);
    }

    if (entity.removeOnSpeedThreshold === false) {
        return;
    }

    // TODO just handles destroying without colliding for now
    // When it goes into the planet, it gets flung out fast
    if( mag(entity.velocity) > 20) {
        removeEntity(entity);
    }
}

// TODO update gravity map on static planet explosion
function explodeEntity(entity) {
    // If planet 1 exists, destroy it and replace if with 500 particles of the same color in the same circle radius
    if (!entity) {
        return;
    }

    // TODO remove
    if (entity === state.player) {
        // A
        //playTone(220, 10000);
        // C#
        //playTone(277.18, 10000);
        // E
        playTone(329.63, 1000);
        setTimeout(function() {
            // C#
            playTone(277.18, 1000);
            setTimeout(function() {
                // A
                playTone(220, 4000);
                playTone(110, 8000);
                setTimeout(function() {
                    // D
                    //playTone(293.66, 10000);
                    // G
                    //playTone(392, 10000);
                }, 250);
            }, 250);
        }, 250);
    } else if (entity.entityType === "planet") {
        let sustain = entity.radius / 250;
        playTone(225, 250 * sustain);
        playTone(224, 500 * sustain);
        playTone(223, 1000 * sustain);
        playTone(222, 2000 * sustain);
        playTone(221, 4000 * sustain);
        playTone(220, 8000 * sustain);
        playTone(165, 16000 * sustain);
    }

    let x = entity.x;
    let y = entity.y;
    let radius = entity.radius;
    let color = entity.color;

    let numParticles = entity.radius * entity.radius;
    if (numParticles > 5000) {
        numParticles = 5000;
    }

    // Area = PI * r * r, so to fill it with 500 cirlces, we want to
    let particleRadius = 1;
    particleRadius = particleRadius < 1 ? 1 : particleRadius;

    // Place particles around the circle
    for (let i = 0; i < numParticles; i++) {
        let angle = Math.random() * 2 * Math.PI;
        let amount = Math.random();
        let particleX = x + Math.cos(angle) * amount * radius;
        let particleY = y + Math.sin(angle) * amount * radius;
        state.particles.push(makeEntity({
            entityType: "particle",
            x: particleX,
            y: particleY,
            radius: particleRadius,
            mass: 1,
            velocity: {x: entity.velocity.x + Math.cos(angle) * amount * 2, y: entity.velocity.y + Math.sin(angle) * amount * 2},
            color: color,
            lifetime: 500 + Math.random() * 1400,
            update: particleUpdate,
        }));
    }

    removeEntity(entity);
}

function update (timeMs, timeDelta)
{
    if (state.camera.easeMode == "quadtratic") {
        // Ease camera scale to targetScale
        state.camera.scale += (state.camera.targetScale - state.camera.scale) * state.camera.zoomEaseFactor;
        // Ease camera x and y towards player position
        let targetX = state.player ? state.player.x : 0;
        let targetY = state.player ? state.player.y : 0; 
        state.camera.x += (targetX - state.camera.x) * state.camera.easeFactor;
        state.camera.y += (targetY - state.camera.y) * state.camera.easeFactor;
    }

    if (USE_TANK_CONTROLS) {
        // Rotate the camera based on the mouse position relative to the player
        if (state.player && state.mouseX !== null && state.mouseY !== null) {
            //ddddddddlet dx = state.mouseX - (state.player.x + 16);
            //let dy = state.mouseY - (state.player.y + 16);
            //let angle = Math.atan2(dy, dx) * RAD_TO_DEG;

        }           
    }

    // Add all the stuff to entities list
    var nonparticles = (state.player ? [state.player] : []).concat(state.planets);
    var entities = [].concat(state.planets) // TODO right now we're making the assumption that planets are always first. Should fix this at some point with an entity ID system insted of indices
                     .concat((state.player ? [state.player] : []))
                     .concat(state.enemies)
                     .concat(state.bullets)
                     .concat(state.collectables)
                     .concat(state.particles)
                     .concat(state.field);

    // Set camera target scale based on the locations of all entities such that we can see all of them
    let maxDist = 0;
    for (let entity of nonparticles) {
        let dist = Math.max(Math.abs(entity.x), Math.abs(entity.y));
        if (dist > maxDist && dist < 10000) {
            maxDist = dist;
        }
    }
    state.camera.targetScale = state.player ? Math.max(2, maxDist / 400) : 5;

    // TODO Attaching behavior
        // If an entity is attached, it should move with that entity
        // Probably need a map of attachment such that we can recursively move all attached entities
        // TODO square this with orbit. How to implement moons?
    let attachmentMap = {};

    // update
    for (let i = 0; i < entities.length; ++i) {
        let entity = entities[i];
        if (entity.exists && entity.update) {
            entity.update(entity, timeMs, timeDelta);
            if (entity.attach != undefined) {
                attachmentMap[entity.attach] = attachmentMap[entity.attach] || [];
                attachmentMap[entity.attach].push(entities[i]);
            }
        }
    }

    // bullets
    for (let i = 0; i < state.bullets.length; ++i) {
        let bullet = state.bullets[i];
        if (bullet.exists) {
            bulletUpdate(bullet, entities, state.planets);
        }
    }

    let time = Date.now();
    for (let planet of state.planets) {
        if (!planet.exists && planet.orbit === -1) {
            // Planet was just destroyed
            // Remove planet gravity from every point in field
            // TODO make this dynamic?

            // take timestamp
            time = Date.now();

            for (let i = 0; i < state.gravityField.values.length; i++) {
                let gravVec = computeGravityForce(getFieldPositionFromIndex(state.gravityField, i), planet);
                state.gravityField.values[i].x -= gravVec.x;
                state.gravityField.values[i].y -= gravVec.y;
            }

            // log time delta
            console.log("Time to update gravity field: " + (Date.now() - time) + "ms" + " for each planet this would be " + (Date.now() - time) * state.planets.length + "ms");
        }
    }

    // physics
    for (let i = 0; i < entities.length; ++i) {
        let entity = entities[i];
        if (entity.exists) {
            physicsUpdate(entity, entities, state.planets, attachmentMap[i], state.gravityField);
        }
    }

    // cull nonexistent entities from lists
    for (const list of [state.particles, state.planets, state.collectables, state.bullets]) {
        for (let i = list.length - 1; i >= 0; --i) {
            if (!list[i].exists) {
                list.splice(i, 1);
            }
        }
    }
    if (state.player && !state.player.exists) {
        state.player = undefined;
    }
}

function randomInt(loInclusive, hiExclusive)
{
    let min = Math.floor(loInclusive);
    let max = Math.floor(hiExclusive);
    return Math.floor(Math.random() * (max - min) + min);
}

var timeSinceLastUpdate = 0;
var previousTimeMs = 0;
let frameTimestamps = [];
let fpsCount = 60;
function gameLoop(timeElapsed)
{
    window.requestAnimationFrame(gameLoop);

    let timeDelta = timeElapsed - previousTimeMs;
    timeSinceLastUpdate += timeDelta;
    previousTimeMs = timeElapsed;

    // TODO add this back in without breaking particles
    if (timeSinceLastUpdate > frameTime * 3) {
        timeSinceLastUpdate = frameTime;
    }

    while (timeSinceLastUpdate >= frameTime) {
        timeSinceLastUpdate -= frameTime;
        update(timeElapsed, frameTime);

        frameTimestamps.push(timeElapsed);
        if (frameTimestamps.length > 10) {
            frameTimestamps.shift();

            // take average as fps count
            let sum = 0;
            for (let i = 1; i < frameTimestamps.length; ++i) {
                sum += frameTimestamps[i] - frameTimestamps[i - 1];
            }
            fpsCount = 1000 / (sum / frameTimestamps.length);
        }

        if (fpsCount < 60) {
            // Remove some of the particles
            let numParticles = state.particles.length;
            let numToRemove = Math.floor(numParticles * (0.01 * (60 / fpsCount)));
            for (let i = 0; i < numToRemove/2; ++i) {
                state.particles[i].exists = false;
                state.particles[numParticles - 1 - i].exists = false;
            }
        }
    }

    state.timestamp += timeDelta;
    renderShaders(state);
    render(state);
}

// Initialize mouse events on document
function initEvents() {
    // Mouse move
    document.addEventListener('mousemove', function (event) {
        // Get mouse position
        let mouseWorldPos = cameraToWorld(event.clientX, event.clientY);
        // Store in state.input
        state.input.mouseX = mouseWorldPos.x;
        state.input.mouseY = mouseWorldPos.y;
    });

    // Mouse down
    document.addEventListener('mousedown', function (event) {
        state.input.mouseIsDown = true;
    });

    // Mouse up
    document.addEventListener('mouseup', function (event) {
        state.input.mouseIsDown = false;
    });

    // Key event detecting w a s and d
    document.addEventListener('keydown', function (event) {
        if (event.key == 'w') {
            state.input.wPressed = true;
        }
        if (event.key == 's') {
            state.input.sPressed = true;
        }
        if (event.key == 'e') {
            state.input.ePressed = true;
        }
        if (event.key == 'd') {
            state.input.dPressed = true;
        }
        // a
        if (event.key == 'a') {
            state.input.aPressed = true;
        }
        // r
        if (event.key == 'r') {
            state.input.rPressed = true;
        }
        // spacebar
        if (event.keyCode == 32) {
            state.input.spacePressed = true;
        }

        if (event.key == 'p') {
            if (state.player) {
                explodeEntity(state.player);
            } else {
                explodeEntity(state.planets[state.planets.length - 1]);
            }
        }

        // r to restart
        if (event.key == 'r') {
            startGame();
        }

        if (event.key == 'o') {
            renderWarping = !renderWarping;
        }

        if (event.key == '.') {
            currentLevel++;
            if (currentLevel >= levels.length) {
                currentLevel = 0;
            }
            startGame();
        }

        if (event.key == ',') {
            currentLevel--;
            if (currentLevel < 0) {
                currentLevel = levels.length - 1;
            }
            startGame();
        }
    });

    // Key up event
    document.addEventListener('keyup', function (event) {
        if (event.key == 'w') {
            state.input.wPressed = false;
        }
        if (event.key == 's') {
            state.input.sPressed = false;
        }
        if (event.key == 'e') {
            state.input.ePressed = false;
        }
        if (event.key == 'd') {
            state.input.dPressed = false;
        }
        // a
        if (event.key == 'a') {
            state.input.aPressed = false;
        }
        // r
        if (event.key == 'r') {
            state.input.rPressed = false;
        }
        // spacebar
        if (event.keyCode == 32) {
            state.input.spacePressed = false;
        }
    });
}

function start()
{
    // Get #gamecanvas
    canvas = document.getElementById("gamecanvas");
    // Get 2d context from canvas
    context = canvas.getContext("2d");

    // Get #webglcanvas
    webglcanvas = document.getElementById("webglcanvas");
    // Get webgl context from canvas
    gl = webglcanvas.getContext("webgl");

    initEvents();
    initShaders();
    initAudio();
    startGame();

    window.requestAnimationFrame(gameLoop);
}
