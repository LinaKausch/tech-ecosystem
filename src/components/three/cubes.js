import * as THREE from 'three';
import { occupied, objectSize, snap } from '../../behaviour/float.js';
import { orderCleanup } from '../../behaviour/order.js';
import { createAgent, updateAgent } from './agent.js';

const cubeSize = objectSize;
let extension = 0;
const cubeDim = cubeSize + extension;


const directions = [
    [cubeSize, 0, 0],
    [-cubeSize, 0, 0],
    [0, cubeSize, 0],
    [0, -cubeSize, 0],
    [0, 0, cubeSize],
    [0, 0, -cubeSize]
];

export const cubeCluster = async (scene, amount) => {
    const currentPos = new THREE.Vector3(0, 0, 0);
    occupied.clear();

    const agents = [];
    // cubes.push(cube(scene, currentPos));
    const firstAgent = await createAgent(scene, null, currentPos);
    agents.push(firstAgent);
    occupied.add(`${snap(currentPos.x)},${snap(currentPos.y)},${snap(currentPos.z)}`);

    let created = 1;
    let attempts = 0;
    const maxAttempts = amount * 20;

    while (created < amount && attempts < maxAttempts) {
        attempts++;

        const randomAgent = agents[Math.floor(Math.random() * agents.length)];
        const randomDir = directions[Math.floor(Math.random() * directions.length)];

        const newPos = randomAgent.position.clone().add(new THREE.Vector3(...randomDir));
        const snappedPos = new THREE.Vector3(snap(newPos.x), snap(newPos.y), snap(newPos.z));
        const key = `${snappedPos.x},${snappedPos.y},${snappedPos.z}`;


        if (!occupied.has(key)) {
            const newAgent = await createAgent(scene, null, snappedPos);
            agents.push(newAgent);
            occupied.add(key);
            created++;
        }
    }
    return agents;
}

export const animateCluster = (scene, objects, dt) => {
    if (!Array.isArray(objects)) return;
    objects.forEach((agent) => {
        updateAgent(agent, dt);

        if (agent.isDead) {
            if (agent.mesh) {
                orderCleanup(agent.mesh);
                
                // Dispose all geometries and materials
                agent.mesh.traverse((child) => {
                    if (child.geometry) child.geometry.dispose();
                    if (child.material) {
                        if (Array.isArray(child.material)) {
                            child.material.forEach(mat => mat.dispose());
                        } else {
                            child.material.dispose();
                        }
                    }
                });
                
                scene.remove(agent.mesh);
            }
            scene.remove(agent);
        }
    })
}

