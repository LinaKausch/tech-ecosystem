import * as THREE from 'three';
import { createAgent, updateAgent, world, createBoundBox } from '../components/agent.js';
import { createOffspring } from '../components/evolution.js';
import { blobs, animateBlobs } from '../particles/blobs.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { wander } from '../behaviour/wander.js';
import { cubeCluster, animateCluster } from '../components/cubes.js';

const canvas = document.querySelector('#scene');
const scene = new THREE.Scene();

let animationId;
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight - 200
};
const agents = [];

//CAMERA
const camera = new THREE.PerspectiveCamera(40, sizes.width / sizes.height, 0.1, 100);
camera.position.set(0, 3, 9);
scene.add(camera);

const controls = new OrbitControls(camera, canvas);
controls.minPolarAngle = 0;
controls.maxPolarAngle = Math.PI / 2;
controls.enableDamping = true;
controls.target.set(0, 0, 0);

//LIGHT
const ambient = new THREE.AmbientLight(0xfffffff, 1);
scene.add(ambient);

const directional = new THREE.DirectionalLight(0x220000, 5);
directional.position.set(5, 10, 7.5);
scene.add(directional);

const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

//HELPERS
// const helpers = () => {
//     const size = 10;
//     const divisions = 20;
//     const gridHelper = new THREE.GridHelper(size, divisions);
//     const axesHelper = new THREE.AxesHelper(5);
//     scene.add(gridHelper, axesHelper);
// }
// helpers();

// const meshParticlesState = createMeshParticles(scene);

for (let i = 0; i < 2; i++) {
    agents.push(createAgent(scene));
}

const parent1 = agents[0];
const parent2 = agents[1];
let offspringsSpawned = false;
let gen3Spawned = false;
let remoteDNA = null;

const cubes = cubeCluster(scene, 100);

export const getRemoteDNA = () => remoteDNA;

export const handleRemoteData = (data) => {
    if (!data) return;

    if (data.type === 'dna-input' && data.dna) {
        remoteDNA = {
            ...data.dna,
            size: data.dna.size ?? 0.01,
            segmentsW: data.dna.segmentsW ?? 8,
            segmentsH: data.dna.segmentsH ?? 8,
            color: new THREE.Color(
                data.dna.color?.r ?? 1,
                data.dna.color?.g ?? 1,
                data.dna.color?.b ?? 1
            )
        };
        console.log('Scene received DNA input:', remoteDNA);
    }
};

console.log(parent1.dna);
const blobsState = blobs(scene);
createBoundBox(world);

const handleRemoteEvolution = () => {
    const gen2Agents = agents.filter(agent => agent.generation === 2);
    const adultGen2Agents = gen2Agents.filter(agent => agent.lifeStage === 'adult');

    if (!gen3Spawned && remoteDNA && adultGen2Agents.length > 0) {
        const randomIndex = Math.floor(Math.random() * adultGen2Agents.length);
        const selectedAgent = adultGen2Agents[randomIndex];

        const gen3Offsprings = createOffspring(scene, selectedAgent, { dna: remoteDNA }, 4);

        selectedAgent.behaviour = wander;
        gen3Offsprings.forEach(offspring => {
            offspring.target = selectedAgent;
        });
        agents.push(...gen3Offsprings);
        gen3Spawned = true;
        console.log('Remote DNA received — spawned Gen 3 offsprings');
    }
}
//what about the other generations? 


// if not ready for gen3 - user input not works, if ready for gen3 but no input - waiting for input
// if gen3 not ready && user input then delete user input - there is no ready particles to mix
// first check if gen3 ready - if not then ignore input, if gen3 ready but no input then waiting for input, if gen3 ready and get input then spawn gen3
// spawn gen3 available many times as many as there is generation 2 agents adults && no parents


const draw = () => {
    animationId = requestAnimationFrame(draw);
    controls.update();
    // updateMeshParticles(meshParticlesState);
    handleRemoteEvolution();
    agents.forEach(agent => {
        updateAgent(agent, performance.now());
    });

    if (!offspringsSpawned && parent1.lifeStage === 'adult' && parent2.lifeStage === 'adult') {
        const offsprings = createOffspring(scene, parent1, parent2, 4);
        agents.push(...offsprings);
        offspringsSpawned = true;
        console.log('Both parents adult — spawned offspring');
    }
    console.log(agents.length);
    animateCluster(cubes, performance.now());
    animateBlobs(blobsState, performance.now());
    world.step();

    renderer.render(scene, camera);
}

draw();

if (import.meta.hot) {
    import.meta.hot.dispose(() => {
        cancelAnimationFrame(animationId);
        scene.clear();
        renderer.dispose();
        controls.dispose();
    });
}