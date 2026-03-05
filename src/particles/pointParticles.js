import * as THREE from 'three';
const textureLoader = new THREE.TextureLoader();

export const pointParticles = (scene, url, cubeZ, cubeX) => {
    let particleCount = 20
    const geometry = new THREE.BufferGeometry(2, 2);
    const positions = new Float32Array(particleCount * 3);
    const particleTexture = textureLoader.load(url);

    for (let i = 0; i < particleCount; i++) {
        positions[i * 3 + 1] = (Math.random()) * 5
        positions[i * 3 + 2] = (Math.random()) * cubeZ
        positions[i * 3 + 3] = (Math.random()) * cubeX
    }

    geometry.setAttribute(
        'position',
        new THREE.BufferAttribute(positions, 3)
    )

    const material = new THREE.PointsMaterial({
        map: particleTexture,
        size: 0.5,
        color: 0x3B3B3B,
    })
    const particles = new THREE.Points(geometry, material)
    scene.add(particles);
}
