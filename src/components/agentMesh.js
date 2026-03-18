import * as THREE from 'three';

export const createMesh = (agentDNA) => {
    const geometry = new THREE.SphereGeometry(agentDNA.size, agentDNA.segmentsW, agentDNA.segmentsH);
    // const material = new THREE.MeshPhysicalMaterial({ color: agentDNA.color, roughness: 0});

         const glassMaterial = new THREE.MeshPhysicalMaterial({
                color: agentDNA.color,
                transparent: true,
                opacity: 0.2,
                roughness: 0.4,
                iridescence: 1,
                metalness: 0,
                reflectivity: 1,
                clearcoat: 0,
                clearcoatRoughness: 0,
                ior: 2,
                flatShading: true,
            });

                const smthnr = 0.01;
    const smth = geometry.attributes.position;
    for (let i = 0 ; i< smth.count; i++){
        smth.setXYZ (i,
            smth.getX(i) + (Math.random() - 0.5) * smthnr,
            smth.getY(i) + (Math.random() - 0.5) * smthnr,
            smth.getZ(i) + (Math.random() - 0.5) * smthnr 
        )
    }
    smth.needsUpdate = true;
    geometry.computeVertexNormals();


    const mesh = new THREE.Mesh(geometry, glassMaterial);
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