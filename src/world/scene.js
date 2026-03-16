import * as THREE from 'three';
import { pointParticles } from '../particles/pointParticles.js';
import { platform, rigidPlatform } from '../components/platform.js';
import { createMeshParticles, updateMeshParticles } from '../particles/meshParticles.js';
import { createDiamond, updateDiamond } from '../components/shape.js';
import { createAgent, updateAgent, world, createBoundBox } from '../components/agent.js';
import { createOffspring } from '../components/evolution.js';
import { createWalls, updateWalls } from '../components/walls.js';
import { blobs, animateBlobs } from '../particles/blobs.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { wander } from '../behaviour/wander.js';
import { createText } from 'three/examples/jsm/Addons.js';

const canvas = document.querySelector('#scene');
const scene = new THREE.Scene();
const grass = '/img/test.png';
const ocean = '/img/test3.png';
const fire = '/img/test2.png';
const sand = '/img/test4.png';
let animationId;
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight - 200
};
const agents = [];

//CAMERA
const camera = new THREE.PerspectiveCamera(40, sizes.width / sizes.height, 0.1, 100);
camera.position.set(0, 3, 9);
// camera.position.set(0, 0, 0);
scene.add(camera);

const controls = new OrbitControls(camera, canvas);
controls.minPolarAngle = 0;
controls.maxPolarAngle = Math.PI / 2;
controls.enableDamping = true;
controls.target.set(0, 0, 0);

//LIGHT
const ambient = new THREE.AmbientLight(0x51AA77,1);
scene.add(ambient);

const directional = new THREE.DirectionalLight(0xffffff, 5);
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

//PLATFORMS
// const platform1 = platform();
// platform1.position.set(1.2, 0.4, 0);
// platform1.rotation.y = Math.PI / 5;
// rigidPlatform(platform1);
// scene.add(platform1);

// const platform2 = platform();
// platform2.position.set(-1, -0.6, 1);
// platform2.rotation.y = -Math.PI / 4;
// rigidPlatform(platform2);
// scene.add(platform2);

// const platform3 = platform();
// platform3.position.set(-1, 0.8, -1);
// platform3.rotation.y = Math.PI / 3;
// rigidPlatform(platform3);
// scene.add(platform3);

// PARTICLES
// pointParticles(scene, grass, 5, 5);
// pointParticles(scene, ocean, -5, 5);
// pointParticles(scene, fire, 5, -5);1
// pointParticles(scene, sand, -5, -5);
const meshParticlesState = createMeshParticles(scene);

for (let i = 0; i < 2; i++) {
    agents.push(createAgent(scene));
}

const parent1 = agents[0];
const parent2 = agents[1];
let offspringsSpawned = false;
let gen3Spawned = false;
let remoteDNA = null;

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
// const diamond = createDiamond(scene);
// const wallsState = createWalls(scene);
const blobsState = blobs(scene);
createBoundBox(world);

const handleRemoteEvolution = () => {
    const gen2Agents = agents.filter(agent => agent.generation === 2);
    // if (gen2Agents.length > 0) {
    //     console.log('Gen 2 agents:', gen2Agents);
    // }
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
    updateMeshParticles(meshParticlesState);
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
    // updateDiamond(diamond, performance.now());
    // updateWalls(wallsState, performance.now() * 0.0005);
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