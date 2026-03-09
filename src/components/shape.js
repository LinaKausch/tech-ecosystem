import * as THREE from 'three';

export const createDiamond = (scene) => {
    const geometry = new THREE.OctahedronGeometry(0.5, 0);
    const material = new THREE.LineBasicMaterial({ color: 0xffffff });
    const octahedron = new THREE.Line(geometry, material);
    scene.add(octahedron);

    octahedron.position.set(0, 0, 0);
    return octahedron;
}

export const updateDiamond = (shape, time) => {
    shape.rotation.y = time * 0.001;
    // shape.rotation.z = time * 0.001;
}