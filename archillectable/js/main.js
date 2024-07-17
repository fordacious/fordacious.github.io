// TODO convert this into architecture / hand tracking webxr (or not) game
// TODO take threejs fps and webxr samples and combine them
    // Might be time to split out hydrogen as an engine (or rather framework)

// XR architecture + Hand interaction game. (Playable on desktop and mobile too). That or PD / DE style fps? Use webXR (aframe, 3js) or existing engine (vrchat?)
    // Explore fractal? Non-eucliden / impossible geometry? Ineffable temples?
    // Game about scale and awe (VR is good for scale)
    // Dreams? The awe of dreams?

// DREEEEEEEEEEEEEEEEAMS. The beauty of dreams.

import * as THREE from 'three';

import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

import { Octree } from 'three/addons/math/Octree.js';
import { OctreeHelper } from 'three/addons/helpers/OctreeHelper.js';

import { Capsule } from 'three/addons/math/Capsule.js';

import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

window.onload = start;

let canvas = null;
let context = null;
let state = null;

// Threejs stuff
let mouseX = 0, mouseY = 0;

let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;

const frameTime = 1000 / 60;

const canvasDesignWidth = 640;

const clock = new THREE.Clock();
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.1, 1000 );
const fillLight1 = new THREE.HemisphereLight( 0x8dc1de, 0x00668d, 1.5 );
const directionalLight = new THREE.DirectionalLight( 0xffffff, 2.5 );
const container = document.getElementById('gamediv');
const renderer = new THREE.WebGLRenderer( { antialias: true } );
const GRAVITY = 30;
const NUM_SPHERES = 100;
const SPHERE_RADIUS = 0.2;
const STEPS_PER_FRAME = 5;
const sphereGeometry = new THREE.IcosahedronGeometry( SPHERE_RADIUS, 5 );
const sphereMaterial = new THREE.MeshLambertMaterial( { color: 0xdede8d } );
const spheres = [];
let sunSphere = null;
const worldOctree = new Octree();
const loader = new GLTFLoader().setPath('./models/gltf/');

function dist(point1, point2) {
    return Math.sqrt(Math.pow(point1.x - point2.x, 2) + Math.pow(point1.y - point2.y, 2));
}

function mag(vector) {
    return Math.sqrt(Math.pow(vector.x, 2) + Math.pow(vector.y, 2));
}

function makeEntity(props) {
    const entity = {
        entityType: "entity",
        exists: true,
        update: (() => {}),
        renderState: null,
    };
    for (const [key, value] of Object.entries(props)) {
        entity[key] = value;
    }
    return entity;
}

function randomColor() {
    return "#" + Math.floor(Math.random() * 16777215).toString(16);
}

