import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

const Cube = ({ color = 'red', sizeX = 1, sizeY = 1, sizeZ = 1, rotation = true }) => {
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
            <boxGeometry args={[sizeX, sizeY, sizeZ]} />
            <meshStandardMaterial color={color} />
        </mesh>
    );
};

export default Cube;