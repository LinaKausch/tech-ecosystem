import * as THREE from 'three';
import { createMesh, updateMesh } from './agentMesh.js';
import { wander } from '../behaviour/wander.js';
import {float, floatInit} from '../behaviour/float.js';
import RAPIER from '@dimforge/rapier3d-compat';
await RAPIER.init();
export const world = new RAPIER.World(new RAPIER.Vector3(0, 0, 0));
world.gravity = { x: 0, y: 0, z: 0 };


export const createAgent = (
    scene,
    dna = null,
    movement = null,
    behaviour = float,
    generation = 1
) => {

    // if lifeStage = child then size  = 0.01 & size += 0.001
    // if size === 0.012 then lifestage = adult & size = 0.012
    //if generation = 1 && size = 0.012 then add generation 2 agents with size = 0.01
    // if generation = 2 && size  =  0.012 wait for user input for dna
    // if get user input data then choose one random agent - generation = 2 && size = 0.012 - mix dna and release generation 3 
    // generation = 3 && size = 0.012 then exchange data with generation 3 random agent? 

    const agentDNA = dna ?? {
        size: 0.01,
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
        lifeStage: agentDNA.size < 0.12 ? 'child' : 'adult',
        target: null,
        mesh: null,
        rigidBody: null
    };

    agent.mesh = createMesh(agent.dna);
    floatInit(agent.mesh);
    scene.add(agent.mesh);

    const rigidBodyDesc = RAPIER.RigidBodyDesc.dynamic()
        .setTranslation(agent.position.x, agent.position.y, agent.position.z)
        .setLinearDamping(1.0);
    agent.rigidBody = world.createRigidBody(rigidBodyDesc);

    const colliderDesc = RAPIER.ColliderDesc.ball(agent.dna.size + 0.2);
    world.createCollider(colliderDesc, agent.rigidBody);
    // console.log(agent.rigidBody);
    return agent;
}

export const updateAgent = (agent, dt) => {
    handleGrowth(agent);
    const steeringF = agent.behaviour(agent, dt);

    if (agent.behaviour === float && agent.rigidBody) {
        agent.rigidBody.setTranslation({
            x: agent.mesh.position.x,
            y: agent.mesh.position.y,
            z: agent.mesh.position.z
        }, true);
    }

    else if (steeringF && agent.rigidBody) {
        moveAgent(agent, steeringF);
    }

    if (agent.rigidBody) {
        const translation = agent.rigidBody.translation();
        const rotation = agent.rigidBody.rotation();

        agent.mesh.position.set(translation.x, translation.y, translation.z);
        agent.mesh.quaternion.set(rotation.x, rotation.y, rotation.z, rotation.w);

        agent.position.copy(agent.mesh.position);
    }

    // updateMesh(agent.mesh, agent);
}

export const moveAgent = (agent, forceVector) => {
    if (agent.rigidBody) {
        agent.rigidBody.setLinvel({
            x: forceVector.x,
            y: forceVector.y,
            z: forceVector.z
        }, true);
    }
};

export const createBoundBox = (world, size = 10) => {
    const halfSize = size / 2;
    const thickness = 0.5;

    const createWall = (x, y, z, w, h, d) => {
        const wallDesc = RAPIER.RigidBodyDesc.fixed().setTranslation(x, y, z);
        const wallBody = world.createRigidBody(wallDesc);
        const wallCollider = RAPIER.ColliderDesc.cuboid(w, h, d);
        world.createCollider(wallCollider, wallBody);

    }
    createWall(0, -halfSize, 0, halfSize, thickness, halfSize); 
    createWall(0, halfSize, 0, halfSize, thickness, halfSize); 
    createWall(-halfSize, 0, 0, thickness, halfSize, halfSize); 
    createWall(halfSize, 0, 0, thickness, halfSize, halfSize); 
    createWall(0, 0, -halfSize, halfSize, halfSize, thickness); 
    createWall(0, 0, halfSize, halfSize, halfSize, thickness); 
}

export const handleGrowth = (agent, world) => {
    const adultS = 0.12;
    const growthRate = 0.0001;

    if (agent.lifeStage === 'child') {
        agent.dna.size += growthRate;
        agent.mesh.scale.setScalar(agent.dna.size / 0.01);
        if (agent.dna.size >= adultS) {
            agent.dna.size = adultS;
            agent.lifeStage = 'adult';
            console.log('Agent is adult now');
        }
    }
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