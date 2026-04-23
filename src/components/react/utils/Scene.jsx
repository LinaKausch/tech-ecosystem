import { Canvas, useThree } from '@react-three/fiber';
import Cube from './Cube.jsx';
import React, { useEffect, memo } from 'react';
import Bounds from './Bounds.jsx';
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { Sparkles } from '@react-three/drei';

const CameraUpdater = ({ sfov }) => {
    const { camera } = useThree();

    useEffect(() => {
        camera.fov = sfov;
        camera.updateProjectionMatrix();
    }, [sfov, camera]);
    return null;
};

const Scene = ({ colour, size, sceneNumber = 1, opacity, metalness }) => {
    const defaultCameraPos = [-1, 0.4, 0.5];
    // const defaultColor = '#c2260a';
    const defaultColor = '#c20a20';

    const sceneConfigs = {
        1: { sfov: 50, showBounds: false, sh: '100%', sw: '100%', cameraP: [-1, 0.8, 1], rotation: true },
        2: { sfov: 53, showBounds: false, sh: '40%', sw: '50%', cameraP: defaultCameraPos, rotation: true },
        3: { sfov: 100, showBounds: true, sh: '80%', sw: '90%', cameraP: [-1, 0.8, 1], rotation: false },
        4: { sfov: 100, showBounds: false, sh: '100%', sw: '100%', cameraP: [-1, 0.8, 0], rotation: true },
        5: { sfov: 100, showBounds: false, sh: '100%', sw: '100%', cameraP: defaultCameraPos, rotation: true },
        6: { sfov: 120, showBounds: false, sh: '100%', sw: '100%', cameraP: defaultCameraPos, rotation: true }
    };

    const config = sceneConfigs[sceneNumber] || sceneConfigs[2];
    const { sfov, showBounds, sh, sw, cameraP, rotation } = config;

    return (
        <Canvas
            key={sceneNumber}
            style={{ width: sw, height: sh, position: 'absolute', top: '51%', left: '50%', transform: 'translate(-50%, -50%)' }}
            camera={{ position: cameraP, fov: sfov }}
        >
            <CameraUpdater sfov={sfov} />
            <ambientLight intensity={0.5} />
            <directionalLight position={[-1, 2, 1]} intensity={0.5} />
            {showBounds && (
                <>
                    <Bounds sizeX={0.5} sizeY={0.5} sizeZ={1.9} />
                    <Bounds sizeX={0.5} sizeY={1.9} sizeZ={0.5} />
                    <Bounds sizeX={1.9} sizeY={0.5} sizeZ={0.5} />
                </>
            )}
            <Cube color={colour || defaultColor} sizeX={size.x} sizeY={size.y} sizeZ={size.z} rotation={rotation} opacity={opacity} metalness={metalness} />
            {/* <Sparkles count={100} size={0.05} speed={0.05} color={colour || defaultColor} /> */}
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
    )
}

export default memo(Scene);

