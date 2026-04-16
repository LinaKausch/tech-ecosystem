import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { float } from '../../behaviour/float.js';
import fragment from '../../shaders/frag.glsl?raw';
import vertex from '../../shaders/vertex.glsl?raw';

const loader = new GLTFLoader();
let model = null;

export const agentCube = async (scene, agentDNA) => {
    // const loader = new GLTFLoader();
    const base = await loadModel();
    const baseModel = base.clone(true);
    const placeholder = new THREE.Object3D();
    const cubeSize = 0.1;

    const scaleX = cubeSize + (agentDNA.widthExt || 0);
    const scaleY = cubeSize + (agentDNA.heightExt || 0);
    const scaleZ = cubeSize + (agentDNA.depthExt || 0);

    // loader.load('/cube9.glb', (gltf) => {
    //     // const model = gltf.scene;
    baseModel.scale.set(scaleX, scaleY, scaleZ);
    baseModel.position.set(agentDNA.x || 0, agentDNA.y || 0, agentDNA.z || 0);



    baseModel.traverse((child) => {
        if (child.isMesh) {
            // console.log(child.name);
            if (child.name === 'light') {
                child.renderOrder = 2;

                child.material = child.material.clone();
                child.material.color.set(agentDNA.color);
                child.material.emissive.set(agentDNA.color);
                child.material.emissiveIntensity = 2.5;
                child.material.transparent = true;
                child.material.opacity = 0.5;

                // child.material.blending = THREE.AdditiveBlending;
                // child.material.depthWrite = false;

                // child.material = new THREE.MeshStandardMaterial({
                //     color: agentDNA.color,
                //     emissive: agentDNA.color,
                //     emissiveIntensity: 3,
                //     metalness: 0.1,
                //     roughness: 0.2
                // });

                // child.material = new THREE.ShaderMaterial({
                //     vertexShader: vertex,
                //     fragmentShader: fragment,
                //     transparent: true,
                //     blending: THREE.AdditiveBlending,
                //     depthWrite: false,
                //     side: THREE.DoubleSide,
                //     uniforms: {
                //         iTime: { value: 0 },
                //         dnaColor: { value: agentDNA.color },
                //     }
                // });
            }
            if (child.name === 'main') {
                child.renderOrder = 1;
                // console.log(child.material);
                // child.material.emissiveIntensity = 0.1;
                // child.material.transparent = true; // enable transparency
                // child.material.opacity = 0.97;
                // child.material.map.repeat.set(scaleX, scaleY);
                // child.material.map.wrapS = THREE.RepeatWrapping;
                // child.material.map.wrapT = THREE.RepeatWrapping;
                // child.material = new THREE.MeshPhysicalMaterial({
                //     color: 'grey',
                //     roughness: 0.5,
                //     transparent: true,
                //     opacity: 1,
                //     metalness: agentDNA.metalness,

                // });
            }
        }
    });

    const rotationX = Math.floor(Math.random() * 4) * (Math.PI / 2);
    const rotationY = Math.floor(Math.random() * 4) * (Math.PI / 2);
    const rotationZ = Math.floor(Math.random() * 4) * (Math.PI / 2);
    baseModel.rotation.set(rotationX, rotationY, rotationZ);

    placeholder.add(baseModel);
    // });
    scene.add(placeholder);
    return placeholder;
}

export const loadModel = () => {

    return new Promise((resolve) => {
        if (model) return resolve(model);

        loader.load('/cube16.glb', (gltf) => {
            model = gltf.scene;
            resolve(model);
        });
    })
}

export const updateACube = (mesh, t) => {
    float(mesh, t);
}