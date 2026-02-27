import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const canvas = document.querySelector('#scene');
const scene = new THREE.Scene();
// scene.background = new THREE.Color(0x0000ff);

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
};

const camera = new THREE.PerspectiveCamera(40, sizes.width / sizes.height, 0.1, 100);
camera.position.z = 10;
camera.lookAt(1, 1, 1);
scene.add(camera);

const controls = new OrbitControls(camera, canvas);
controls.minPolarAngle = 0;
controls.maxPolarAngle = Math.PI / 2;
controls.enableDamping = true;

const ambient = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambient);

const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const cube = () => {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshNormalMaterial({
        // color: 0x00aaff,
    });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);
}

const draw = () => {
    requestAnimationFrame(draw);
    cube();
    renderer.render(scene, camera);
}

draw();