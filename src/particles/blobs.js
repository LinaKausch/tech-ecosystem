import * as THREE from 'three';
import { MarchingCubes } from "three/examples/jsm/objects/MarchingCubes.js";
import vertex from '../shaders/vertex.glsl?raw';
import fragment from '../shaders/fragment.glsl?raw';

export const blobs = (scene, options = {}) => {
    const {
        count = 15,
        spread = 5
    } = options;

    const resolution = 64;
    // const material = new THREE.ShaderMaterial({
    //     vertexShader: vertex,
    //     fragmentShader: fragment,
    //     uniforms: {
    //         iTime: { value: 0 },
    //         iResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
    //     }
    // });

const material = new THREE.ShaderMaterial({
    vertexShader: vertex,
    fragmentShader: fragment,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide
});

    const blobs = new MarchingCubes(resolution, material, false, true);
    blobs.position.set(0, 0, 0);
    const cubeScale = 0.9;
    blobs.scale.set(cubeScale, cubeScale, cubeScale);
    blobs.isolation = 20;
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
    // blobs.material.uniforms.iTime.value = time * 0.0001;

    const lastTime = state.lastTime ?? time;
    const dt = Math.min((time - lastTime) * 0.001, 0.05);
    state.lastTime = time;

    const strength = 0.09;
    const subtract = 3;

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
