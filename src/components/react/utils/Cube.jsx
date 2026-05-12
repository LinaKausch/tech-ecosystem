import React, { useRef, useEffect, useMemo } from 'react';
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
    const gltf = useLoader(GLTFLoader, '/cube19.glb');
    const scene = useMemo(() => gltf.scene.clone(true), [gltf]);
    const baseCenterRef = useRef(new Vector3());

    useEffect(() => {
        if (!scene) return;
        const box = new Box3().setFromObject(scene);
        box.getCenter(baseCenterRef.current);
    }, [scene]);

    useEffect(() => {
        if (!scene) return;

        scene.scale.set(sizeX, sizeY, sizeZ);
        scene.position.set(
            -baseCenterRef.current.x * sizeX,
            -baseCenterRef.current.y * sizeY,
            -baseCenterRef.current.z * sizeZ
        );
        scene.updateMatrixWorld(true);

        // Apply color wheel to light mesh
        scene.traverse((child) => {
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
    }, [scene, sizeX, sizeY, sizeZ, color]);

    return <primitive object={scene} />;
}

export default Cube;