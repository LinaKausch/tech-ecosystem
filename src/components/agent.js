import * as THREE from 'three';
import { createMesh, updateMesh } from './agentMesh.js';
import { wander } from '../behaviour/wander.js';

//position, velocity, dna, behaviour, generation, lifeStage, target
export const createAgent = (
    scene,
    dna = null,
    movement = null,
    behaviour = wander,
    generation = 1
) => {


    const agentDNA = dna ?? {
        size: 0.12,
        color: new THREE.Color(Math.random(), Math.random(), Math.random()),
        segmentsW: Math.floor(THREE.MathUtils.randFloat(3, 16)),
        segmentsH: Math.floor(THREE.MathUtils.randFloat(3, 16))
    };

    const agentMovement = movement ?? {
        velocity: new THREE.Vector3(
            Math.random() - 0.5,
            Math.random() - 0.5,
            Math.random() - 0.5
        ).normalize(),
        direction: Math.random() * Math.PI * 2,
        speed: 0.01,
        circleRadius: 5,
        circleDistance: 50,
        angleChange: 0.2
    };

    const agent = {
        position: new THREE.Vector3(),
        dna: agentDNA,
        movement: agentMovement,
        behaviour,
        generation,
        lifeStage: 'child',
        target: null,
        mesh: null,
    };

    agent.mesh = createMesh(agent.dna);
    scene.add(agent.mesh);

    return agent;
}

export const updateAgent = (agent, dt) => {
    agent.behaviour(agent, dt);
    updateMesh(agent.mesh, agent);
}


//postion 
//velocity
// dna
//movement
//generation
//lifeStage
//target
//mesh
//behaviour
//updteMesh

// Agent {
//     dna: {
//         size,
//         color,
//         speed,
//         circleRadius,
//         circleDistance,
//         angleChange
//     },
//     position: Vector3,
//     velocity: Vector3,
//     movement: {
//         direction
//     },
//     generation: 1,
//     lifeStage: 'child',
//     target: null,
//     mesh: Mesh,
//     behavior: function(agent, dt),
//     updateMesh: function() { ... } // updates mesh based on agent data
// }