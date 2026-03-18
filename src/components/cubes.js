import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { float, floatInit, occupied, objectSize, snap } from '../behaviour/float.js';
import { round } from 'three/tsl';

const cubeSize = objectSize;

const directions = [
    [cubeSize, 0, 0],
    [-cubeSize, 0, 0],
    [0, cubeSize, 0],
    [0, -cubeSize, 0],
    [0, 0, cubeSize],
    [0, 0, -cubeSize]
];


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
        const snappedPos = new THREE.Vector3(snap(newPos.x), snap(newPos.y), snap(newPos.z));
        const key = `${snappedPos.x},${snappedPos.y},${snappedPos.z}`;
        attempts++;

        if (!occupied.has(key)) {
            cubes.push(cube(scene, snappedPos));
            occupied.add(key);
            created++;
        }
    }
    return cubes;
}

export const animateCluster = (object, time) => {
    if (!Array.isArray(object)) return;
    object.forEach((cub) => animateCube(cub, time));
}

export const cube = (scene, position = new THREE.Vector3(0, 0, -3)) => {
    const geometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
    const roundGeometry = new RoundedBoxGeometry(cubeSize, cubeSize, cubeSize, 1, 0.001);

    const smthnr = 0.05;
    const smth = roundGeometry.attributes.position;
    for (let i = 0 ; i< smth.count; i++){
        smth.setXYZ (i,
            smth.getX(i) + (Math.random() - 0.5) * smthnr,
            smth.getY(i) + (Math.random() - 0.5) * smthnr,
            smth.getZ(i) + (Math.random() - 0.5) * smthnr 
        )
    }
    smth.needsUpdate = true;
    roundGeometry.computeVertexNormals();

//with each generation cubes become more distorted? close to the distruction.?

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
        ior: 2
    });

    const cube = new THREE.Mesh(roundGeometry, glassMaterial);
    cube.position.copy(position);

    scene.add(cube);
    floatInit(cube);
    return cube;
}

export const animateCube = (cube, time) => {
    float(cube, time);
}


