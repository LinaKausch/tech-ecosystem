import * as THREE from 'three';
import { MarchingCubes } from "three/examples/jsm/objects/MarchingCubes.js";


export const blobs = (scene, options = {}) => {
    const {
        count = 20,
        spread = 20
    } = options;

    const resolution = 64;
    const material = new THREE.MeshNormalMaterial();

    const blobs = new MarchingCubes(resolution, material, false, false);
    blobs.position.set(0, 0, 0);
    const cubeScale = 1;
    blobs.scale.set(cubeScale, cubeScale, cubeScale);
    blobs.isolation = 10;
    scene.add(blobs);

    const particles = [];

    for (let i = 0; i < count; i++) {
        particles.push({
            position: new THREE.Vector3(
                (Math.random() - 0.5) * spread,
                (Math.random() - 0.5) * spread,
                (Math.random() - 0.5) * spread
            ),
            velocity: new THREE.Vector3(
                (Math.random() - 0.5) * 0.02,
                (Math.random() - 0.5) * 0.02,
                (Math.random() - 0.5) * 0.02
            )
        });

    }

    return { blobs, particles, spread };

}
 
export const animateBlobs = (state, time = performance.now()) => {
    if (!state?.blobs || !state?.particles) {
        return;
    }

    const { blobs, particles, spread } = state;
    const lastTime = state.lastTime ?? time;
    const dt = Math.min((time - lastTime) * 0.001, 0.05);
    state.lastTime = time;

    const strength = 0.05;
    const subtract = 8;

    for (let i = 0; i < particles.length; i++) {
        const particle = particles[i];
        particle.position.addScaledVector(particle.velocity, dt * 60);

        ['x', 'y', 'z'].forEach(axis => {
            if (particle.position[axis] < -spread / 2 || particle.position[axis] > spread / 2) {
                particle.velocity[axis] *= -1;
                particle.position[axis] = THREE.MathUtils.clamp(particle.position[axis], -spread / 2, spread / 2);
            }
        });
    }

    blobs.reset();

    for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        const x = (p1.position.x / spread) * 0.5 + 0.5;
        const y = (p1.position.y / spread) * 0.5 + 0.5;
        const z = (p1.position.z / spread) * 0.5 + 0.5;

        blobs.addBall(x, y, z, strength, subtract);
    }

    blobs.update();
};
