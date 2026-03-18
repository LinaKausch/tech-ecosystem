import * as THREE from 'three';

const occupied = new Set();
const cubeSize = 0.3;
const zOffset = 0;
const snap = (v) => Math.round(v / cubeSize) * cubeSize;

const directions = [
    [cubeSize, 0, 0],
    [-cubeSize, 0, 0],
    [0, cubeSize, 0],
    [0, -cubeSize, 0],
    [0, 0, cubeSize],
    [0, 0, -cubeSize]
];

export const checkNeighbors = (cube) => {
    return directions.map(dir => {
        const pos = cube.position.clone().add(new THREE.Vector3(...dir));
        return new THREE.Vector3(snap(pos.x), snap(pos.y), snap(pos.z));
    });
}

const pickNewTarget = (cubes) => {
    const somePositions = [];

    cubes.forEach(cube => {
        checkNeighbors(cube).forEach(pos => {
            const key = `${pos.x},${pos.y},${pos.z}`;
            if (!occupied.has(key)) {
                somePositions.push(pos);
            }
        });
    });

    if (somePositions.length === 0) {
        return new THREE.Vector3(
            snap((Math.random() - 0.5) * 6),
            snap((Math.random() - 0.5) * 6),
            snap(zOffset + (Math.random() - 0.5) * 6));
    }

    return somePositions[Math.floor(Math.random() * somePositions.length)];
}



export const cubeCluster = (scene, amount) => {
    const currentPos = new THREE.Vector3(0, 0, -3);
    occupied.clear();

    const cubes = [];
    cubes.push(cube(scene, currentPos));

    let created = 1;
    let attempts = 0;
    const maxAttempts = Math.max(amount * 20, 100);

    while (created < amount && attempts < maxAttempts) {
        const randomCube = cubes[Math.floor(Math.random() * cubes.length)];
        const randomDir = directions[Math.floor(Math.random() * directions.length)];

        const newPos = randomCube.position.clone().add(new THREE.Vector3(...randomDir));
        const key = `${newPos.x},${newPos.y},${newPos.z}`;
        attempts++;

        if (!occupied.has(key)) {
            cubes.push(cube(scene, newPos));
            occupied.add(key);
            created++;
        }
    }
    return cubes;
}

export const animateCluster = (object, time) => {
    if (!Array.isArray(object)) return;
    object.forEach((cub) => animateCube(cub, time));
    console.log(occupied);
}

export const cube = (scene, position = new THREE.Vector3(0, 0, -3)) => {
    const geometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
    // const material = new THREE.MeshNormalMaterial();
     const material = new THREE.MeshBasicMaterial({
            color : new THREE.Color(0.1, 0.1, 0.1),
            wireframe: true
        });
    const glassMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xdfb9b9,
    transparent: true,
    opacity: 0.2,
    roughness: 0,
    iridescence: 1,
    metalness: 0,
    reflectivity: 1,
    clearcoat: 1,
    clearcoatRoughness: 0,
    ior: 2 // Index of Refraction, typical for glass
});
    const mesh = new THREE.Mesh(geometry, glassMaterial);
    mesh.position.copy(position);

    const key = `${position.x},${position.y},${position.z}`;
    mesh.userData.key = key;
    mesh.userData.state = "idle";
    mesh.userData.waitUntil = 0;
    occupied.add(key);
    mesh.userData.target = new THREE.Vector3(
        snap((Math.random() - 0.5) * 6),
        snap((Math.random() - 0.5) * 6),
        snap(zOffset + (Math.random() - 0.5) * 6)
    );
    // group.add(mesh);
    // console.log(mesh.userData.target);
    scene.add(mesh);
    return mesh;
}

export const animateCube = (cube, time) => {
    const target = cube.userData.target;
    const speed = 0.005;

    if (cube.userData.state === "idle0") {
        if (time < cube.userData.waitUntil) {
            return;
        }

        occupied.delete(cube.userData.key);
        cube.userData.state = "moving";
    }

    const arrived =
        Math.abs(cube.position.x - target.x) < 0.05 &&
        Math.abs(cube.position.y - target.y) < 0.05 &&
        Math.abs(cube.position.z - target.z) < 0.05;

    if (arrived) {
        const key = `${target.x},${target.y},${target.z}`;
        if (!occupied.has(key)) {
            cube.userData.key = key;
            occupied.add(key);
            cube.userData.state = "idle";
            cube.userData.waitUntil = time + 7000;

            cube.userData.target.set(
                snap((Math.random() - 0.5) * 6),
                snap((Math.random() - 0.5) * 6),
                snap(zOffset + (Math.random() - 0.5) * 6)
            );
            return;
        } else {
            cube.userData.target.set(
                snap((Math.random() - 0.5) * 6),
                snap((Math.random() - 0.5) * 6),
                snap(zOffset + (Math.random() - 0.5) * 6)
            );
            return;
        }
    }

    if (Math.abs(cube.position.x - target.x) > 0.05) {
        cube.position.x += (target.x > cube.position.x ? speed : -speed);
    }
    else if (Math.abs(cube.position.y - target.y) > 0.05) {
        cube.position.y += (target.y > cube.position.y ? speed : -speed);
    }
    else if (Math.abs(cube.position.z - target.z) > 0.05) {
        cube.position.z += (target.z > cube.position.z ? speed : -speed);
    }
    // else {
    //     cube.userData.target.set(
    //         (Math.random() - 0.5) * 6,
    //         (Math.random() - 0.5) * 6,
    //         (Math.random() - 0.5) * 6
    //     );
    // }
}

// to check if there is a cube on the way, need to store every cube position. 
// array of occuied positions. 
// when moving to the new position their positions is deleted from occupied positions
// when arriving to the new position, push new position to the occupied positions. 
// two moving cubes are allowed to overlap eachover, but not in stay in the same position. 
// when arrived to the target position stays a bit, then decides if needs to move to another one.
// chosen position can only be close to someone 
// So i store target positions in the occupied. 
//check who is on the way in axis x on axis y  and on axis z. 
// if there is someone on the way change the target to the opposite direction. 
// what if the walls don't connect anymore? 
// has to be always connecting faces unless traveling to the new possition.
// target has to be something snaped to the grid, not just random number. 

