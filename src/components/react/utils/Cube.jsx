import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';

const Cube = ({ color = 'red', sizeX = 1, sizeY = 1, sizeZ = 1 }) => {
    const meshRef = useRef();
    const [rotation, setRotation] = useState(false);
    useFrame(() => {
        if (!meshRef.current) return;
        meshRef.current.rotation.x += 0.005;
        meshRef.current.rotation.y += 0.005;
    });

    return (
        <mesh ref={meshRef}>
            <boxGeometry args={[sizeX, sizeY, sizeZ]} />
            <meshStandardMaterial color={color} />
        </mesh>
    );
};

export default Cube;