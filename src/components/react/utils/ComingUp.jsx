import React, { useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as System from '../../../world/system.jsx';
import Cube from './Cube.jsx';
import {EffectComposer, Bloom } from '@react-three/postprocessing';

const RotatingCube = ({ color = '#c2260a', sizeX = 0.6, sizeY = 0.6, sizeZ = 0.6 }) => {
    const ref = React.useRef();

    useFrame(() => {
        if (ref.current) {
            ref.current.rotation.x += 0.005;
            ref.current.rotation.y += 0.005;
        }
    });

    return (
        <group ref={ref}>
            <Cube color={color} sizeX={sizeX} sizeY={sizeY} sizeZ={sizeZ} />
        </group>
    );
};

const ComingUp = () => {
    const [incomingSize, setIncomingSize] = useState({ x: 0.5, y: 0.5, z: 0.5 });
    const [incomingColor, setIncomingColor] = useState('#c2260a');

    useEffect(() => {
        const checkIncomingData = () => {
            if (System.systemState.incomingData) {
                setIncomingSize({
                    x: System.systemState.incomingData.widthExt || 0.5,
                    y: System.systemState.incomingData.heightExt || 0.5,
                    z: System.systemState.incomingData.depthExt || 0.5
                });
                setIncomingColor(System.systemState.incomingData.hex || '#c2260a');
            }
        };
        const interval = setInterval(checkIncomingData, 100);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="coming-up-container">
            <Canvas className="coming-up-canvas" camera={{ position: [-2, 0, 0], fov: 50 }}>
                <ambientLight intensity={0.5} />
                <directionalLight position={[2, 2, 2]} intensity={0.8} />
                <RotatingCube color={incomingColor} sizeX={incomingSize.x} sizeY={incomingSize.y} sizeZ={incomingSize.z} />
                <EffectComposer>
                    <Bloom
                        luminanceThreshold={0.5}
                        luminanceSmoothing={2}
                        height={30}
                        intensity={1.8}
                        radius={0.4}
                    //    mipmapBlur={false}
                    />
                </EffectComposer>
            </Canvas>
        </div>
    );
};

export default ComingUp;