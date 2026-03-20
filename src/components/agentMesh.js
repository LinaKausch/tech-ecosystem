import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { float, floatInit, occupied, objectSize, snap } from '../behaviour/float.js';

const cubeSize = objectSize;

export const createMesh = (agentDNA) => {

   const w = cubeSize + (agentDNA.widthExt || 0);
    const h = cubeSize + (agentDNA.heightExt || 0);
    const d = cubeSize + (agentDNA.depthExt || 0);
    // const cubeDim = cubeSize + (agentDNA?.extension ?? 0);
    const roundGeometry = new RoundedBoxGeometry(w, h, d, 1, 0.001);

    const noise = 0.00;
    const displace = roundGeometry.attributes.position;
    for (let i = 0; i < displace.count; i++) {
        displace.setXYZ(i,
            displace.getX(i) + (Math.random() - 0.5) * noise,
            displace.getY(i) + (Math.random() - 0.5) * noise,
            displace.getZ(i) + (Math.random() - 0.5) * noise
        )
    }
    displace.needsUpdate = true;
    roundGeometry.computeVertexNormals();

    const material = new THREE.MeshPhysicalMaterial({
        color: agentDNA.color,
        transparent: true,
        opacity: agentDNA.opacity,
        roughness: 0,
        iridescence: 0,
        metalness: agentDNA.metalness,
        reflectivity: 1,
        clearcoat: 1,
        clearcoatRoughness: 0,
        ior: 2
    });
    // const cube = new THREE.Mesh(roundGeometry, material);
    // cube.position.copy(agent.position);

    return new THREE.Mesh(roundGeometry, material);

}

export const updateMesh = (mesh, time) => {
    float(mesh, time);
}