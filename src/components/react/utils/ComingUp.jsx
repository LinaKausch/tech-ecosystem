import React, { useState, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import * as System from '../../../world/system.jsx';
import Cube from './Cube.jsx';
import { EffectComposer, Bloom } from '@react-three/postprocessing';

const CameraUpdater = ({ sfov }) => {
    const { camera } = useThree();

    useEffect(() => {
        camera.fov = sfov;
        camera.updateProjectionMatrix();
    }, [sfov, camera]);
    return null;
};

const RotatingCube = ({ color = '#c2260a', sizeX = 0.6, sizeY = 0.6, sizeZ = 0.6 }) => {
    return (
        <Cube color={color} sizeX={sizeX} sizeY={sizeY} sizeZ={sizeZ} rotation={true} />
    );
};

const ComingUp = () => {
    const [incomingSize, setIncomingSize] = useState(null);
    const [incomingColor, setIncomingColor] = useState(null);
    const [incomingName, setIncomingName] = useState(null);
    const [shouldShow, setShouldShow] = useState(false);
    const [isExiting, setIsExiting] = useState(false);
    const prevShouldShowRef = React.useRef(false);

    useEffect(() => {
        const checkIncomingData = () => {
            if (System.systemState.incomingData) {
                setIncomingSize({
                    x: System.systemState.incomingData.widthExt || 0.5,
                    y: System.systemState.incomingData.heightExt || 0.5,
                    z: System.systemState.incomingData.depthExt || 0.5
                });
                setIncomingColor(System.systemState.incomingData.hex || '#c2260a');
                setIncomingName(System.systemState.incomingData.name || null);

                // Show only during processing and analysing (messages[2] and [3])
                // Hide when generating starts (messages[4])
                const now = Date.now();
                const showComing = now < System.systemState.analysingUntil;

                // Detect transition from showing to hiding
                if (prevShouldShowRef.current && !showComing) {
                    setIsExiting(true);
                    setTimeout(() => {
                        setShouldShow(false);
                        setIsExiting(false);
                    }, 300); // Match animation duration
                } else if (!prevShouldShowRef.current && showComing) {
                    setIsExiting(false);
                    setShouldShow(true);
                }

                prevShouldShowRef.current = showComing;
            } else {
                setShouldShow(false);
            }
        };
        const interval = setInterval(checkIncomingData, 100);
        return () => clearInterval(interval);
    }, []);

    if (!shouldShow || !incomingSize || !incomingColor || !incomingName) return null;

    return (
        <>
            <style>{`
                @keyframes slideUpFromBottom {
                    from {
                        transform: translateY(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }
                @keyframes scaleToNone {
                    from {
                        transform: scale(1);
                        opacity: 1;
                    }
                    to {
                        transform: scale(0);
                        opacity: 0;
                    }
                }
                .coming-up-container-animated {
                    animation: ${isExiting ? 'scaleToNone 0.3s ease-out forwards' : 'slideUpFromBottom 0.4s ease-out'};
                    transform-origin: top right;
                }
            `}</style>
            <div className="coming-up-container coming-up-container-animated">
                <p className="coming-up-name">{incomingName}</p>
                <div className='coming-up-canvas-container'>
                    <Canvas className="coming-up-canvas" camera={{ position: [-1, 0.4, 0.5], fov: 50 }}>
                        <CameraUpdater sfov={50} />
                        <ambientLight intensity={0.5} />
                        <directionalLight position={[2, 2, 2]} intensity={0.8} />
                        <RotatingCube
                            key={`${incomingSize.x}-${incomingSize.y}-${incomingSize.z}`}
                            color={incomingColor}
                            sizeX={incomingSize.x}
                            sizeY={incomingSize.y}
                            sizeZ={incomingSize.z}
                        />
                        <EffectComposer>
                            <Bloom
                                luminanceThreshold={0.5}
                                luminanceSmoothing={2}
                                height={30}
                                intensity={1.8}
                                radius={0.4}
                            />
                        </EffectComposer>
                    </Canvas>
                </div>
            </div>
        </>
    );
};

export default ComingUp;