function initState() {
    state = {
        gameOver: false,
        player: makeEntity({
            entityType: "player",
            position: new THREE.Vector3(),
            direction: new THREE.Vector3(),
            velocity: new THREE.Vector3(),
            grounded: false,
            update: playerUpdate,
            collider: new Capsule(new THREE.Vector3(0, 0.35, 0), new THREE.Vector3(0, 1, 0), 0.35)
        }),
        input: {
            wPressed: false,
            sPressed: false,
            aPressed: false,
            dPressed: false,
            ePressed: false,
            rPressed: false,
            spacePressed: false
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
    // TODO camera
    renderer.render( scene, camera );
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

// Map x and y to index of 1000 x 1000 array
function pointToGravMapIndex(x, y) {
    return Math.floor(x) + Math.floor(y) * 1000;
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

function physicsUpdate(entity, entities, timeDelta) {
    let damping = Math.exp(-4 * timeDelta) - 1;
    if (!entity.grounded) {
        entity.velocity.y -= GRAVITY * timeDelta;
        // small air resistance
        damping *= 0.1;
    }

    entity.velocity.addScaledVector(entity.velocity, damping);

    const deltaPosition = entity.velocity.clone().multiplyScalar(timeDelta);
    entity.collider.translate(deltaPosition);

    entityCollisions(entity);

    if (entity === state.player) {
        camera.position.copy(entity.collider.end);
    }
}

function CameraScaleRatio() {
    return canvas.width / canvasDesignWidth;
}

function removeEntity(e) {
    e.exists = false; // won't be updated in update()
}

function entityCollisions(entity) {
    const result = worldOctree.capsuleIntersect(entity.collider);
    entity.grounded = false;
    if (result) {
        entity.grounded = result.normal.y > 0;
        if (!entity.grounded) {
            entity.velocity.addScaledVector(result.normal, - result.normal.dot(entity.velocity));
        }
        entity.collider.translate(result.normal.multiplyScalar(result.depth));
    }
}

function getForwardVector(entity) {
    camera.getWorldDirection( entity.direction );
    entity.direction.y = 0;
    entity.direction.normalize();

    return entity.direction;
}

function getSideVector(entity) {
    camera.getWorldDirection( entity.direction );
    entity.direction.y = 0;
    entity.direction.normalize();
    entity.direction.cross( camera.up );

    return entity.direction;
}

function playerUpdate(entity, timeMs, timeDelta) {
    // gives a bit of air control
    const speedDelta = timeDelta * (entity.grounded ? 25 : 8);
    if (state.input.wPressed) {
        entity.velocity.add(getForwardVector(entity).multiplyScalar(speedDelta));
    }
    if (state.input.sPressed) {
        entity.velocity.add(getForwardVector(entity).multiplyScalar(-speedDelta));
    }
    if (state.input.aPressed) {
        entity.velocity.add(getSideVector(entity).multiplyScalar(-speedDelta));
    }
    if (state.input.dPressed) {
        entity.velocity.add(getSideVector(entity).multiplyScalar(speedDelta));
    }
    if (entity.grounded) {
        if (state.input.spacePressed) {
            entity.velocity.y = 15;
        }
    }
}

let targetBox = 0;
let speed = 0.5;
function update (timeMs, timeDelta) {
    // Add all the stuff to entities list
    var entities = [state.player];

    // update
    for (let i = 0; i < entities.length; ++i) {
        let entity = entities[i];
        if (entity.exists) {
            entity.update(entity, timeMs, timeDelta);
        }
    }

    // physics
    for (let i = 0; i < entities.length; ++i) {
        let entity = entities[i];
        if (entity.exists) {
            physicsUpdate(entity, entities, timeDelta);
        }
    }

    // cull nonexistent entities from lists
    for (const list of []) {
        for (let i = list.length - 1; i >= 0; --i) {
            if (!list[i].exists) {
                list.splice(i, 1);
            }
        }
    }
}

function randomInt(loInclusive, hiExclusive) {
    let min = Math.floor(loInclusive);
    let max = Math.floor(hiExclusive);
    return Math.floor(Math.random() * (max - min) + min);
}

var timeSinceLastUpdate = 0;
var previousTimeMs = 0;
function gameLoop(timeElapsed) {
    let timeDelta = timeElapsed - previousTimeMs;
    timeSinceLastUpdate += timeDelta;
    previousTimeMs = timeElapsed;

    // Set sub position to be based on the current time
    const sunDistance = 30;
    // Should take 10 minutes per cycle
    const tenMinutesInMilliseconds = 10 * 60 * 1000;
    const sunSpeed = 1 / tenMinutesInMilliseconds;
    let time = timeElapsed * sunSpeed;
    let sunX = Math.cos(time) * sunDistance;
    let sunY = Math.sin(time) * sunDistance;
    let sunZ = Math.sin(time) * (sunDistance / 5);
    directionalLight.position.set( sunX, sunY, sunZ );
    directionalLight.castShadow = true;

    // RGB sky color based on time of day
    let r = Math.max(0, 0.2 + Math.sin(time) * 0.4);
    let g = Math.max(0.2 + Math.sin(time) * 0.6, 0);
    let b = Math.max(0.2 + Math.sin(time) * 0.8, 0);

    const skyColor = new THREE.Color();
    skyColor.setRGB(r, g, b);
    scene.background = skyColor;
    directionalLight.color.set(skyColor);

    // set the sunSphere color based on the time of day
    sunSphere.material.color = skyColor;

    // Move the sunsphere to where the sun light is
    sunSphere.position.set( sunX, sunY, 0 );

    // Dont cast shadows if the sunsphere is below the horizon
    directionalLight.castShadow = (sunY > -5);
    //directionalLight.shadow.camera.top = sunY + 5;

    // set fog color to sky color but more gray
    scene.fog.color = new THREE.Color().lerpColors(skyColor, new THREE.Color(0x556677), 0.5);
    scene.fog.near = 1;
    scene.fog.far = 200;

    if (timeSinceLastUpdate > frameTime * 3) {
        timeSinceLastUpdate = frameTime;
    }

    while (timeSinceLastUpdate >= frameTime) {
        timeSinceLastUpdate -= frameTime;
        update(timeElapsed, frameTime / 1000);
    }
    render(state);
}

// Initialize mouse events on document
function initEvents() {
    // Mouse move
    document.addEventListener('mousemove', function (event) {
        // // Store in state.input
        // state.input.mouseX = event.clientX;
        // state.input.mouseY = event.clientY;
        if (document.pointerLockElement === document.body) {
            camera.rotation.y -= event.movementX / 500;
            camera.rotation.x -= event.movementY / 500;
        }
    });

    // Mouse down
    document.addEventListener('mousedown', function (event) {
        document.body.requestPointerLock();
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

function initThreejs() {
    scene.background = new THREE.Color( 0x88ccee );
    scene.fog = new THREE.Fog( 0x88ccee, 0, 50 );

    camera.rotation.order = 'YXZ';

    fillLight1.position.set( 2, 1, 1 );
    scene.add( fillLight1 );

    directionalLight.position.set( - 1000, 0, 0 );
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.near = 0.01;
    directionalLight.shadow.camera.far = 500;
    directionalLight.shadow.camera.right = 30;
    directionalLight.shadow.camera.left = - 30;
    directionalLight.shadow.camera.top  = 30;
    directionalLight.shadow.camera.bottom = - 30;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.radius = 4;
    directionalLight.shadow.bias = - 0.00006;
    scene.add( directionalLight );

    // Add a sphere mesh and material to represent the sun
    const sunGeometry = new THREE.SphereGeometry( 1, 32, 32 );
    const sunMaterial = new THREE.MeshBasicMaterial( { color: 0xffffee } );
    sunSphere = new THREE.Mesh( sunGeometry, sunMaterial );
    sunSphere.position.set( 0, 0, 0 );
    sunSphere.castShadow = false;
    sunSphere.receiveShadow = false;
    scene.add( sunSphere );

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setAnimationLoop(gameLoop);
    renderer.xr.enabled = true;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.VSMShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    container.appendChild(renderer.domElement);

    let mouseTime = 0;
    //loader.load('collision-world.glb', (gltf) => {
    loader.load('test.glb', (gltf) => {
        scene.add( gltf.scene );
        worldOctree.fromGraphNode( gltf.scene );
        gltf.scene.traverse(child => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                if ( child.material.map ) {
                    child.material.map.anisotropy = 4;
                }
            }
        });

        const helper = new OctreeHelper( worldOctree );
        helper.visible = false;
        scene.add( helper );

        const gui = new GUI( { width: 200 } );
        gui.add( { debug: false }, 'debug' )
            .onChange( function ( value ) {
                helper.visible = value;
            });
    });

    renderer.setSize(window.innerWidth, window.innerHeight);
    window.addEventListener('resize', onWindowResize);
}

function onWindowResize() {
    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
}

function start() {
    initState();
    initEvents();
    initThreejs();
}
