import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import RAPIER from '@dimforge/rapier3d-compat';

await RAPIER.init();
const world = new RAPIER.World({ x: 0, y: -9.81, z: 0 });

const canvas = document.querySelector('#scene');
const scene = new THREE.Scene();
let animationId;
const platformSize = { x: 1, y: 0.05, z: 2 };
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
};

const camera = new THREE.PerspectiveCamera(40, sizes.width / sizes.height, 0.1, 100);
camera.position.set(0, 4, 9);
scene.add(camera);

const controls = new OrbitControls(camera, canvas);
controls.minPolarAngle = 0;
controls.maxPolarAngle = Math.PI / 2;
controls.enableDamping = true;
controls.target.set(0, 0, 0);

const ambient = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambient);

const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const grid = () => {
    const size = 10;
    const divisions = 20;
    const gridHelper = new THREE.GridHelper(size, divisions);
    scene.add(gridHelper);
}

const particlesSys = () => {
    let particleCount = 500;
    const center = new THREE.Vector3(0, 0, 0);

    const geometry = new THREE.SphereGeometry(0.02, 12, 12);
    const material = new THREE.MeshNormalMaterial();

    const instanced = new THREE.InstancedMesh(geometry, material, particleCount);
    scene.add(instanced);

    const system = new THREE.Object3D();
    const particles = [];
    for (let i = 0; i < particleCount; i++) {
        const pos = new THREE.Vector3(
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 10
        );

        const radius = pos.distanceTo(center);
        particles.push({
            position: pos,
            radius: Math.max(radius, 2),
            angleX: Math.atan2(pos.z, Math.sqrt(pos.x * pos.x + pos.y * pos.y)),
            angleY: Math.atan2(pos.y, pos.x),
            angleZ: Math.random() * Math.PI * 2,
            offset: new THREE.Vector3(0, 0, 0)
        });
        system.position.copy(pos);
        system.updateMatrix();
        instanced.setMatrixAt(i, system.matrix);
    }
    instanced.instanceMatrix.needsUpdate = true;

    return { instanced, particles, system, center };
};

const pointParticles = () => {
    let particleCount = 500
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
        positions[i * 3 + 0] = (Math.random() - 0.5) * 10
        positions[i * 3 + 1] = (Math.random() - 0.5) * 10
        positions[i * 3 + 2] = (Math.random() - 0.5) * 10
    }

    geometry.setAttribute(
        'position',
        new THREE.BufferAttribute(positions, 3)
    )
    const material = new THREE.PointsMaterial({
        size: 0.1,
        color: 0xffffff
    })
    const particles = new THREE.Points(geometry, material)
    scene.add(particles);
}

const platform = () => {
    const geometry = new THREE.BoxGeometry(platformSize.x, platformSize.y, platformSize.z);
    const material = new THREE.MeshNormalMaterial();
    const platform = new THREE.Mesh(geometry, material);
    scene.add(platform);
    return platform;
};

const rigidPlatform = (mesh) => {
    const body = world.createRigidBody(
        RAPIER.RigidBodyDesc.fixed()
            .setTranslation(mesh.position.x, mesh.position.y, mesh.position.z)
    );
    const colliderDesc = RAPIER.ColliderDesc.cuboid(platformSize.x / 2, platformSize.y / 2, platformSize.z / 2);
    world.createCollider(colliderDesc, body);
};

const platform1 = platform();
platform1.position.set(1, 0.85, 0);
platform1.rotation.y = Math.PI / 5;
platform1.rotation.z = Math.PI / 10;
rigidPlatform(platform1);

const platform2 = platform();
platform2.position.set(-0.5, 0.5, 1);
platform2.rotation.y = -Math.PI / 4;
rigidPlatform(platform2);

const platform3 = platform();
platform3.position.set(-1, 1.25, -1);
platform3.rotation.y = Math.PI / 3;
rigidPlatform(platform3);

grid();
const { instanced, particles, system, center } = particlesSys();
pointParticles();
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

const localPos = new THREE.Vector3();

const isInsidePlatform = (particlePos, platform) => {
    const halfWidth = platformSize.x / 2;
    const halfHeight = platformSize.y / 2;
    const halfDepth = platformSize.z / 2;

    const localPos = new THREE.Vector3().subVectors(particlePos, platform.position);

    const invQuat = new THREE.Quaternion().setFromEuler(platform.rotation).invert();
    localPos.applyQuaternion(invQuat);

    return (
        Math.abs(localPos.x) < halfWidth &&
        Math.abs(localPos.y) < halfHeight &&
        Math.abs(localPos.z) < halfDepth
    );
};

const draw = () => {
    animationId = requestAnimationFrame(draw);
    controls.update();

    for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        const prevX = p.position.x;
        const prevY = p.position.y;
        const prevZ = p.position.z;

        p.angleY += 0.0010;
        p.angleX += 0.0010;

        const x = p.radius * Math.cos(p.angleX) * Math.cos(p.angleY);
        const y = p.radius * Math.sin(p.angleY);
        const z = p.radius * Math.cos(p.angleX) * Math.sin(p.angleY);

        p.position.set(
            x + p.offset.x,
            y + p.offset.y,
            z + p.offset.z
        );

        if (isInsidePlatform(p.position, platform1) || isInsidePlatform(p.position, platform2) || isInsidePlatform(p.position, platform3)) {
            p.position.set(prevX, prevY, prevZ);
            p.angleY -= 0.01;
            p.angleX -= 0.005;
        }

        system.position.copy(p.position);
        system.updateMatrix();
        instanced.setMatrixAt(i, system.matrix);
    }
    instanced.instanceMatrix.needsUpdate = true;
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