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
            <CubeModel sizeX={sizeX} sizeY={sizeY} sizeZ={sizeZ} />
            <meshStandardMaterial color={color} transparent={true} opacity={opacity} metalness={metalness} />
        </mesh>
    );
};

const CubeModel = ({ sizeX, sizeY, sizeZ}) => {
    const gltf = useLoader(GLTFLoader, '/cube16.glb');

    useEffect(() => {
        if (gltf.scene) {
            const box = new Box3().setFromObject(gltf.scene);
            const center = box.getCenter(new Vector3());
            const size = box.getSize(new Vector3());

            gltf.scene.position.sub(center);

            const scale = Math.max(sizeX, sizeY, sizeZ) / Math.max(size.x, size.y, size.z);
            gltf.scene.scale.multiplyScalar(scale);
        }
    }, [gltf, sizeX, sizeY, sizeZ]);

    return <primitive object={gltf.scene} />;
}

export default Cube;