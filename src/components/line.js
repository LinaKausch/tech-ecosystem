import * as THREE from 'three';

export const createLine = (scene, start, end, axis = 'y') => {
    const curve = new THREE.LineCurve3(start, end);

    const points = curve.getPoints(20);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);

    const material = new THREE.LineBasicMaterial({
        color: 0x4a6cff
    });
    const line = new THREE.Line(geometry, material);
    scene.add(line);

    const spheres = [];
    points.forEach((point) => {
        const dotG = new THREE.SphereGeometry(0.02, 8, 8);
        const dotM = new THREE.MeshBasicMaterial({
            color: 0x4a6cff
        });
        const sphere = new THREE.Mesh(dotG, dotM);
        sphere.position.copy(point);
        scene.add(sphere);
        spheres.push(sphere);
    });

    const baseValues = points.map(p => p[axis]);
    const offsets = points.map(() => Math.random() * 100);
    return { line, points, offsets, spheres, axis, baseValues };
}

export const animateLine = (lineState, time) => {
    const { line, points, offsets, spheres, axis, baseValues } = lineState;
    const positions = line.geometry.attributes.position;

    for (let i = 1; i < positions.count - 1; i++) {
        const base = baseValues[i];
        const value = base + Math.sin(time * 2 + offsets[i]) * 0.3;

        if (axis === 'x') { positions.setX(i, value); }
        if (axis === 'y') { positions.setY(i, value); }
        if (axis === 'z') { positions.setZ(i, value); }

        if (spheres && spheres[i]) {
            spheres[i].position[axis] = value;
        }
    }
    positions.needsUpdate = true;
}