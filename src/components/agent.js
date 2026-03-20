import * as THREE from 'three';
import { createMesh, updateMesh } from './agentMesh.js';
import { float, floatInit } from '../behaviour/float.js';



export const createAgent = (
    scene,
    dna = null,
    position = new THREE.Vector3()
) => {

    // I need scene and dna

    const agentDNA = dna ?? {
        widthExt: Math.random() * 0.5,
        heightExt: Math.random() * 0.5,
        depthExt: Math.random() * 0.5,
        color: new THREE.Color(Math.random(), Math.random(), Math.random()),
        speed: Math.random() * 0.02,
        opacity: Math.max(0.2, Math.random()),
        metalness: Math.random(),
        healthScore: Math.random() * 100,
        mass: Math.random() * 10,
    };

    // dna: widthExt, heightExt, depthExt, color, speed, opacity, metalness
    // hidden dna: mass, healthScore, energy
    // extension: eg. cubeWidth = cubeSize + extension
    // energy: number to indicate how much energy the agent has to move
    // healthScore: probability to reproduce
    // mass: rate to survive harsh conditions


    const agent = {
        position: position.clone(),
        dna: agentDNA,
        mesh: null,
        energy: 100,
        isDead: false
    };

    agent.mesh = createMesh(agent.dna);
    agent.mesh.position.copy(agent.position);

    floatInit(agent.mesh);
    scene.add(agent.mesh);
    return agent;
}

export const updateAgent = (agent, dt) => {
    float(agent.mesh, dt);

    const burnEnergy = 0.1 / (1 + agent.dna.healthScore * 0.1);
    agent.energy -= burnEnergy;

    if (agent.energy <= 0) {
        agent.isDead = true;
    }
}

