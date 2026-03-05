import * as THREE from 'three';
import { pointParticles } from '../particles/pointParticles.js';
import { platform, rigidPlatform, world } from '../components/platform.js';
import { createMeshParticles, updateMeshParticles } from '../particles/meshParticles.js';
import { createShape } from '../components/shape.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const canvas = document.querySelector('#scene');
const scene = new THREE.Scene();
const grass = '/img/test.png';
const ocean = '/img/test3.png';
const fire = '/img/test2.png';
const sand = '/img/test4.png';
let animationId;
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
};

//CAMERA
const camera = new THREE.PerspectiveCamera(40, sizes.width / sizes.height, 0.1, 100);
camera.position.set(0, 4, 9);
scene.add(camera);

const controls = new OrbitControls(camera, canvas);
controls.minPolarAngle = 0;
controls.maxPolarAngle = Math.PI / 2;
controls.enableDamping = true;
controls.target.set(0, 0, 0);

//LIGHT
const ambient = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambient);

const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

//HELPERS
const helpers = () => {
    const size = 10;
    const divisions = 20;
    const gridHelper = new THREE.GridHelper(size, divisions);
    const axesHelper = new THREE.AxesHelper(5);
    scene.add(gridHelper, axesHelper);
}
helpers();

//PLATFORMS
const platform1 = platform();
platform1.position.set(1, 0.85, 0);
platform1.rotation.y = Math.PI / 5;
platform1.rotation.z = Math.PI / 10;
rigidPlatform(platform1);
scene.add(platform1);

const platform2 = platform();
platform2.position.set(-0.5, 0.5, 1);
platform2.rotation.y = -Math.PI / 4;
rigidPlatform(platform2);
scene.add(platform2);

const platform3 = platform();
platform3.position.set(-1, 1.25, -1);
platform3.rotation.y = Math.PI / 3;
rigidPlatform(platform3);
scene.add(platform3);

//PARTICLES
pointParticles(scene, grass, 5, 5);
pointParticles(scene, ocean, -5, 5);
pointParticles(scene, fire, 5, -5);
pointParticles(scene, sand, -5, -5);
const meshParticlesState = createMeshParticles(scene);

createShape(scene);

const draw = () => {
    animationId = requestAnimationFrame(draw);
    controls.update();
    updateMeshParticles(meshParticlesState);
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