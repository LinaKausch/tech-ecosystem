import * as THREE from 'three';
import { blobs, animateBlobs } from '../particles/blobs.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { cubeCluster, animateCluster } from '../components/cubes.js';
import { populationControl } from '../components/evolution.js';

const canvas = document.querySelector('#scene');
const scene = new THREE.Scene();

let animationId;
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
};

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
// const ambient = new THREE.AmbientLight(0xfffffff, 2);
// scene.add(ambient);

const directional = new THREE.DirectionalLight(0x220000, 200);
directional.position.set(10, 0, 7.5);
directional.target.position.set(0, 0, 0);
scene.add(directional);

const directional2 = new THREE.DirectionalLight(0x002000, 200);
directional2.position.set(-10, 0, 7.5);
directional2.target.position.set(0, 0, 0);
scene.add(directional2);

const directionalTop = new THREE.DirectionalLight(0x0021FF, 200);
directionalTop.position.set(0, 10, 0);
directionalTop.target.position.set(0, 0, 0);
scene.add(directionalTop);

const directionalFront = new THREE.DirectionalLight(0x220000, 200);
directionalFront.position.set(0, 0, 10);
directionalFront.target.position.set(0, 0, 0);
scene.add(directionalFront);

// const directionalBot = new THREE.DirectionalLight(0x0000ff, 200);
// directionalBot.position.set(0, -10, 0);
// directionalBot.target.position.set(0, 0, 0); 
// scene.add(directionalBot);


const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const blobsState = blobs(scene);
const agents = cubeCluster(scene, 100);

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

const draw = () => {
    animationId = requestAnimationFrame(draw);

    // agents.forEach(agent => {
    //     updateAgent(agent, performance.now());
    //     if (agent.isDead) {
    //         scene.remove(agent.mesh);
    //     }
    // })
    animateCluster(scene, agents, performance.now());
    const aliveAgents = agents.filter(agent => !agent.isDead);
    const deadAgents = agents.filter(agent => agent.isDead);

    populationControl(scene, agents);
    controls.update();
    animateBlobs(blobsState, performance.now());
    renderer.render(scene, camera);
    console.log("alive:", aliveAgents.length, "dead:", deadAgents.length);

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