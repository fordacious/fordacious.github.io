// TODO convert this into architecture / hand tracking webxr (or not) game
// TODO take threejs fps and webxr samples and combine them
    // Might be time to split out hydrogen as an engine (or rather framework)

// XR architecture + Hand interaction game. (Playable on desktop and mobile too). That or PD / DE style fps? Use webXR (aframe, 3js) or existing engine (vrchat?)
    // Explore fractal? Non-eucliden / impossible geometry? Ineffable temples?
    // Game about scale and awe (VR is good for scale)
    // Dreams? The awe of dreams?

// DREEEEEEEEEEEEEEEEAMS. The beauty of dreams.

// ~~~ Vibes vibes vibes ~~~

// TODO for now turn into abstract ball bouncing game where you clone you'reself
// Ball comes out
// You bounce ball with paddles via clones into goal
// How to make difficult / interesting?
// Can make meaningful
// Env should be abstract initially. Quick to model in blender. Could even just describe in code
// Could make it mixed reality on surfaces? Would be a good spatial entities test. Maybe later, and do VR for now.
// Score on number of hops and speed to completion (encourage whacking the shit out of the ball but also being accurate)


// Surround stage with reflective water. Pink sunset clouds (shader?). Black beams

// Should be able to translate and rotate your clones after they're created.
// Could make this a multiplayer turn based cooperative effort.

// TODO
    // Implement start button
    // Implement ability to record
    // Implement VR movement
    // Implement map loading
    // Fix up graphics
        // e.g. https://sbedit.net/8da1fa474184adede50e8d0cba075cda0739dd2e
    // Fit and finish

import * as THREE from 'three';

import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { Octree } from 'three/addons/math/Octree.js';
import { OctreeHelper } from 'three/addons/helpers/OctreeHelper.js';
import { Capsule } from 'three/addons/math/Capsule.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import {VRButton} from 'three/addons/webxr/VRButton.js';

window.onload = start;

let canvas = null;
let state = null;

const frameTime = 1000 / 60;

const canvasDesignWidth = 1280;

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

let sunSphere = null;
const worldOctree = new Octree();
const loader = new GLTFLoader().setPath('./models/gltf/');

function makeEntity(props) {
    const entity = {
        entityType: "entity",
        position: new THREE.Vector3(),
        direction: new THREE.Vector3(),
        velocity: new THREE.Vector3(),
        exists: true,
        update: (() => {}),
        renderState: null,
    };
    for (const [key, value] of Object.entries(props)) {
        entity[key] = value;
    }
    return entity;
}

function makeBall (pos, radius) {
    const sphereGeometry = new THREE.IcosahedronGeometry( radius, 5 );
    const sphereMaterial = new THREE.MeshLambertMaterial( { color: 0xdede8d } );

    let sphere = new THREE.Mesh( sphereGeometry, sphereMaterial );
    sphere.position.set( state.spawn.position );
    sphere.castShadow = true;
    sphere.receiveShadow = true;
    scene.add( sphere );

    let entity = makeEntity({
        entityType: "ball",
        update: ballUpdate,
        radius: radius,
        collider: new THREE.Sphere( pos, SPHERE_RADIUS ),
        mesh: sphere,
    });

    // TODO base on properties of ball start node in blender
    //const impulse = 45;
    //entity.velocity.copy( state.start.direction ).multiplyScalar( impulse );
    //entity.velocity.addScaledVector( playerVelocity, 2 );

    return entity;
}

