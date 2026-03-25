import * as THREE from 'three';
import { blobs, animateBlobs } from '../particles/blobs.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { cubeCluster, animateCluster } from '../components/three/cubes.js';
import { populationControl } from '../components/three/evolution.js';

const canvas = document.querySelector('#scene');
const scene = new THREE.Scene();

let animationId;
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
};

//CAMERA
const camera = new THREE.PerspectiveCamera(40, sizes.width / sizes.height, 0.1, 100);
camera.position.set(0, 0, 9);
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

// Create a static cube to display remote color
const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
const cubeMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
const staticCube = new THREE.Mesh(cubeGeometry, cubeMaterial);
staticCube.position.set(0, 0, 0);
scene.add(staticCube);


export const handleRemoteData = (data) => {
    if (!data || !data.hex) return;
    staticCube.material.color.set(data.hex);
    console.log('Cube color updated to:', data.hex);
};

let angle = 0;

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

    angle += 0.002;

    camera.position.x = Math.cos(angle) * 9;
    camera.position.z = Math.sin(angle) * 9;
    camera.position.y = 0;

    camera.lookAt(0, 0, 0);

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