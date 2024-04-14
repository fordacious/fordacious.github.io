window.onload = start;

let canvas = null;
let context = null;
let state = null;

const frameTime = 1000 / 60;

const canvasDesignWidth = 640;

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
    name: "map_level",
    player: {entityType: "player", x: 0, y: -1300, radius: 10, mass: 1, velocity: {x:0, y: 0}, color: "#00ffff"},
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
        radius: 10,
        mass: 1,
        velocity: {x: 0, y: 0},
        color: "#ffff00",
    },
    {
        entityType: "collectable",
        x: -150,
        y: 0,
        radius: 10,
        mass: 1,
        velocity: {x: 0, y: 0},
        color: "#ffff00",
    },
    {
        entityType: "collectable",
        x: 300,
        y: 0,
        radius: 10,
        mass: 1,
        velocity: {x: 0, y: 0},
        color: "#ffff00",
    },
    {
        entityType: "collectable",
        x: 0,
        y: -300,
        radius: 10,
        mass: 1,
        velocity: {x: 0, y: 0},
        color: "#ffff00",
    }]
};

const levels = [map_singleton, map_dao, map_threebody, map_level];
let currentLevel = 3;
function startGame () {
    initState(JSON.stringify(levels[currentLevel]))
}

function loadLevelFromJSON(json) {

    let mapobj = JSON.parse(json);

    mapobj.planets = mapobj.planets || [];
    mapobj.collectables = mapobj.collectables || [];

    mapobj.player.update = playerUpdate;
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
    let numFields = 60;
    let entities = [];
    for (let i = 0; i < numFields; ++i) {
        for (let j = 0; j < numFields; ++j) {
            entities.push(makeEntity({
                entityType: "field",
                x: i * fieldLength / numFields - fieldLength / 2,
                y: j * fieldLength / numFields - fieldLength / 2,
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
    // For each entity, render them as an arrow at their location pointing in the direction of their acceleration
    for (let entity of entities) {
        renderArrow(entity.x, entity.y, entity.acceleration);
    }
}

// TODO moving directly left right up or down causes the camera x y to be NaN. Starting it at 1, 1 avoids it.
function initState(json) {
    console.log("Loading level: " + json);
    let levelData = loadLevelFromJSON(json);
    console.log(levelData);
    state = {
        gameOver: false,
        camera: levelData.camera,
        player: levelData.player,
        planets: levelData.planets || [],
        collectables: levelData.collectables || [],
        particles: makeInitParticles(),
        field: makeField(),
        gravityMap: new Array(1000*1000),
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
    // gobal alpha
    context.globalAlpha = 1;

    // Set awesome canvas background
    // linear gradient from #333333 to #444444
    let grdcoords1 = worldToCamera(-200, -200);
    let grdcoords2 = worldToCamera(canvas.width - 500, canvas.height - 400);
    let grd = context.createLinearGradient(grdcoords1.x, grdcoords1.y, grdcoords2.x, grdcoords2.y);
    grd.addColorStop(0, "#333333");
    grd.addColorStop(1, "#444444");
    context.fillStyle = grd;
    context.fillRect(0, 0, canvas.width, canvas.height);

    renderField(state.field);

    // Draw player circle
    if (state.player) {
        drawCircle({x: state.player.x, y: state.player.y}, state.player.radius, state.player.color);
    }


    // Draw particles
    for (let particle of state.particles) {
        let color = particle.color;
        // Set particle color alpha to closer to 0 based on lifetime

        context.save();
        // Set additive hue blending
        context.globalCompositeOperation = "lighter";
        context.globalAlpha = particle.lifetime / 100;
        
        drawCircle({x: particle.x, y: particle.y}, particle.radius * 2, particle.color);

        context.restore();
    }

    // Draw planets
    context.save();
    context.globalAlpha = 1;
    for (let planet of state.planets) {
        drawCircle({x: planet.x, y: planet.y}, planet.radius, planet.color);
    }
    context.restore();

    // draw collectables as circle but with larger empty circle around it
    context.save();
    context.globalCompositeOperation = "lighter";
    for (let collectable of state.collectables) {
        drawCircle({x: collectable.x, y: collectable.y}, collectable.radius - 5, collectable.color);
        drawCircle({x: collectable.x, y: collectable.y}, collectable.radius + 5, collectable.color, true);
    }
    context.restore();
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
        grd.addColorStop(1, "#000000");
        context.fillStyle = grd;
    } else {
        context.fillStyle = fillStyle;
    }
    context.fill();
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

function physicsUpdate (entity, entities, gravitySources)
{
    entity.acceleration = {x:0, y:0};

    // assumes planets are first in the list of entities
    if (entity.orbit != undefined) {
        if (entity.orbit == -1) {
            gravitySources = [];
        } else {
            gravitySources = [entities[entity.orbit]];
        }
    }

    // Get gravity from each entity
    for (let otherEntity of gravitySources) {
        if (otherEntity === entity) {
            continue;
        }
        let distance = dist(entity, otherEntity);
        if (distance == 0) {
            distance = 0.00001;
        }
        let angle = Math.atan2(otherEntity.y - entity.y, otherEntity.x - entity.x);
        let gravitationForceFromOtherEntity = (otherEntity.mass / (distance * distance));
        entity.acceleration.x += gravitationForceFromOtherEntity * Math.cos(angle);
        entity.acceleration.y += gravitationForceFromOtherEntity * Math.sin(angle);
    }

    if (entity.static) {
        return;
    }

    entity.velocity.x += entity.acceleration.x;
    entity.velocity.y += entity.acceleration.y;
    entity.y += entity.velocity.y;
    entity.x += entity.velocity.x;
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

function collectablesUpdate(entity, timeMs, timeDelta) {
} 

function playerUpdate(entity, timeMs, timeDelta)
{
    state.particles.push(makeEntity({
        entityType: "particle", // TODO probably dont need to differentiate
        x: entity.x + Math.random() * entity.radius / 2,
        y: entity.y + Math.random() * entity.radius / 2,
        radius: 1,
        mass: 1,
        velocity: {x: -entity.velocity.x + (Math.random() * 0.1) - 0.05, y: -entity.velocity.y + (Math.random() * 0.1) - 0.05},
        color: entity.color, // TODO move to render state later,
        lifetime: 100 + Math.random() * 100,
        update: particleUpdate,
    }));

    const maxSpeed = 10;
    const accel = 0.1;
    let movement = {x: 0, y: 0};
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

    let isInputting = movement.x != 0 && movement.y != 0; 

    // For each planet, if its colliding, bounce off
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
            let dot = dotProduct(entity.velocity, normal);
            let bounceFriction = 0.8;
            let bounceFactor = 1; // TODO was 2
            let amount = scaleVec(normal, 2 * dot * bounceFriction * (isInputting ? bounceFactor : 1));
            entity.velocity = subVec(entity.velocity, amount);
            let surfaceFriction = 0.99;
            entity.velocity.x *= surfaceFriction;
            entity.velocity.y *= surfaceFriction;

            // Add the velocity of the object
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

                /*
                // 10 larger, short lived, redder ones
                for (let i = 0; i < 10; ++i) {
                    state.particles.push(makeEntity({
                        entityType: "particle",
                        x: entity.x,
                        y: entity.y,
                        radius: 10,
                        mass: 1,
                        // Velocity should be amount * random offset
                        //velocity: {x: -amount.x / 5 + Math.random() * 4 - 2, y: -amount.y / 5 + Math.random() * 4 - 2},
                        velocity: {x: Math.random() * 10 - 5, y: Math.random() * 10 - 5},
                        color: "#ff0000", // TODO move to render state later,
                        lifetime: 10 + Math.random() * 50,
                        update: particleUpdate,
                    }));
                }
                */
            }
        }
    }

    // Check collision with collectables. If we hit them, explode them
    for (let collectable of state.collectables) {
        if (circleCollision(entity, entity.radius, collectable, collectable.radius)) {
            collectable.velocity.x = entity.velocity.x / 2;
            collectable.velocity.y = entity.velocity.y / 2;
            explodeEntity(collectable);
            state.score += 1;

            if (state.collectables.length == 1) {
                // Kill player on last collectable
                //explodeEntity(entity);
            }
        }
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

    // TODO just handles destroying without colliding for now
    // When it goes into the planet, it gets flung out fast
    if(mag(entity.velocity) > 20) {
        removeEntity(entity);
    }
}

function explodeEntity(entity) {
    // If planet 1 exists, destroy it and replace if with 500 particles of the same color in the same circle radius
    if (!entity) {
        return;
    }
    let x = entity.x;
    let y = entity.y;
    let radius = entity.radius;
    let color = entity.color;

    let numParticles = entity.radius * entity.radius;

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
        //state.camera.x += (state.player.x - state.camera.x) * state.camera.easeFactor;
        //state.camera.y += (state.player.y - state.camera.y) * state.camera.easeFactor;
    }

    // Add all the stuff to entities list
    var nonparticles = (state.player ? [state.player] : []).concat(state.planets);
    var entities = [].concat(state.planets).concat((state.player ? [state.player] : [])).concat(state.particles).concat(state.field);

    // Update gravity map
    // for (let i = 0; i < state.gravityMap.length; ++i) {
    //     for (let entity of entities) {
    //         if (state.gravityMap[i] === 0) {
    //             state.gravityMap[i] = {x:0,y:0};
    //         }

    //         // Compute gravity based on distance from entity and entity mass
    //         let gravPoint = {x: i % 1000, y: Math.floor(i / 1000)};
    //         let distVal = dist(entity, gravPoint);
    //         let angleTowardsEtityFromGravPoint = Math.atan2(entity.y - gravPoint.y, entity.x - gravPoint.x);
    //         let gravVec = {x: Math.cos(angleTowardsEtityFromGravPoint) * entity.mass / (distVal * distVal), y: Math.sin(angleTowardsEtityFromGravPoint) * entity.mass / (distVal * distVal)};
    //         //state.gravityMap[i] += {gravVec.x, gravVec.y};
    //     }
    // }

    // Set camera target scale based on the locations of all entities such that we can see all of them
    let maxDist = 0;
    for (let entity of nonparticles) {
        let dist = Math.max(Math.abs(entity.x), Math.abs(entity.y));
        if (dist > maxDist && dist < 10000) {
            maxDist = dist;
        }
    }
    state.camera.targetScale = Math.max(2, maxDist / 400);

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
            physicsUpdate(entity, entities, state.planets);
        }
    }

    // cull nonexistent entities from lists
    for (const list of [state.particles, state.planets, state.collectables]) {
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
function gameLoop(timeElapsed)
{
    window.requestAnimationFrame(gameLoop);

    let timeDelta = timeElapsed - previousTimeMs;
    timeSinceLastUpdate += timeDelta;
    previousTimeMs = timeElapsed;

    //if (timeSinceLastUpdate > frameTime * 3) {
    //    timeSinceLastUpdate = frameTime;
    //}

    while (timeSinceLastUpdate >= frameTime) {
        timeSinceLastUpdate -= frameTime;
        update(timeElapsed, frameTime);
    }
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
        // TODO
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
    // Get #gameCanvas
    canvas = document.getElementById("gamecanvas");
    // Get 2d context from canvas
    context = canvas.getContext("2d");

    initEvents();
    startGame();

    window.requestAnimationFrame(gameLoop);
}
