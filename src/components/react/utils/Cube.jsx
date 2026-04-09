import React, { useRef, useEffect } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Box3, Vector3 } from 'three';

const Cube = ({ color = 'red', sizeX = 1, sizeY = 1, sizeZ = 1, rotation = true, opacity = 1, metalness = 0 }) => {
    const meshRef = useRef();
    useFrame(() => {
        if (!meshRef.current) return;
        if (rotation) {
            meshRef.current.rotation.x += 0.005;
            meshRef.current.rotation.y += 0.005;
        }
    });

    return (
        <mesh ref={meshRef}>
            {/* <boxGeometry args={[sizeX, sizeY, sizeZ]} /> */}
            <CubeModel sizeX={sizeX} sizeY={sizeY} sizeZ={sizeZ} color={color} />
            <meshStandardMaterial color={color} transparent={true} opacity={opacity} metalness={metalness} />
        </mesh>
    );
};

const CubeModel = ({ sizeX, sizeY, sizeZ, color }) => {
    const gltf = useLoader(GLTFLoader, '/cube16.glb');

    useEffect(() => {
        if (gltf.scene) {
            const box = new Box3().setFromObject(gltf.scene);
            const center = box.getCenter(new Vector3());
            const size = box.getSize(new Vector3());

            gltf.scene.position.sub(center);

            gltf.scene.scale.set(sizeX, sizeY, sizeZ);

            // Apply color wheel to light mesh
            gltf.scene.traverse((child) => {
                if (child.isMesh && child.name === 'light') {
                    child.material = child.material.clone();
                    const lightColor = color?.hex || color;
                    child.material.color.set(lightColor);
                    child.material.emissive.set(lightColor);
                    child.material.emissiveIntensity = 2.5;
                    child.material.transparent = true;
                    child.material.opacity = 0.5;
                }
            });
        }
    }, [gltf, sizeX, sizeY, sizeZ, color]);

    return <primitive object={gltf.scene} />;
}

export default Cube;