import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';

const Bounds = ({ sizeX = 1, sizeY = 1, sizeZ = 1 }) => {
    const meshRef = useRef();

    return (
        <mesh ref={meshRef}>
            <boxGeometry args={[sizeX, sizeY, sizeZ]} />
            <meshStandardMaterial color="#7ECCF8" transparent opacity={0.3} wireframe />
        </mesh>
    );
};

export default Bounds;