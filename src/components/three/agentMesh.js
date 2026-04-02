import * as THREE from 'three';
import { pcss, MeshTransmissionMaterial } from '@pmndrs/vanilla'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { float, floatInit, occupied, objectSize, snap } from '../../behaviour/float.js';
import vertex from '../../shaders/vertex.glsl?raw';
import fragment from '../../shaders/frag.glsl?raw';
const cubeSize = objectSize;

export const createMesh = (agentDNA) => {

    const w = cubeSize + (agentDNA.widthExt || 0);
    const h = cubeSize + (agentDNA.heightExt || 0);
    const d = cubeSize + (agentDNA.depthExt || 0);
    // const cubeDim = cubeSize + (agentDNA?.extension ?? 0);
    const roundGeometry = new RoundedBoxGeometry(w, h, d, 1, 0.001);

    const noise = 0;
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

    // const material = new THREE.MeshPhysicalMaterial({
    //     color: agentDNA.color,
    //     // color: 0xffffff,
    //     transparent: true,
    //     depthTest: false,
    //     opacity: agentDNA.opacity,
    //     roughness: 0.3,
    //     iridescence: 0,
    //     metalness: 0,
    //     reflectivity: 1,
    //     clearcoat: 0.5,
    //     clearcoatRoughness: 0,
    //     ior: 1,
    //     anisotropy: 0.9,
    //     thickness: 1,
    //     transmission: 0.5,
    //     // wireframe: true,
    // });

    // const material = new MeshTransmissionMaterial({
    //     color: agentDNA.color,
    //     resolution: 64,
    //     backside: true,
    //     backsideThickness: 0.5,
    //     roughness: 0.7,
    //     clearcoat: 0,
    //     transmission: 0.9,
    //     samples: 2,
    //     thickness: 8,
    //     chromaticAberration: 0,
    //     anisotropicBlur: 0.9
    // });
    
//     const material = new MeshTransmissionMaterial({
//     color: new THREE.Color('#ffffff'),
//     backside: true,                     
//     roughness: 0.7,                    
//     clearcoat: 1,
//     clearcoatRoughness: 0.5,
//     transmission: 1,                    
//     thickness: 2,                       
//     chromaticAberration: 0.02,          
//     anisotropicBlur: 0.1,               
//     samples: 2,                         
//     envMapIntensity: 1
// });

const material = new THREE.ShaderMaterial({
    vertexShader: vertex,
    fragmentShader: fragment,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
    uniforms: {
        iTime: { value: 0 },
        dnaColor: { value: agentDNA.color }
    }
});

    // material.emissive = new THREE.Color(0x00ffff);
    // material.emissiveIntensity = 0.01;
    // const cube = new THREE.Mesh(roundGeometry, material);
    // cube.position.copy(agent.position);
    const mesh = new THREE.Mesh(roundGeometry, material);

    const edges = new THREE.EdgesGeometry(roundGeometry);
    const edgeMaterial = new THREE.LineBasicMaterial({
        color: 0x7ECCF8,
        transparent: true,
        opacity: 0.1,
        linewidth: 0.1,
    });

    edgeMaterial.depthTest = false;

    const edgeLines = new THREE.LineSegments(edges, edgeMaterial);
    edgeLines.renerOrder = 1;
    edgeLines.material.depthTest = false;
    mesh.add(edgeLines);

    return mesh;

}

export const updateMesh = (mesh, time) => {
    float(mesh, time);
    mesh.material.uniforms.iTime.value = time * 0.001;
}