import * as THREE from 'three';
import { createMesh, updateMesh } from './agentMesh.js';
import { agentCube, updateACube } from './agentCube.js';
import { float, floatInit } from '../../behaviour/float.js';
import { order, orderInit } from '../../behaviour/order.js';
import { or } from 'three/tsl';

const createVividColor = () => {
    const color = new THREE.Color();
    color.setHSL(
        Math.random(),
        THREE.MathUtils.randFloat(0.8, 1),
        THREE.MathUtils.randFloat(0.45, 0.65)
    );
    return color;
};

export const createAgent = async (
    scene,
    dna = null,
    position = new THREE.Vector3()
) => {

    // I need scene and dna

    const agentDNA = dna ?? {
        widthExt: Math.random() * 0.5,
        heightExt: Math.random() * 0.5,
        depthExt: Math.random() * 0.5,
        color: createVividColor(),
        speed: 0.001,
        healthScore: Math.random() * 100,
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

    // agent.mesh = createMesh(agent.dna);

    agent.mesh = await agentCube(scene, agent.dna);
    agent.mesh.position.copy(agent.position);

    // floatInit(agent.mesh);
    orderInit(agent.mesh);
    scene.add(agent.mesh);
    return agent;
}

export const updateAgent = (agent, dt) => {
    order(agent.mesh, dt);
    // float(agent.mesh, dt);
    // updateMesh(agent.mesh, dt);
    // updateACube(agent.mesh, dt);  // Removed to avoid conflict with order behavior

    const burnEnergy = 0.1 / (1 + agent.dna.healthScore * 0.1);
    agent.energy -= burnEnergy;

    if (agent.energy <= 0) {
        agent.isDead = true;
    }
}

