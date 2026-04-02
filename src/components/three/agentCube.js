import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { float } from '../../behaviour/float.js';
import fragment from '../../shaders/frag.glsl?raw';
import vertex from '../../shaders/vertex.glsl?raw';

export const agentCube = (scene, agentDNA) => {
    const loader = new GLTFLoader();
    const placeholder = new THREE.Object3D();
    const cubeSize = 0.1;

    const scaleX = cubeSize + (agentDNA.widthExt || 0);
    const scaleY = cubeSize + (agentDNA.heightExt || 0);
    const scaleZ = cubeSize + (agentDNA.depthExt || 0);

    loader.load('/cube7.glb', (gltf) => {
        const model = gltf.scene;
        model.scale.set(scaleX, scaleY, scaleZ);
        model.position.set(agentDNA.x || 0, agentDNA.y || 0, agentDNA.z || 0);



        model.traverse((child) => {
            if (child.isMesh) {
                console.log(child.name);
                if (child.name === 'light') {
                    child.renderOrder = 2;

                    // child.material = new THREE.MeshStandardMaterial({
                    //     color: agentDNA.color,
                    //     emissive: agentDNA.color,
                    //     emissiveIntensity: 5,
                    //     metalness: 0.1,
                    //     roughness: 0.2
                    // });

                    child.material = new THREE.ShaderMaterial({
                        vertexShader: vertex,
                        fragmentShader: fragment,
                        transparent: true,
                        blending: THREE.AdditiveBlending,
                        depthWrite: false,
                        side: THREE.DoubleSide,
                        uniforms: {
                            iTime: { value: 0 },
                            dnaColor: { value: agentDNA.color },
                        }
                    });
                }
                if (child.name === 'main') {
                    child.renderOrder = 1;
                    child.material = new THREE.MeshPhysicalMaterial({
                        color: 'grey',
                        roughness: 0.5,
                        transparent: true,
                        opacity: 1,
                        metalness: agentDNA.metalness,

                    });
                }
            }
        });
        
        const rotationX = Math.floor(Math.random() * 4) * (Math.PI / 2);
        const rotationY = Math.floor(Math.random() * 4) * (Math.PI / 2);
        const rotationZ = Math.floor(Math.random() * 4) * (Math.PI / 2);
        model.rotation.set(rotationX, rotationY, rotationZ);

        placeholder.add(model);
    });
    scene.add(placeholder);
    return placeholder;
}

export const updateACube = (mesh, t) => {
    float(mesh, t);
}