function initState() {
    state = {
        gameOver: false,
        player: makeEntity({
            entityType: "player",
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
        round: 0,
        recordings: [],
        currentRecording: [],
        timeToSpawn: 5000,
        roundTimeLimit: 15000,
        ball: null,
        start: null,
        end: null,
        spawn: null,
    };
}

function startNextRound() {
    console.log("next round started");
    // TODO remove current ball
    // TODO save recording
    state.round += 1;
    state.timeToSpawn = 5000; // TODO defaults for these
    state.roundTimeLimit = 15000;

    // TODO remove old ball
    scene.remove(state.ball.mesh);
    state.ball = null;
}

function ballDead() {
    // TODO detect ball is grounded, or lost
    // Should not just disappear on round time limit exceeded
    return state.roundTimeLimit < 0;
}

function render(state) {
    renderer.render( scene, camera );
}

function physicsUpdate(entity, entities, timeDelta) {
    if (entity == state.player) {
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

        camera.position.copy(entity.collider.end);
    } else {
        let sphere = entity;

        sphere.collider.center.addScaledVector( sphere.velocity, timeDelta );

        // TODO clean up this mess
        const result = worldOctree.sphereIntersect( sphere.collider );

        if ( result ) {

            sphere.velocity.addScaledVector( result.normal, - result.normal.dot( sphere.velocity ) * 1.5 );
            sphere.collider.center.add( result.normal.multiplyScalar( result.depth ) );

        } else {

            sphere.velocity.y -= GRAVITY * timeDelta;

        }

        const damping = Math.exp( - 1.0 * timeDelta ) - 1;
        sphere.velocity.addScaledVector( sphere.velocity, damping );

        //entityCollisions(entity);
    }
}

function removeEntity(e) {
    e.exists = false; // won't be updated in update()
}

function entityCollisions(entity) {
    const result = entity.entityType == "player"
                   ? worldOctree.capsuleIntersect(entity.collider)
                   : worldOctree.sphereIntersect( entity.collider );
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

function ballUpdate (entity, timeMs, timeDelta) {
    // TODO collide with end?
    entity.mesh.position.copy( entity.collider.center );
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

function spawnBall () {
    console.log("ball spawned");    
    state.ball = makeBall(new THREE.Vector3(state.start.position.x, state.start.position.y, state.start.position.z), 0.2);
}

function update (timeMs, timeDelta) {
    state.roundTimeLimit -= timeDelta * 1000;
    state.timeToSpawn -= timeDelta * 1000;

    // Should probably base this on a player intiated action.
    // Can also then ensure that the player is in a specific place (where they have to hit the button)
    // Starting and stopping a recording should also be a separate action?
    if (state.roundTimeLimit < 0) {
        startNextRound();
    }

    if (state.timeToSpawn < 0 && state.ball == null) {
        spawnBall();
    }

    // TODO ball collsion with goal

    // TODO record player pose at time and add to current recording

    // Add all the stuff to entities list
    var entities = [state.player];

    if (state.ball) {
        entities.push(state.ball);
    }

    // update
    for (let i = 0; i < entities.length; ++i) {
        let entity = entities[i];
        if (entity.exists && entity.update) {
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

var timeSinceLastUpdate = 0;
var previousTimeMs = 0;
function gameLoop(timeElapsed) {
    let timeDelta = timeElapsed - previousTimeMs;
    timeSinceLastUpdate += timeDelta;
    previousTimeMs = timeElapsed;

    //const sunStartDelta = 1000;
    const sunStartDelta = 0;
    // Set sub position to be based on the current time
    const sunDistance = 30;
    // Should take 10 minutes per cycle
    const tenMinutesInMilliseconds = 10 * 60 * 1000;
    const sunSpeed = 1 / tenMinutesInMilliseconds;
    let time = timeElapsed * sunSpeed + sunStartDelta;
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

    // vr controllers
    const session = renderer.xr.getSession();
    if (session) {
        state.aPressed = false;
        state.dPressed = false;
        state.wPressed = false;
        state.sPressed = false;
        for (let i = 0; i < session.inputSources.length; i++) {
            let source = session.inputSources[i];
            // TODO not working?
            // TODO want teleport mechanic as well
            if (source.gamepad.axes.size >= 1) {
                // Set state input based on the thumbstick state
                if (source.gamepad.axes[0] < -0.5) {
                    state.aPressed = true;
                } else if (source.gamepad.axes[0] > 0.5) {
                    state.dPressed = true;
                }
                if (source.gamepad.axes[1] < -0.5) {
                    state.wPressed = true;
                } else if (source.gamepad.axes[1] > 0.5) {
                    state.sPressed = true;
                }
            }
        }
    }

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

    // TODO proper sun and sky ala https://sbedit.net/8da1fa474184adede50e8d0cba075cda0739dd2e#L46-L46
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
    document.body.appendChild(VRButton.createButton(renderer));
    container.appendChild(renderer.domElement);

    loader.load('testlevel2.glb', (gltf) => {
        scene.add( gltf.scene );

        // TODO needs to be more generic
        state.start = gltf.scene.getObjectByName( 'START' );
        state.spawn = gltf.scene.getObjectByName( 'SPAWN' );
        state.end = gltf.scene.getObjectByName( 'END' );
        state.startButton = gltf.scene.getObjectByName( 'BUTTON' );

        gltf.scene.remove(state.spawn);
        gltf.scene.remove(state.start);
        //gltf.scene.remove(start);
        //gltf.scene.remove(end);

        // Collider is at 0 initially
        // TODO this isn't working for VR?
        state.player.collider.translate(state.spawn.position);

        worldOctree.fromGraphNode( gltf.scene );
        gltf.scene.traverse(child => {
            if (child.isMesh) {
                if (!child.material.name.toUpperCase().startsWith("GLASS")) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
                if ( child.material.map ) {
                    child.material.map.anisotropy = 4;
                }
            } else if (child.isLight) {
                child.castShadow = true
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
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
}

function start() {
    initState();
    initEvents();
    initThreejs();
}
