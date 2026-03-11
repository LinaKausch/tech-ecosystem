import * as THREE from 'three';

export const createMesh = (agentDNA) => {
    const geometry = new THREE.SphereGeometry(agentDNA.size, agentDNA.segmentsW, agentDNA.segmentsH);
    const material = new THREE.MeshToonMaterial({ color: agentDNA.color });
    const mesh = new THREE.Mesh(geometry, material);
    return mesh;
}

export const updateMesh = (mesh, agent) => {
    mesh.position.copy(agent.position);
    // mesh.scale.set (agent.dna.size, agent.dna.size, agent.dna.size);
    // mesh.material.color.set(agent.dna.color);
}