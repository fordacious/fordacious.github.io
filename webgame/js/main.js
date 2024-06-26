/*
Need start screen?
Fix space scrolling
    Add instructions to start screen
Fix dotted line appearing for intersecting edges
Tutorial / conveyance
Enemy clarity / mechanical clarity
Legs are kinda backwards
Pickup animation (lines radiating from player)
    or at least some arm movement
Larger enemies should do more knockback but move slower
juice, particles, sfx, music?

Small enemies eat your food?
*/

window.onload = start;

let TEST_AutomaticPickup = true;
let TEST_ThrowAndCutWithMouse = true;

let canvas = null;
let context = null;
let state = null;

const frameTime = 1000 / 60;
const gravity = 0.5;
const terminalVelocity = 7;
const nodeSelectionRadius = 50;
const edgeSelectionRadius = 15;
const webShotRadius = 150;
const playerActionCooldownTime = 500;
const playerStunTime = 1000;
const playerPickupRadius = 16;
const playerJumpCooldown = 100;
const jumpXForce = 2.5;
const jumpYForce = 5;
const stunPower = 5;
const throwForce = 10;
const airAccel = 0.05;

const generatedNodeRequiredDistance = 50;

const nestBaseRadius = 15;
const nestRadiusInc = 4;
const scoreMax = 20;

const enemySightRadius = 120;
const enemyDefaultMovespeed = 1;
const enemyWanderMovespeed = 0.7;
const enemyRadii = [5,8];
const ENEMY_SMOL = 0;
const ENEMY_BIG = 1;
const ENEMY_BABBY = 2;

const ITEM_FOOD = 0;
const ITEM_POWERUP = 0;

const mapWidth = 2000;
const mapHeight = mapWidth;
const mapEndZone = mapHeight / 2 + 200;

const canvasDesignWidth = 640;

const gameOverCinematicData = {
    startTime: null,
    keyframes: [
        {duration: 3000, x:0, y: 0, targetScale: 0.75, zoomEaseFactor: 0.125, easeFactor: 0.125, easeMode: "quadtratic"},
        {duration: 5000, x:0, y: 0, targetScale: 1, zoomEaseFactor: 0.01, easeFactor: 0.01, easeMode: "quadtratic"},
        {duration: 20000, x: 0, y: 0, targetScale: 4, zoomEaseFactor: 0.001, easeFactor: 0.001, easeMode: "quadtratic"}
    ],
}

function makeNode(x,y,edges)
{
    return {x,y,edges: edges != undefined ? edges : []};
}

const mapData = (() => {
    let mapData = [
        makeNode(0,0),
        makeNode(100,0),
        makeNode(75,75),
        makeNode(0,100),
        makeNode(-75,75),
        makeNode(-100,0),
        makeNode(-75,-75),
        makeNode(0,-100),
        makeNode(75,-75)
    ];

    // connect them all to center
    for (let i = 1; i < mapData.length; ++i) {
        connectNode(mapData, mapData[0], mapData[i]);
    }

    // Generate random map data
    for (let i = 0; i < 100 * (mapWidth * mapHeight / 1000000); i++) {
        let node = makeNode(Math.random() * mapWidth - mapWidth / 2, Math.random() * mapHeight - mapHeight / 2);
        // If the node is too close to other nodes, skip it
        let canMakeEdgeThrough = false;
        let tooClose = false;
        for (let j = 0; j < mapData.length; j++) {
            if (node != mapData[j] && dist(node, mapData[j]) < generatedNodeRequiredDistance) {
                tooClose = true;
                break;
            }

            // Skip if it is possible an edge can pass through it
            for (let k = 0; k < mapData[j].edges.length; k++) {
                if (circleLineSegmentCollision(node, generatedNodeRequiredDistance, mapData[j], mapData[j].edges[k])) {
                    canMakeEdgeThrough = true;
                    break;
                }
            }
        }
        if (!tooClose && !canMakeEdgeThrough) {
            mapData.push(node);
        }
    }

    // Make 33 random connections between nodes close nodes
    let numConnections = 0;
    let numIterations = 0;
    while (numConnections < 33 || numIterations < 1000000) {
        numIterations++;
        let node1 = mapData[randomInt(0, mapData.length)];
        for (let j = 0; j < 10; j++) {
            let node2 = mapData[randomInt(0, mapData.length)];
            if (dist(node1, node2) < 100) {
                if (connectNode(mapData, node1, node2)) {
                    numConnections++;
                }
                break;
            }
        }
    }

    return mapData;
})();

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
function worldToCamera(x, y) {
    return {x: (x - state.camera.x) / state.camera.scale + state.camera.width / 2,
            y: (y - state.camera.y) / state.camera.scale + state.camera.height / 2};
}

function makeEntity(props) {
    const entity = {
        entityType: "entity",
        exists: true,
        x: 0,
        y: 0,
        velocity: {x:0, y:0},
        acceleration: {x:0, y:0},
        hasGravity: true,
        radius: 10,
        currentNode: null,
        currentEdge: null,
        cooldown: 0,
        stunTimer: 0,
        jumpTimer: 0,
        update: (() => {}),
        renderState: null,
    };
    for (const [key, value] of Object.entries(props)) {
        entity[key] = value;
    }
    return entity;
}

function SpiderRenderState() {
    return {
        head: {x:3, y: TEST_ThrowAndCutWithMouse ? 0 : -1},
        body: {x: -1, y: 0},
        // TODO eyes?
        // Left, right, front, back
        // First 2 are front left and front right arms etc...
        legPositions:[{x:4,y:-10},{x:4,y:10},{x:2,y:-10},{x:2,y:10},{x:0,y:-10},{x:0,y:10},{x:-2,y:-10},{x:2,y:10}],
        legTargets:[{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0}],
        legRadius: 2,
        legVelocities: [{x: 0, y: 0}, {x: 0, y: 0}, {x: 0, y: 0}, {x: 0, y: 0}, {x: 0, y: 0}, {x: 0, y: 0},{x: 0, y: 0},{x: 0, y: 0}],
        legAccel: 0.11,
        legKneeLength: 10,
        legLength: 15,
        legUpdateIndex: 0,
        isHoldingItem: false,
        jumpTimer: 0, // For jumping animation
        throwTimer: 0, // For throwing animation
        webInteractionTimer: 0, // For web interaction animation
        lastKnownPosition: null,
        lastKnownDirection: {x: 0, y: 0 },
    };
}

