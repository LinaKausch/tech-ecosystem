import * as THREE from 'three';

export const createMesh = (agentDNA) => {
    const geometry = new THREE.SphereGeometry(agentDNA.size, agentDNA.segmentsW, agentDNA.segmentsH);
    const material = new THREE.MeshPhysicalMaterial({ color: agentDNA.color, roughness: 0});
    const mesh = new THREE.Mesh(geometry, material);
    return mesh;
}

export const updateMesh = (mesh, agent) => {
    if (agent.rigidBody) {
        const translation = agent.rigidBody.translation();
        const rotation = agent.rigidBody.rotation();

        mesh.position.set(translation.x, translation.y, translation.z);
        mesh.quaternion.set(rotation.x, rotation.y, rotation.z, rotation.w);
    } else {
        mesh.position.copy(agent.position);
    }
    // mesh.scale.set (agent.dna.size, agent.dna.size, agent.dna.size);
    // mesh.material.color.set(agent.dna.color);
}