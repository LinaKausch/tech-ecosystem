import { Canvas } from '@react-three/fiber';
import Cube from './Cube.jsx';
import React from 'react';
import Bounds from './Bounds.jsx';

const Scene = ({ colour, size, showBounds }) => {
    return (
        <Canvas
            style={{ width: '50%', height: '30%', position: 'absolute', top: '53%', left: '50%', transform: 'translate(-50%, -50%)' }}
            camera={{ position: [-1, 0.4, 0.5], fov: 50 }}
        >
            <ambientLight intensity={0.5} />
            <directionalLight position={[-1, 2, 1]} intensity={2} />
            {/* {showBounds && (
                <> */}
            {/* <Bounds sizeX={size.x} sizeY={size.y * 3} sizeZ={size.z} />
            <Bounds sizeX={size.x} sizeY={size.y} sizeZ={size.z * 2.7} /> */}
            {/* </>
            )} */}
            <Cube color={colour} sizeX={size.x} sizeY={size.y} sizeZ={size.z} />

        </Canvas>
    )
}

export default Scene;

// add bounds to scene for the extension step. 