function initState() {
    state = {
        gameOver: false,
        camera: {x: 0, y: 0, width:canvas.width, height:canvas.height, scale: 2.5, targetScale: 1, easeFactor: 0.1, zoomEaseFactor: 0.01, easeMode: "quadtratic"},
        //camera: {x: 0, y: 0, width:canvas.width, height:canvas.height, scale: 0.2, targetScale: 1, easeFactor: 0.1, zoomEaseFactor: 0.01, easeMode: "quadtratic"},
        map: mapData,
        player: makeEntity({entityType: "player", moveSpeed: 2, radius: 6, update: playerUpdate, item: null, renderState:SpiderRenderState()}),
        currentNodeSelection: null,
        isRunning: false,
        input: {
            wPressed: false,
            sPressed: false,
            aPressed: false,
            dPressed: false,
            ePressed: false,
            rPressed: false,
            spacePressed: false,
            mousePosWorld: {x: 0, y: 0},
            mouseWasPressed: false,
        },
        enemies: [],
        items: [],
        flies: [],
        enemyTimeSpawnedMs: performance.now(),
        enemyTimeUntilNextSpawnMs: 1000,
        flyTimeSpawnedMs: performance.now(),
        flyTimeUntilNextSpawnMs: 1000,
        score: 0,
    };

    // spawn some enemies
    for (let i = 0; i < 10; ++i) {
        spawnEnemy();
    }

    for (let i = 0; i < 10; ++i) {
        spawnFood();
    }
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

function connectNode(mapData, node1, node2) {
    if (node1 == node2) {
        return false;
    }

    // return false if already connected
    if (node1.edges.includes(node2)) {
        return false;
    }

    // Check connection is duplicate
    for (let i = 0; i < node1.edges.length; i++) {
        if (node1.edges[i].node == node2) {
            return false;
        }
    }

    // Return false if edge will cross over an existing edge
    for (let i = 0; i < mapData.length; i++) {
        for (let j = 0; j < mapData[i].edges.length; j++) {
            let node3 = mapData[i];
            let node4 = mapData[i].edges[j];
            if (node1 != node3 && node1 != node4 && node2 != node3 && node2 != node4) {
                if (lineIntersects(node1, node2, mapData[i], mapData[i].edges[j])) {
                    return false;
                }
            }
        }
    }

    node1.edges.push(node2);
    node2.edges.push(node1);
    return true;
}

function disconnectNodes(node1, node2) {
    node1.edges.splice(node1.edges.indexOf(node2), 1);
    node2.edges.splice(node2.edges.indexOf(node1), 1);
}

function render(timeElapsed) {
    let width = canvas.width;
    let height = canvas.height;
    // Clear context
    context.clearRect(0, 0, width, height);
    // Set awesome canvas background
    // linear gradient from #333333 to #444444
    let grdcoords1 = worldToCamera(-200, -200);
    let grdcoords2 = worldToCamera(width - 500, height - 400);
    let grd = context.createLinearGradient(grdcoords1.x, grdcoords1.y, grdcoords2.x, grdcoords2.y);
    grd.addColorStop(0, "#333333");
    grd.addColorStop(1, "#444444");
    context.fillStyle = grd;
    context.fillRect(0, 0, width, height);
    renderMap(timeElapsed);

    // Render mouse cursor

    // TODO render behind gradient?
    // TODO render hint for throwing item
    // TODO render hint for creating web
    // TODO render hint for cutting web
    // context push state
    context.save();
    // drop shadow on circle
    context.shadowBlur = 10;
    context.shadowColor = "#000000";
    context.shadowOffsetX = 0;
    context.shadowOffsetY = 0;
    drawCircle({x:state.input.mousePosWorld.x, y: state.input.mousePosWorld.y}, 5 * state.camera.scale, "#EEEEEE");
    context.restore();
}

function renderMap (timeElapsed) {
    // Render nest (behind)
    //context.globalAlpha = 0.2;
    drawCircle({x:0,y:0}, nestRadius(), "#ffff00");
    //context.globalAlpha = 1.0;

    var renderedWebHints = false;
    //state.edgeToDelete = state.map[3].edges[0];
    if (TEST_ThrowAndCutWithMouse) {
        if (state.edgeToDelete) {
            context.save();
            // drop shadow on circle
            context.shadowBlur = 10;
            context.shadowColor = "#FF0000";
            context.shadowOffsetX = 0;
            context.shadowOffsetY = 0;

            context.beginPath();
            let coords = worldToCamera(state.edgeToDelete.node1.x, state.edgeToDelete.node1.y);
            let coords2 = worldToCamera(state.edgeToDelete.node2.x, state.edgeToDelete.node2.y);
            context.moveTo(coords.x, coords.y);
            context.lineTo(coords2.x, coords2.y);

            context.strokeStyle = "#FFCCCC";
            context.setLineDash([]);
            context.lineWidth = 2 / state.camera.scale;
            context.stroke();
            context.restore();

            renderedWebHints = true;
        }
    }

    // Render edges first so they're behind nodes
    for (let i = 0; i < state.map.length; i++) {
        let coords = worldToCamera(state.map[i].x, state.map[i].y);
        // Render line from node to all edges
        for (let j = 0; j < state.map[i].edges.length; j++) {
            let edge = state.map[i].edges[j];
            let coords2 = worldToCamera(edge.x, edge.y);
            context.beginPath();
            context.moveTo(coords.x, coords.y);
            context.lineTo(coords2.x, coords2.y);
            // Solid black line
            context.strokeStyle = "#cccccc";
            // Clear line dash
            context.setLineDash([]);
            context.lineWidth = 1 / state.camera.scale;
            context.stroke();
        }
    }

    // Render nodes
    for (let i = 0; i < state.map.length; i++) {
        const node = state.map[i];
        const color = state.currentNodeSelection == node ? "#44bbff"
                          : state.player.currentNode == node ? "#ffeeee"
                          //: i == 0 ? "orange" // nest
                          : "#cccccc";
        drawCircle(node, node == state.player.currentNode || node == state.currentNodeSelection ? 10 : 8, color)
    }

    // TODO this is rendering even if it would intersect another edge, which is not allowed
    // render line from player currentNode to currentNodeSelection if currentNodeSelection is not null
    if (state.currentNodeSelection != null && state.player.currentNode != null) {
        //if (!TEST_ThrowAndCutWithMouse || state.player.item == null) {

            let intersects = false;
            // for each edge, check if the line intersects with it
            for (let i = 0; i < state.map.length && !intersects; i++) {
                let node1 = state.map[i];
                for (let j = 0; j < state.map[i].edges.length && !intersects; j++) {
                    let node2 = state.map[i].edges[j];
                    if (node1 != state.player.currentNode && node1 != state.currentNodeSelection && node2 != state.player.currentNode && node2 != state.currentNodeSelection) {
                        if (lineIntersects(state.player.currentNode, state.currentNodeSelection, node1, node2)) {
                            intersects = true;
                            break;
                        }
                    }
                }
            }

            let distance = dist(state.player.currentNode, state.currentNodeSelection);
            if (!intersects && distance < webShotRadius) {
                context.beginPath();
                let coords1 = worldToCamera(state.player.currentNode.x, state.player.currentNode.y);
                let coords2 = worldToCamera(state.currentNodeSelection.x, state.currentNodeSelection.y);
                context.moveTo(coords1.x, coords1.y);
                context.lineTo(coords2.x, coords2.y);
                // set line style to light gray and dotted
                context.strokeStyle = "fuscous";
                context.setLineDash([5, 15]);
                context.lineWidth = 1 / state.camera.scale;
                context.stroke();

                renderedWebHints = true;
            }
        //}
    }

    // TODO render a circle for the web shot radius

    // TODO implement particle rendering for entity interactions

    renderEntityWithState(state.player, state.player.radius, "cyan", "blue", "turquoise");

    // Render lists of stuff
    const entities = state.enemies.concat(state.items).concat(state.flies);

    for (let i = 0; i < entities.length; ++i) {
        const entity = entities[i];
        if (entity.renderState != null) {
            if (entity.type == ENEMY_SMOL || entity.type == ENEMY_BIG) {
                entity.color = entity.radius == enemyRadii[ENEMY_SMOL] ? "#ff8833" : "red";
                if (entity.radius == enemyRadii[ENEMY_BIG] + 1) {
                    entity.color = "#ff0000";
                } else if (entity.radius == enemyRadii[ENEMY_BIG] + 2) {
                    entity.color = "#ff0044";
                } else if (entity.radius == enemyRadii[ENEMY_BIG] + 3) {
                    entity.color = "#ff0088"
                }
            }
            renderEntityWithState(entity, entity.radius, entity.color, entity.color, entity.color);
        } else {
            drawCircle(entity, entity.radius, entity.color);
        }
    }

    // map end zone
    let gradientStart = worldToCamera(0, -200);
    let gradientEnd = worldToCamera(0, mapEndZone);
    var grd = context.createLinearGradient(gradientStart.x, gradientStart.y, gradientEnd.x, gradientEnd.y);
    grd.addColorStop(0, "transparent");
    grd.addColorStop(1, "black");
    drawRectangle({x:-100000, y:-mapHeight}, 100000 * 2, 100000 * 2, grd);

    // map top
    gradientStart = worldToCamera(0, -2000);
    gradientEnd = worldToCamera(0, 200);
    grd = context.createLinearGradient(gradientStart.x, gradientStart.y, gradientEnd.x, gradientEnd.y);
    grd.addColorStop(0, "#666666");
    grd.addColorStop(1, "transparent");
    drawRectangle({x:-100000, y:-100000}, 100000 * 2, 100000 * 2, grd);
}

// TODO this is just a scale of dir by vec's magnitude, so maybe not needed?
// Rotate vector around origin towards direction vector
function rotateVector(vec, dir) {
    let angle = Math.atan2(dir.y, dir.x);
    let x = vec.x * Math.cos(angle) - vec.y * Math.sin(angle);
    let y = vec.x * Math.sin(angle) + vec.y * Math.cos(angle);
    return {x: x, y: y};
}

// TODO need render state for player
// TODO implement parametric legs for player
// Legs have a target point they ease to in an arcing motion
// When carrying something the player holds his front arms above is head
// When throwing something the player does a throwing motion
// When creating or destroying a web, the player does some kind of animation
// When stunned, the player curls up or flails while rotating
// When falling the player spreads their legs out
// Legs go from the body to the current web
// Player should probably be a navy color with salmon colored eyes
// Should have 2 cute fangs
// When holding an item, it should be pointing towards the direction it would be thrown. TODO Might need an indicator
// TODO indicator for web interaction / web throw radius?
function copyvec(vec) {
    return {x: vec.x, y: vec.y};
}

function updateEntityRenderState(entity) {
    let movementDir = copyvec(entity.velocity);
    if (!entity.velocity) {
        movementDir = {x: 0, y: 0};
    }
    if (entity.velocity.x == 0 && entity.velocity.y == 0 && entity.renderState.lastKnownDirection != null) {
        // TODO if you land and dont move, this will be wrong (will be last velocity value)
        movementDir = copyvec(entity.currentEdge ? subVec(entity.currentEdge.node1, entity.currentEdge.node2) : entity.renderState.lastKnownDirection);
    }

    const currentNode = entity.currentNode;
    const currentEdge = entity.currentEdge;
    // TODO stunTimer, jumpTimer

    for (let i = 0; i < entity.renderState.legPositions.length; i++) {
        let legRowIndex = ((i / 2) - 1);
        if (legRowIndex > 0) {
            legRowIndex *= 2;
        }
        let legPosition = entity.renderState.legPositions[i];
        let legTarget = entity.renderState.legTargets[i];
        let legAdjustment = scaleVector(normalize(movementDir), entity.renderState.legRadius * legRowIndex * 2);
        //let legAdjustment = {x:0, y:0};

        let legTargetDistFromPlayer = dist(entity, legTarget);
        let needUpdateTarget = entity.renderState.legUpdateIndex == i && legTargetDistFromPlayer > entity.renderState.legLength;

        if (needUpdateTarget) {
            if (entity.currentNode) {
                // TODO splay on node
                let vec = {x: entity.currentNode.x, y: entity.currentNode.y};
                vec = addVec(vec, legAdjustment);
                legTarget.x = vec.x;
                legTarget.y = vec.y;
            } else if (entity.currentEdge) {
                // Get player point projected onto current edge
                let legSnapPoint = projectPointOntoLine(entity, currentEdge.node1, currentEdge.node2);

                let vec = addVec(legSnapPoint, legAdjustment);
                legTarget.x = vec.x;
                legTarget.y = vec.y;
            } else {
                // TODO falling
                let vec = addVec(entity, legAdjustment);
                legTarget.x = vec.x;
                legTarget.y = vec.y;
            }

            let legTargetVector = subVec(legTarget, entity);
            let legTargetDistFromPlayer = dist(entity, legTarget);
            if (legTargetDistFromPlayer > entity.renderState.legLength * 2) {
                legTarget.x = entity.x + legTargetVector.x / legTargetDistFromPlayer * entity.renderState.legLength;
                legTarget.y = entity.y + legTargetVector.y / legTargetDistFromPlayer * entity.renderState.legLength;
            }
            
            // Get vector from leg to target, rotate 45 degrees randomly clockwise or anticlockwise
            // let legTargetVector2 = subVec(legTarget, legPosition);
            // let legTargetDist = Math.sqrt(legTargetVector2.x * legTargetVector2.x + legTargetVector2.y * legTargetVector2.y);
            // let legTargetAngle = Math.atan2(legTargetVector2.y, legTargetVector2.x);
            // let legTargetAngleOffset = Math.random() * Math.PI / 4 - Math.PI / 8;
            // let legTargetVectorX = Math.cos(legTargetAngle + legTargetAngleOffset) * legTargetDist;
            // let legTargetVectorY = Math.sin(legTargetAngle + legTargetAngleOffset) * legTargetDist;
            // entity.renderState.legVelocities[i].x = legTargetVectorX * 0.2;
            // entity.renderState.legVelocities[i].y = legTargetVectorY * 0.2;

            let velocityVec = rotateVector({x: 0, y: (i % 2 == 0) ? -1 : 1}, entity.renderState.lastKnownDirection);
            entity.renderState.legVelocities[i].x = velocityVec.x * 2;
            entity.renderState.legVelocities[i].y = velocityVec.y * 2;
        }

        if (entity.item) {
            if (i == 0) {
                legTarget.x = entity.x - entity.radius;
                legTarget.y = entity.y - entity.radius;
                legPosition.x = entity.x - entity.radius;
                legPosition.y = entity.y - entity.radius;
                entity.renderState.legVelocities[i].x = 0;
                entity.renderState.legVelocities[i].y = 0;
            } else if (i == 1) {
                legTarget.x = entity.x + entity.radius;
                legTarget.y = entity.y - entity.radius;
                legPosition.x = entity.x + entity.radius;
                legPosition.y = entity.y - entity.radius;
                entity.renderState.legVelocities[i].x = 0;
                entity.renderState.legVelocities[i].y = 0;
            }
        } else if (entity.renderState.isHoldingItem) {
            // Get vector from player to mouse mouse position
            const mouseVec = normalize({x: state.input.mousePosWorld.x - entity.x, y: state.input.mousePosWorld.y - entity.y});
            let vec = scaleVector(mouseVec, 10);

            if (i == 0 || i == 1) {
                entity.renderState.legVelocities[i].x = vec.x;
                entity.renderState.legVelocities[i].y = vec.y;
            }
        }

        // Accelerate leg towards legTarget
        let accel = scaleVector(subVec(legTarget, legPosition), entity.renderState.legAccel);

        entity.renderState.legVelocities[i].x += accel.x;
        entity.renderState.legVelocities[i].y += accel.y;
        entity.renderState.legVelocities[i].x *= 0.8;
        entity.renderState.legVelocities[i].y *= 0.8;
        legPosition.x += entity.renderState.legVelocities[i].x;
        legPosition.y += entity.renderState.legVelocities[i].y;

        // constrain leg position legLength from player
        let legLength = entity.renderState.legLength;
        let legVector = subVec(legPosition, entity);
        let legDistance = Math.sqrt(legVector.x * legVector.x + legVector.y * legVector.y);
        if (legDistance > legLength * 2) {
            legPosition.x = entity.x + legVector.x / legDistance * legLength;
            legPosition.y = entity.y + legVector.y / legDistance * legLength;
        }
    }
    entity.renderState.legUpdateIndex = (entity.renderState.legUpdateIndex + 1) % entity.renderState.legPositions.length;

    // TODO not working for some reason
    if (!entity.renderState.lastKnownPosition) {
        entity.renderState.lastKnownPosition = entity;
    }
    if (entity.x != entity.renderState.lastKnownPosition.x || entity.y != entity.renderState.lastKnownPosition.y) {
        entity.renderState.lastKnownDirection = subVec(entity, entity.renderState.lastKnownPosition);
    }
    entity.renderState.lastKnownPosition = {x: entity.x, y: entity.y};

    entity.renderState.isHoldingItem = entity.item != null;
}

function renderEntityWithState(entity, radius, headColor, bodyColor, legColor) {
    if (entity.item) {
        let vec = {x: entity.x, y: entity.y - entity.radius};
        drawCircle(vec, entity.item.radius, entity.item.color)
    }

    for (let i = 0; i < entity.renderState.legPositions.length; i++) {
        let legPosition = entity.renderState.legPositions[i];

        // Draw a curve from the player to legPosition
        let playerToLeg = subVec(legPosition, entity);
        let legTargetDist = Math.sqrt(playerToLeg.x * playerToLeg.x + playerToLeg.y * playerToLeg.y);
        let legTargetAngle = Math.atan2(playerToLeg.y, playerToLeg.x);
        let legTargetAngleOffset = Math.random() * Math.PI / 4 - Math.PI / 8;
        let legTargetVector = addVec(entity, 
            {
                x: Math.cos(legTargetAngle + legTargetAngleOffset) * legTargetDist,
                y: Math.sin(legTargetAngle + legTargetAngleOffset) * legTargetDist
            });

        if (mag(playerToLeg) > radius * 10) {
            continue;
        }

        // Draw bezier curve from the player to the legPosition such that the curve curves away from the player before arriving at legPosition
        let legLength = 5;
        let controlPoint1 = addVec(entity, rotateVector({x: 0, y: (i % 2 == 0) ? -legLength : legLength}, entity.renderState.lastKnownDirection));
        let controlPoint2 = addVec(legPosition, rotateVector({x: 0, y: (i % 2 == 0) ? -legLength : legLength}, entity.renderState.lastKnownDirection));
        drawCurve(entity, controlPoint1, controlPoint2, legPosition, legColor, 2);

        drawCircle(
            legPosition,
            entity.radius / (6 / 2),
            legColor);
    }

    drawCircle(
            addVec(entity, rotateVector(entity.renderState.body, entity.renderState.lastKnownDirection)),
            entity.radius / (6 / 5),
            entity.stunTimer > 0 ? "orange" : bodyColor);

    if (TEST_ThrowAndCutWithMouse && entity.item != null) {
        drawCircle(
                addVec(entity, rotateVector(entity.renderState.head, subVec({x: state.input.mousePosWorld.x, y: state.input.mousePosWorld.y}, entity))),
                entity.radius / (6 / 3),
                entity.stunTimer > 0 ? "orange" : headColor);
    } else {
        drawCircle(
                addVec(entity, rotateVector(entity.renderState.head, entity.renderState.lastKnownDirection)),
                entity.radius / (6 / 3),
                entity.stunTimer > 0 ? "orange" : headColor);
    }
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

function nestRadius()
{
    return nestBaseRadius + nestRadiusInc*state.score;
}

function drawCircle(worldPos, radius, fillStyle)
{
    let coords = worldToCamera(worldPos.x, worldPos.y);
    context.beginPath();
    context.arc(coords.x, coords.y, radius / state.camera.scale, 0, 2 * Math.PI);
    context.fillStyle = fillStyle;
    context.fill();
}

function drawRectangle(worldPos, width, height, fillStyle) {
    let coords = worldToCamera(worldPos.x, worldPos.y);
    context.beginPath();
    context.rect(coords.x, coords.y, width / state.camera.scale, height / state.camera.scale);
    context.fillStyle = fillStyle;
    context.fill();
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

function getClosestNode(object, nodes) {
    // Get closest node to object in nodes
    let closestNode = null;
    let closestDistance = Infinity;
    for (let i = 0; i < nodes.length; i++) {
        let node = nodes[i];
        let distance = dist(object, node);
        if (distance < closestDistance) {
            closestNode = node;
            closestDistance = distance;
        }
    }

    return closestNode;
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

function physicsUpdate (entity, edges)
{
    // physics - fall and find new edge

    // Check if current edge still exists
    if (entity.currentEdge) {
        for (let i = 0; i < edges.length; i++) {
            if (edges[i].node1 == entity.currentEdge.node1 && edges[i].node2 == entity.currentEdge.node2) {
                break;
            }
            if (i == edges.length - 1) {
                entity.currentEdge = null;
            }
        }
    }

    if (entity.currentEdge == null) {
        //console.log("finding new edge");
        // Get player edge or node
        for (let i = 0; i < edges.length; i++) {
            let edge = edges[i];
            // Perform circle collision on the edge
            let collision = circleLineSegmentCollision(entity, entity.radius, edge.node1, edge.node2);
            // If collision, snap player to collision point
            if (collision) {
                //console.log("new edge found");
                //console.log("(" + edge.node1.x + ", " + edge.node1.y + ") -> (" + edge.node2.x + ", " + edge.node2.y + ")");
                entity.currentEdge = edge;
                break;
            }
        }
    }

    // if too big, fall through and destroy edge!
    if (entity.currentEdge && entity.foodEaten && entity.foodEaten > 3) {
        disconnectNodes(entity.currentEdge.node1, entity.currentEdge.node2);
        entity.velocity.y = 0;
        entity.currentEdge = null;
        entity.currentNode = null;
    }

    if (!entity.currentEdge && !entity.currentNode && entity.hasGravity) {
        //console.log("falling");
        entity.acceleration.y = gravity;
    }

    // TODO raycast physics so we stop going through objects
    entity.velocity.x += entity.acceleration.x;
    entity.velocity.y += entity.acceleration.y;
    entity.y += entity.velocity.y;
    entity.x += entity.velocity.x;
    entity.velocity.x = Math.min(entity.velocity.x, terminalVelocity);
    entity.velocity.x = Math.max(entity.velocity.x, -terminalVelocity);
    entity.velocity.y = Math.min(entity.velocity.y, terminalVelocity);
    entity.velocity.y = Math.max(entity.velocity.y, -terminalVelocity);
}

function itemUpdate(entity, timeMs, timeDelta)
{
    entity.jumpTimer = Math.max(0, entity.jumpTimer - timeDelta);
    if (entity.jumpTimer > 0) {
        entity.currentEdge = null;
    }
    if (entity.currentEdge) {
        entity.acceleration = {x: 0, y: 0};
        entity.velocity = {x: 0, y: 0};
    }

    if (entity.type == ITEM_FOOD) {
        if (mag(entity) <= nestRadius()) {
            state.items.splice(state.items.indexOf(entity), 1);
            IncrementScore();
        }
    }
}

function IncrementScore() {
    state.score++;
    if (state.score >= scoreMax) {
        state.gameOver = true;
    }
}

function flyUpdate(entity, timeMs, timeDelta)
{
    // chance to get stuck and turn into food
    if (entity.currentEdge) {
        state.flies.splice(state.flies.indexOf(entity), 1);
        const food = spawnFood(entity.x, entity.y);
        food.currentEdge = entity.currentEdge;
        return;
    }
    if (timeMs - entity.changeDirTime > entity.changeDirDuration) {
        entity.changeDirTime = timeMs;
        entity.changeDirDuration = Math.random() * 500 + 500;
        entity.velocity = scaleVec(normalize({
            x: entity.flyDir.x + Math.random()*2 - 1,
            y: entity.flyDir.y + Math.random()*2 - 1,
        }), entity.moveSpeed);
    }
}

function isSameEdge(edge1, edge2)
{
    if (edge1.node1 == edge2.node1) {
        return edge1.node2 == edge2.node2;
    }
    if (edge1.node1 == edge2.node2) {
        return edge1.node2 == edge2.node1;
    }
    return false;
}

function enemyUpdate(entity, timeMs, timeDelta)
{
    entity.jumpTimer = Math.max(0, entity.jumpTimer - timeDelta);
    if (entity.jumpTimer > 0) {
        entity.currentEdge = null;
        return;
    }
    if (entity.currentEdge) {
        entity.acceleration = {x: 0, y: 0};
        entity.velocity = {x: 0, y: 0};
    }

    // get closest food
    const foods = state.items.filter(i => i.type == ITEM_FOOD);
    let closestFood = null;
    let closestFoodDist = Infinity;
    if (foods.length) {
        closestFood = foods[0];
        for (let i = 0; i < foods.length; ++i) {
            const food = foods[i];
            let d = dist(food, entity);
            if (d < closestFoodDist) {
                closestFood = food;
                closestFoodDist = d;
            }
        }
    }

    const oldCurrentNode = entity.currentNode;
    entity.currentNode = getNodeUnderEntity(entity);
    let neighbors = [];
    if (entity.currentNode) {
        neighbors = entity.currentNode.edges;
    } else if (entity.currentEdge) {
        neighbors = [entity.currentEdge.node1, entity.currentEdge.node2];
    }

    // in air
    let actionable = true;
    if (!entity.currentEdge && !entity.currentNode) {
        entity.nextNode = null;
        entity.moveSpeed = 0;
        actionable = false;
    }

    // decide what to do
    const DO_NOTHING = 0;
    const DO_WANDER = 1;
    const DO_CHASE = 2;
    const DO_FLEE = 3;
    let whatToDo = DO_NOTHING;
    let target = null; // for DO_CHASE and DO_FLEE

    if (actionable && neighbors.length) {
        whatToDo = DO_WANDER;

         // TODO maybe check if we can actually get to the player/food
         // check if we can see the thing, and that it's not in the air
        const canSeePlayer = dist(entity, state.player) < enemySightRadius && (state.player.currentEdge || state.player.currentNode);
        const canSeeFood = closestFoodDist < enemySightRadius && (closestFood.currentEdge || closestFood.currentNode);

        if (entity.type == ENEMY_SMOL) {
            if (canSeeFood) {
                whatToDo = DO_CHASE;
                target = closestFood;
            } else if (canSeePlayer) {
                whatToDo = DO_FLEE;
                target = state.player;
            }
        } else if (entity.type == ENEMY_BIG) {
            if (canSeePlayer) {
                whatToDo = DO_CHASE;
                target = state.player;
            } else if (canSeeFood) {
                whatToDo = DO_CHASE;
                target = closestFood;
            }
        }
    }

    // do the thing
    if (whatToDo == DO_CHASE) {
        entity.moveSpeed = enemyDefaultMovespeed;
        let neighborEdges = [];
        if (entity.currentNode) {
            neighborEdges = entity.currentNode.edges.map(e => ({node1:entity.currentNode, node2:e}));
        } else {
            // we have to have a currentEdge here..
            neighborEdges = [entity.currentEdge];
        }

        // if we share a common edge with the target, chase it out onto the edge instead of pathing to closest node
        let commonEdges = [];
        if (target.currentEdge != null) {
            commonEdges = neighborEdges.filter(e => isSameEdge(e,target.currentEdge));
        }
        if (commonEdges.length) {
            const edge = commonEdges[0];
            const ent2p = {x: target.x - entity.x, y: target.y - entity.y};
            const n2p = {x: target.x - edge.node1.x, y: target.y - edge.node1.y};
            const dot = dotProduct(ent2p, n2p);
            if (dot > 0) {
                entity.nextNode = edge.node2;
            } else {
                entity.nextNode = edge.node1;
            }
        } else {
            // find shortest path to target with djikstra's algorithm
            // we know target is not in the air from prior check, so it has to have one of these
            const targetsNeighbors = target.currentNode ? [target.currentNode] : [target.currentEdge.node1, target.currentEdge.node2];
            let targetNode = null;
            const path = [];
            // this should ideally be a min heap but it's fine for now
            const frontier = neighbors.map(node => node);
            // Map to store costs and parents
            const nodeInfo = new Map(frontier.map(node => ([node, {cost: dist(entity, node), parent: null}])));
            const explored = new Set();
            while (frontier.length) {
                frontier.sort((a,b) => nodeInfo.get(a).cost < nodeInfo.get(b).cost);
                const node = frontier.pop();
                if (targetsNeighbors.includes(node)) {
                    targetNode = node;
                    break;
                }
                explored.add(node);
                const {cost} = nodeInfo.get(node);
                for (const neighbor of node.edges) {
                    if (explored.has(neighbor)) {
                        continue;
                    }
                    if (dist(neighbor,entity) < enemySightRadius) {
                        const neighCost = cost + dist(neighbor, node);
                        // if the neighbor is in nodeInfo, it must be in frontier (we already checked explored above)
                        const info = nodeInfo.get(neighbor);
                        if (info === undefined || info.cost > neighCost) {
                            frontier.push(neighbor);
                            nodeInfo.set(neighbor, {cost: neighCost, parent: node});
                        }
                    }
                }
            }
            if (targetNode) {
                while (targetNode) {
                    path.push(targetNode);
                    targetNode = nodeInfo.get(targetNode).parent;
                }
                // TODO store path and don't do this every frame
                entity.nextNode = path.pop();
            } else {
                // don't stand around if we didn't find a path
                whatToDo = DO_WANDER;
            }
        }
    } else if (whatToDo == DO_FLEE) {
        entity.moveSpeed = enemyDefaultMovespeed;
        let bestNeighbor = neighbors[0];
        let bestDist = -Infinity;
        let comparison = (a,b) => a > b;
        for (let j = 0; j < neighbors.length; ++j) {
            let neighbor = neighbors[j];
            let d = dist(neighbor, state.player);
            if (comparison(d, bestDist)) {
                bestDist = d;
                bestNeighbor = neighbor;
            }
        }
        entity.nextNode = bestNeighbor;
    }

    // break this out because failing to find a path can re-set whatToDo
    if (whatToDo == DO_WANDER) {
        entity.moveSpeed = enemyWanderMovespeed;
        // arrived at a node from an edge; reset nextNode so a new wandering node can be chosen
        if (oldCurrentNode == null && entity.currentNode != null) {
            entity.nextNode = null;
            // throw a new web if possible
            if (entity.type == ENEMY_BABBY) {
                for (let i = 0; i < state.map.length; ++i) {
                    if (    dist(entity.currentNode, state.map[i]) < webShotRadius &&
                            connectNode(state.map, entity.currentNode, state.map[i])) {
                        continue;
                    }
                }
            }
        }
        // pick a neighbor to wander to; store it in the entity so it remembers next frame
        // only do this when nextNode is null, which can happen for several reasons
        if (entity.nextNode == null) {
            entity.nextNode = neighbors[randomInt(0,neighbors.length)];
        }
    }

    let moveTowardsNode = entity.nextNode;

    if (entity.currentNode && moveTowardsNode) {
        entity.currentEdge = {node1: entity.currentNode, node2: moveTowardsNode};
    }

    if (moveTowardsNode) {
        let delta = normalize({x: moveTowardsNode.x - entity.x, y: moveTowardsNode.y - entity.y});
        entity.velocity.x = entity.moveSpeed * delta.x;
        entity.velocity.y = entity.moveSpeed * delta.y;
    } else if (entity.currentEdge) {
        entity.velocity = {x:0,y:0};
    }

    // TODO player shold slow down if holding an item?

    // big enemies kick player off web
    // TODO need to have player drop item if holding item (and eject it in a random direction)
    // TOOD small enemies should also steal items from player?
    if (dist(entity, state.player) < (entity.radius + state.player.radius)) {
        if (entity.type == ENEMY_BIG) {
            // TODO player drop items in random direction or straight down

            // Random direction
            const randomVec = normalize({x: Math.random() * 2 - 1, y: Math.random() * 2 - 1});
            let throwVelocity = {x: randomVec.x * throwForce, y: randomVec.y * throwForce};
            if (state.player.item) {
                throwItem(state.player, throwVelocity);
            }

            state.player.gotKicked = true;
            state.player.stunTimer = playerStunTime;
            state.player.kickDirection = entity.x > state.player.x ? -1 : 1;
        }
    }
    // eat!
    if (closestFood != null && closestFoodDist < entity.radius + closestFood.radius) {
        removeEntity(closestFood)
        if (entity.type != ENEMY_BABBY) {
            entity.foodEaten++; // don't want babbies falling through web
        }
        if (entity.type == ENEMY_SMOL) {
            entity.radius = enemyRadii[ENEMY_BIG]
            entity.type = ENEMY_BIG;
        } else {
            entity.radius++;
        }
    }
    // babbies eat enemies!
    if (entity.type == ENEMY_BABBY) {
        for (let i = 0; i < state.enemies.length; ++i) {
            const enemy = state.enemies[i];
            if (enemy.type == ENEMY_BABBY) {
                continue;
            }
            if (dist(enemy, entity) < enemy.radius + entity.radius) {
                removeEntity(enemy);
                entity.radius += enemy.foodEaten;
            }
        }
    }
}

function CameraScaleRatio() {
    return canvas.width / canvasDesignWidth;
}

function removeEntity(e)
{
    e.exists = false; // won't be updated in update()=
}

function throwItem(entity, throwVelocity) {
    entity.item.x = entity.x;
    entity.item.y = entity.y;
    entity.item.currentEdge = null;
    entity.item.currentNode = null;

    if (entity.item.entityType == "item") {
        state.items.push(entity.item);
        console.log("released item");
    } else if (entity.item.entityType == "enemy") {
        state.enemies.push(entity.item);
        console.log("released enemy");
    }
    entity.item.velocity = throwVelocity;
    entity.item.acceleration = {x: 0, y: gravity};
    entity.item.jumpTimer = playerJumpCooldown;

    entity.item = null;
    entity.cooldown = playerActionCooldownTime;
}

function distToLineSegment(lineStart, lineEnd, point) {
    const lineLength = dist(lineStart, lineEnd);
    const t = ((point.x - lineStart.x) * (lineEnd.x - lineStart.x) + (point.y - lineStart.y) * (lineEnd.y - lineStart.y)) / (lineLength * lineLength);
    if (t < 0) {
        return dist(lineStart, point);
    } else if (t > 1) {
        return dist(lineEnd, point);
    } else {
        return dist(point, {x: lineStart.x + t * (lineEnd.x - lineStart.x), y: lineStart.y + t * (lineEnd.y - lineStart.y)});
    }
}

function playerUpdate(entity, timeMs, timeDelta)
{
    state.edgeToDelete = null;

    entity.cooldown = Math.max(0, entity.cooldown - timeDelta);
    entity.stunTimer = Math.max(0, entity.stunTimer - timeDelta);
    entity.jumpTimer = Math.max(0, entity.jumpTimer - timeDelta);

    entity.acceleration = {x: 0, y: 0};

    const isGrounded = entity.currentNode || entity.currentEdge;
    const isStunned = entity.stunTimer > 0;
    const isJumping = entity.jumpTimer > 0;
    const isMoving = !isStunned && !isJumping && (state.input.wPressed || state.input.aPressed || state.input.sPressed || state.input.dPressed);

    // Get the closest node to the entity
    // TODO snap to node if falling (may need to artificially expand the radius)
    entity.currentNode = !isJumping ? getNodeUnderEntity(entity) : null;
    let moveTowardsNode = null;

    // select edge for deletion
    // Should be null if the player is holding an item
    // If current node, should be closest edge to mouse connected to current node
    // If no current node, should be the current edge if mouse is close to it
    if (!entity.item || TEST_ThrowAndCutWithMouse) {
        if (entity.currentNode) {
            // iterate over edges and select the one closest to the mouse
            let closestEdge = null;
            let closestEdgeDistance = Number.MAX_VALUE;
            for (let i = 0; i < entity.currentNode.edges.length; ++i) {
                const node2 = entity.currentNode.edges[i];
                const distance = distToLineSegment(entity.currentNode, node2, state.input.mousePosWorld);
                if (distance < closestEdgeDistance && distance < edgeSelectionRadius) {
                    closestEdge = {node1: entity.currentNode, node2: node2};
                    closestEdgeDistance = distance;
                }
            }
            if (closestEdge) {
                state.edgeToDelete = closestEdge;
            }
        } else if (entity.currentEdge) {
            // If shorted mouse distance from line is < edgeSelectionRadius, then select the edge
            let currentEdgeDistanceFromMouse = distToLineSegment(entity.currentEdge.node1, entity.currentEdge.node2, state.input.mousePosWorld);
            //console.log(currentEdgeDistanceFromMouse);
            if (currentEdgeDistanceFromMouse < edgeSelectionRadius) {
                state.edgeToDelete = entity.currentEdge;
            }
        }
    }

    if (!state.gameOver) {
        state.camera.targetScale = ((entity.velocity.y >= terminalVelocity) ? 2 : 1) / CameraScaleRatio();
    }


    // Player is either on a node, on an edge, or falling
    // Get node moving towards based on wasd input
    // Set move vector based on selected edge

    let moveVec = {
        x: state.input.aPressed ? -1
         : state.input.dPressed ? 1
         : 0,
        y: state.input.wPressed ? -1
         : state.input.sPressed ? 1
         : 0
     };

    // If on node, find next node using moveVec
    if (isMoving) {
        if (entity.currentNode) {
            let neighbors = entity.currentNode.edges;
            let bestNeighbor = neighbors[0];
            let bestDot = -Infinity;
            for (let j = 0; j < neighbors.length; ++j) {
                let neighbor = neighbors[j];
                let dot = dotProduct(moveVec, normalize({x: neighbor.x - entity.x, y: neighbor.y - entity.y}));
                if (dot > 0 && dot > bestDot) {
                    bestDot = dot;
                    bestNeighbor = neighbor;
                }
            }
            moveTowardsNode = bestDot != -Infinity ? bestNeighbor : entity.currentNode;
            if (moveTowardsNode) {
                entity.currentEdge = {node1: entity.currentNode, node2: moveTowardsNode};
            }
        }
        // If on edge, find next node using moveVec
        else if (entity.currentEdge) {
            let neighbors = [entity.currentEdge.node1, entity.currentEdge.node2];
            let bestNeighbor = neighbors[0];
            let bestDot = -Infinity;
            for (let j = 0; j < neighbors.length; ++j) {
                let neighbor = neighbors[j];
                let d = dist(neighbor, entity);
                let dot = dotProduct(moveVec, normalize({x: neighbor.x - entity.x, y: neighbor.y - entity.y}));
                if (dot > bestDot) {
                    bestDot = dot;
                    bestNeighbor = neighbor;
                }
            }
            moveTowardsNode = bestNeighbor;
        }
    }

    if (moveTowardsNode) {
        console.log((entity.currentNode ? "node " : "edge ") + "(" + moveTowardsNode.x + ", " + moveTowardsNode.y + ")");
    }

    let destroyWebActionPressed;
    let itemInteractActionPressed;
    if (!TEST_ThrowAndCutWithMouse) {
        // TODO need to refine web breaking so player always breaks the right one
        destroyWebActionPressed = isStunned ? false : state.input.rPressed;
        itemInteractActionPressed = isStunned ? false : state.input.ePressed;
    } else {
        destroyWebActionPressed = state.input.mouseWasPressed;
        itemInteractActionPressed = state.input.mouseWasPressed;
    }

    function jumpPlayer (vel) {
        console.log("jumping");
        entity.jumpTimer = playerJumpCooldown;
        entity.velocity = vel;
    }

    const movementDelta = moveTowardsNode
                        ? normalize({x: moveTowardsNode.x - entity.x, y: moveTowardsNode.y - entity.y})
                        : {x: 0, y: 0};

    if (!isJumping) {
        if (moveTowardsNode) {
            entity.velocity.x = entity.moveSpeed * movementDelta.x;
            entity.velocity.y = entity.moveSpeed * movementDelta.y;
        } else if (entity.currentEdge) {
            entity.velocity = {x: 0, y: 0};
        } else {
            entity.acceleration.x = moveVec.x * airAccel;
        }

        if ((entity.currentEdge || entity.currentNode) && state.input.spacePressed && isGrounded && !isStunned) {
            jumpPlayer({
            x: state.input.aPressed ? -jumpXForce
             : state.input.dPressed ? jumpXForce
             : 0,
            y: state.input.sPressed ? 0
             : -jumpYForce
         });
        }
    }

    if (entity.gotKicked) {
        jumpPlayer({x: entity.kickDirection * stunPower, y: -stunPower});
    }

    function tryPickUpItem() {
        let pickedUp = false;
        // Pick up item
        for (let i = 0; i < state.items.length; ++i) {
            const item = state.items[i];
            if (dist(item, entity) < playerPickupRadius) {
                entity.item = item;
                item.velocity = {x: 0, y: 0};
                item.acceleration = {x: 0, y: 0};
                state.items.splice(i, 1);
                entity.cooldown = playerActionCooldownTime;
                pickedUp = true;
                break;
            }
        }
        if (!pickedUp) {
            // Pick up enemy
            for (let i = 0; i < state.enemies.length; ++i) {
                const enemy = state.enemies[i];
                if (enemy.type == ENEMY_SMOL && dist(enemy, entity) < playerPickupRadius) {
                    state.enemies.splice(i, 1);
                    entity.item = enemy; // Make new entity from enemy
                    enemy.velocity = {x: 0, y: 0};
                    enemy.acceleration = {x: 0, y: 0};
                    entity.cooldown = playerActionCooldownTime;
                    enemy.jumpTimer = playerJumpCooldown;
                    pickedUp = true;
                    console.log("picked up enemy");
                    break;
                }
            }
        }
        return pickedUp;
    }
    if (entity.cooldown <= 0) {
        if (TEST_AutomaticPickup) {
            if (entity.item == null && tryPickUpItem()) {
                entity.cooldown = playerActionCooldownTime;
            }
        }
    }

    if (entity.cooldown <= 0) {
        // Connect web
        if (state.input.mouseWasPressed && !getPlayerEdge()) {
            // Get node under mouse
            let node = getNodeUnderMouse(state.input.mousePosWorld.x, state.input.mousePosWorld.y);
            if (node != null) {
                let playerDistance = dist(entity, node);
                if (playerDistance < webShotRadius) {
                    // Add edge between node and current player node
                    let playerNode = getNodeUnderEntity(entity);
                    if (playerNode) {
                        if (connectNode(state.map, playerNode, node)) {
                            entity.cooldown = playerActionCooldownTime;
                        }
                    }
                }
            }
        }
    }

    if (entity.cooldown <= 0) {
        if (destroyWebActionPressed) {
            if (!TEST_ThrowAndCutWithMouse) {
                if (entity.currentNode) {
                    // Get edge from currentNode to state.currentNodeSelection
                    let edge = null;
                    for (let i = 0; i < entity.currentNode.edges.length; ++i) {
                        let e = entity.currentNode.edges[i];
                        if (e == state.currentNodeSelection) {
                            edge = e;
                            break;
                        }
                    }
                    if (edge) {
                        disconnectNodes(entity.currentNode, state.currentNodeSelection);
                        entity.cooldown = playerActionCooldownTime;
                    }
                } else if (entity.currentEdge) {
                    // Destroy current edge
                    disconnectNodes(entity.currentEdge.node1, entity.currentEdge.node2);
                    entity.cooldown = playerActionCooldownTime;
                }
            } else {
                if (destroyWebActionPressed && state.edgeToDelete) {
                    disconnectNodes(state.edgeToDelete.node1, state.edgeToDelete.node2);
                    entity.cooldown = playerActionCooldownTime;
                }
            }
        } 
    }

    if (entity.cooldown <= 0) {
        if (itemInteractActionPressed) {
            // pick up or put down item
            if (entity.item) {
                const mouseVec = normalize({x: state.input.mousePosWorld.x - entity.x, y: state.input.mousePosWorld.y - entity.y});
                let throwVelocity = {x: mouseVec.x * throwForce, y: mouseVec.y * throwForce};
                throwItem(entity, throwVelocity);
            } else {
                if (!TEST_AutomaticPickup) {
                    tryPickUpItem();
                }
            }
        }
    }

    if (entity.gotKicked || entity.jumpTimer > 0) {
        entity.currentEdge = null;
        entity.acceleration.y = gravity;
        entity.gotKicked = false;
    }

    if (mag(entity) <= nestRadius() && entity.item && entity.item.entityType == "item" && entity.item.type == ITEM_FOOD) {
        entity.item = null;
        IncrementScore();
    }

    // Log entity velocity
    // console.log("velocity: (" + entity.velocity.x + ", " + entity.velocity.y + ")");
}

function update (timeMs, timeDelta)
{
    let mousePosScreen = screenToCanvas(state.input.mouseClientX || 0, state.input.mouseClientY || 0);
    state.input.mousePosWorld = cameraToWorld(mousePosScreen.x, mousePosScreen.y);

    // Get node under mouse
    state.currentNodeSelection = getNodeUnderMouse(state.input.mousePosWorld.x, state.input.mousePosWorld.y);

    if (state.camera.easeMode == "quadtratic") {
        // Ease camera scale to targetScale
        state.camera.scale += (state.camera.targetScale - state.camera.scale) * state.camera.zoomEaseFactor;
        // Ease camera x and y towards player currentNode position
        state.camera.x += (state.player.x - state.camera.x) * state.camera.easeFactor;
        state.camera.y += (state.player.y - state.camera.y) * state.camera.easeFactor;
    } else if (state.camera.easeMode == "linear") {
        // TODO doesn't work
        // Ease camera scale to targetScale
        // let dir = Math.abs(state.camera.scale - state.camera.targetScale) <= state.camera.zoomEaseFactor ? 0
        //         : state.camera.scale > state.camera.targetScale ? -1
        //         : 1;
        // console.log("scale: " + state.camera.scale + ", targetScale: " + state.camera.targetScale);
        // // Ease camera x and y towards player currentNode position
        // dir = Math.abs(state.camera.x - state.player.x <= state.camera.easeFactor) ? 0
        //     : state.camera.x > state.player.x ? -1
        //     : 1;
        // state.camera.x += state.camera.easeFactor * dir;
        // dir = Math.abs(state.camera.y - state.player.y <= state.camera.easeFactor) ? 0
        //     : state.camera.y > state.player.y ? -1
        //     : 1;
        // state.camera.y += state.camera.easeFactor * dir;
    }

    // If the game is over, play the end-game cinematic
    if (state.gameOver) {
        if (gameOverCinematicData.startTime == null) {
            gameOverCinematicData.startTime = timeMs;
        }
        // Get the current keyframe and set the camera's properties to the current keyframe data
        let currentKeyFrame = 0;
        let time = 0;
        for (let i = 0; i < gameOverCinematicData.keyframes.length; ++i) {
            time += gameOverCinematicData.keyframes[i].duration;
            if (timeMs - gameOverCinematicData.startTime < time || i == gameOverCinematicData.keyframes.length - 1) {
                let keyframe = gameOverCinematicData.keyframes[i];
                currentKeyFrame = i;
                for (const [key, value] of Object.entries(keyframe)) {
                    state.camera[key] = value;
                }
                state.camera.targetScale /= CameraScaleRatio();
                break;
            }
        }

        if (currentKeyFrame >= 1 && state.enemies.length < 250) {
            state.score = 0;
            // Call spawnBabby with a random velocity vector of length 1
            const randomVec = normalize({x: Math.random() * 2 - 1, y: Math.random() * 2 - 1});
            const randomVelocity = {x: randomVec.x * jumpXForce * 5, y: randomVec.y * jumpYForce * 5};
            let babby = spawnBabby(0, 0, randomVelocity);
            babby.jumpTimer = playerJumpCooldown * 2;
        }
    }

    // Add all the stuff to entities list
    var entities = [state.player].concat(state.enemies).concat(state.items).concat(state.flies);

    for (let i = 0; i < entities.length; i ++) {
        if (entities[i].renderState != null) {
            updateEntityRenderState(entities[i]);
        }
    }

    // Get all edges
    let edges = [];
    for (let i = 0; i < state.map.length; i++) {
        for (let j = 0; j < state.map[i].edges.length; j++) {
            edges.push({node1: state.map[i], node2: state.map[i].edges[j]});
        }
    }

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
            physicsUpdate(entity, edges);
        }
    }

    if (state.player.y > mapEndZone && !state.gameOver) {
        initState();
        state.isRunning = true;
        return;
    }

    // Spawn an enemy if timer is up
    if (timeMs - state.enemyTimeSpawnedMs > state.enemyTimeUntilNextSpawnMs) {
        spawnEnemy();
        state.enemyTimeSpawnedMs = timeMs;
        const minSpawnTime = 5000;
        const maxSpawnTime = 10000;
        state.enemyTimeUntilNextSpawnMs = randomInt(minSpawnTime, maxSpawnTime);
    }

    // Spawn fly if timer is up
    if (timeMs - state.flyTimeSpawnedMs > state.flyTimeUntilNextSpawnMs) {
        spawnFly();
        state.flyTimeSpawnedMs = timeMs;
        const minSpawnTime = 5000;
        const maxSpawnTime = 10000;
        state.flyTimeUntilNextSpawnMs = randomInt(minSpawnTime, maxSpawnTime);
    }

    // cull nonexistent entities from lists
    for (const list of [state.enemies, state.items, state.flies]) {
        for (let i = list.length - 1; i >= 0; --i) {
            if (!list[i].exists) {
                list.splice(i, 1);
            }
        }
    }

    state.input.mouseWasPressed = false;
}

function randomInt(loInclusive, hiExclusive)
{
    let min = Math.floor(loInclusive);
    let max = Math.floor(hiExclusive);
    return Math.floor(Math.random() * (max - min) + min);
}

// not used... (yet)
/*
function pointInAAB(point, left, right, top, bot) {
    if (point.x < left || point.x > right) {
        return false
    }
    if (point.y > top || point.y < bot) {
        return false
    }
    return true;
}
*/

function spawnFly()
{
    // pick random direction away from center
    let spawnDir = normalize({
        x: Math.random() - 0.5,
        y: Math.random() - 0.5});
    // push out past the edge

    // fly toward center, perturb a bit
    let flyDir = normalize({
        x: -spawnDir.x + Math.random()*0.5 - 0.25,
        y: -spawnDir.y + Math.random()*0.5 - 0.25});

    const fly = makeEntity({
        entityType: "fly",
        color: "#22dd44",
        radius: 5,
        x: spawnDir.x * (mapWidth/2 + 300),
        y: spawnDir.y * (mapHeight/2 + 300),
        moveSpeed: enemyDefaultMovespeed,
        hasGravity: false,
        flyDir,
        changeDirTime: performance.now(),
        changeDirDuration: 500,
        update: flyUpdate,
    });

    console.log("spawn fly ("+fly.x+" "+fly.y+")");
    state.flies.push(fly);
    return fly;
}

function spawnFood(x,y)
{
    const food = makeEntity({
        entityType: "item",
        x: x != undefined ? x : Math.random() * 1000 - 500,
        y: y != undefined ? y : Math.random() * -500, // top half, idk
        radius: 5,
        color: 'lightgreen',
        update: itemUpdate,
        type: ITEM_FOOD,
    });
    state.items.push(food);
    return food;
}

function spawnBabby(x,y,velocity)
{
    const babby = makeEntity({
        entityType: "enemy",
        color: "yellow",
        x,
        y,
        velocity,
        moveSpeed: enemyDefaultMovespeed + 1,
        nextNode: null,
        update: enemyUpdate,
        type: ENEMY_BABBY,
        foodEaten: 0,
        radius: 3,
        renderState: SpiderRenderState(),
    });

    state.enemies.push(babby);
    return babby;
}

function spawnEnemy()
{
    let possibleNodes = [];
    // Skip the first 10 nodes (they are the nest nodes)
    for (let i = 10; i < state.map.length; ++i) {
        let node = state.map[i];
        let hasEnemy = false;
        for (let j = 0; j < state.enemies.length; ++j) {
            let enemy = state.enemies[j];
            let distance = dist(node, enemy);
            //let playerDistance = dist(enemy, state.player);
            if (distance < 20 /*&& playerDistance > 50*/) {
                hasEnemy = true;
                break;
            }
        }
        if (!hasEnemy) {
            possibleNodes.push(node);
        }
    }
    if (!possibleNodes.length) {
        console.log("Nowhere to spawn enemy!");
        return;
    }
    let spawnNode = possibleNodes[randomInt(0, possibleNodes.length)];
    const enemy = makeEntity({
        entityType: "enemy",
        color: "red",
        x: spawnNode.x,
        y: spawnNode.y,
        moveSpeed: enemyDefaultMovespeed,
        nextNode: null,
        update: enemyUpdate,
        type: [ENEMY_SMOL,ENEMY_BIG][randomInt(0,2)],
        renderState: SpiderRenderState()
    });
    enemy.radius = enemyRadii[enemy.type];
    enemy.foodEaten = [0,1][enemy.type];
    state.enemies.push(enemy);
    return enemy;
}

var timeSinceLastUpdate = 0;
var previousTimeMs = 0;
function gameLoop(timeElapsed)
{
    window.requestAnimationFrame(gameLoop);

    let timeDelta = timeElapsed - previousTimeMs;
    timeSinceLastUpdate += timeDelta;
    previousTimeMs = timeElapsed;

    if (timeSinceLastUpdate > frameTime * 3) {
        timeSinceLastUpdate = frameTime;
    }

    while (timeSinceLastUpdate >= frameTime) {
        timeSinceLastUpdate -= frameTime;
        if (state.isRunning) {
            update(timeElapsed, frameTime);
        }
    }
    render(timeElapsed);
}

function getNodeUnderEntity(e) {
    for (let i = 0; i < state.map.length; i++) {
        let node = state.map[i];
        let distance = dist(state.map[i], e);
        if (distance < e.radius) {
            return node;
        }
    }
    return null;
}

// Circle line intersection
function getPlayerEdge () {
    for (let i = 0; i < state.map.length; i++) {
        for (let j = 0; j < state.map[i].edges; j++) {
            // Line from node to node
            // Perform player circle collision on that line using player radius
            // If collision, return edge
            let nodeToPlayer = {x: state.player.x - state.map[i].x, y: state.player.y - state.map[i].y};
        }
    }
}

function getNodeUnderMouse(x, y) {
    let closestNode = null;
    let closestDistance = Infinity;
    for (let i = 0; i < state.map.length; i++) {
        if (getNodeUnderEntity(state.player) == state.map[i]) {continue;}
        let distance = dist(state.map[i], {x, y});
        if (distance < closestDistance && distance < nodeSelectionRadius) {
            closestNode = state.map[i];
            closestDistance = distance;
        }
    }
    return closestNode;
}

// Convert clientX and clientY to coords in canvas space
function screenToCanvas(x, y) {
    let rect = canvas.getBoundingClientRect();
    return {x: x - rect.left, y: y - rect.top};
} 


// Initialize mouse events on document
function initEvents() {
    // Mouse move
    document.addEventListener('mousemove', function (event) {
        // Get mouse position
        state.input.mouseClientX = event.clientX;
        state.input.mouseClientY = event.clientY;
    });

    // Mouse down
    document.addEventListener('mousedown', function (event) {
        // Get mouse position
        state.input.mouseWasPressed = true;
    });

    // Key event detecting w a s and d
    document.addEventListener('keydown', function (event) {
        if (event.key == 'w' || event.key == 'W' || event.key == 38) {
            state.input.wPressed = true;
        }
        if (event.key == 's' || event.key == 'S' || event.key == 40) {
            state.input.sPressed = true;
        }
        if (event.key == 'e' || event.key == 'E') {
            state.input.ePressed = true;
        }
        if (event.key == 'd' || event.key == 'D' || event.key == 39) {
            state.input.dPressed = true;
        }
        // a
        if (event.key == 'a' || event.key == 'A' || event.key == 37) {
            state.input.aPressed = true;
        }
        // r
        if (event.key == 'r' || event.key == 'R') {
            state.input.rPressed = true;
        }
        // spacebar
        if (event.keyCode == 32) {
            state.input.spacePressed = true;
        }

        return !(event.keyCode == 32);
    });

    // Key up event
    document.addEventListener('keyup', function (event) {
        if (event.key == 'w' || event.key == 'W' || event.key == 38) {
            state.input.wPressed = false;
        }
        if (event.key == 's' || event.key == 'S' || event.key == 40) {
            state.input.sPressed = false;
        }
        if (event.key == 'e' || event.key == 'E') {
            state.input.ePressed = false;
        }
        if (event.key == 'd' || event.key == 'D' || event.key == 39) {
            state.input.dPressed = false;
        }
        // a
        if (event.key == 'a' || event.key == 'A' || event.key == 37) {
            state.input.aPressed = false;
        }
        // r
        if (event.key == 'r' || event.key == 'R') {
            state.input.rPressed = false;
        }
        // spacebar
        if (event.keyCode == 32) {
            state.input.spacePressed = false;
        }
    });
}

function startGame() {
    state.isRunning = true;
}

function start()
{
    let startButton = document.getElementById("startbutton");
    startButton.addEventListener("click", startGame);

    // Get #gameCanvas
    canvas = document.getElementById("gamecanvas");
    // Get 2d context from canvas
    context = canvas.getContext("2d");

    initState();
    initEvents();

    window.requestAnimationFrame(gameLoop);
}
