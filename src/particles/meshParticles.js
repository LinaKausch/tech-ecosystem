import * as THREE from 'three';

export const createMeshParticles = (scene, options = {}) => {
    const {
        count = 200,
        minRadius = 2,
        spread = 10,
        particleRadius = 0.05,
        color = 0x26263C
    } = options;

    const center = new THREE.Vector3(0, 0, 0);
    const geometry = new THREE.SphereGeometry(particleRadius, 6, 6);
    const material = new THREE.MeshBasicMaterial({
        color,
        wireframe: true
    });
    const instanced = new THREE.InstancedMesh(geometry, material, count);
    scene.add(instanced);

    const system = new THREE.Object3D();
    const particles = [];

    for (let i = 0; i < count; i++) {
        const position = new THREE.Vector3(
            (Math.random() - 0.5) * spread,
            (Math.random() - 0.5) * spread,
            (Math.random() - 0.5) * spread
        );

        const radius = Math.max(position.distanceTo(center), minRadius);
        particles.push({
            position,
            radius,
            angleX: Math.atan2(position.z, Math.sqrt(position.x * position.x + position.y * position.y)),
            angleY: Math.atan2(position.y, position.x),
            offset: new THREE.Vector3(0, 0, 0)
        });

        system.position.copy(position);
        system.updateMatrix();
        instanced.setMatrixAt(i, system.matrix);
    }

    instanced.instanceMatrix.needsUpdate = true;
    return { instanced, particles, system };
};

export const updateMeshParticles = (state, speed = 0.001) => {
    const { instanced, particles, system } = state;

    for (let i = 0; i < particles.length; i++) {
        const particle = particles[i];
        particle.angleY += speed;
        particle.angleX += speed;

        const x = particle.radius * Math.cos(particle.angleX) * Math.cos(particle.angleY);
        const y = particle.radius * Math.sin(particle.angleY);
        const z = particle.radius * Math.cos(particle.angleX) * Math.sin(particle.angleY);

        particle.position.set(
            x + particle.offset.x,
            y + particle.offset.y,
            z + particle.offset.z
        );

        system.position.copy(particle.position);
        system.updateMatrix();
        instanced.setMatrixAt(i, system.matrix);
    }

    instanced.instanceMatrix.needsUpdate = true;
};
