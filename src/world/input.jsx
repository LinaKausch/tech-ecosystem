import React, { useState, useEffect } from 'react';
import ColorStep from '../components/react/ColorStep.jsx';
import Scene from '../components/react/utils/Scene.jsx';
import ExtensionStep from '../components/react/ExtensionStep.jsx';
import SpeedStep from '../components/react/speedStep.jsx';
import MetalStep from '../components/react/MetalStep.jsx';
import HealthStep from '../components/react/HealthStep.jsx';
import Onboarding from '../components/react/Onboarding.jsx';
import FinalStep from '../components/react/FinalStep.jsx';
import { Stars } from '@react-three/drei';
import FeedbackStep from '../components/react/FeedbackStep.jsx';
import AboutStep from '../components/react/AboutStep.jsx';


export const InputData = ({ socket }) => {
    const [data, setData] = useState({});
    const [dateTime, setDateTime] = useState("");
    const [currentStep, setCurrentStep] = useState(0);
    const [size, setSize] = useState({ x: 0.25, y: 0.25, z: 0.25 });
    const [opacity, setOpacity] = useState(0.91);
    const [metalness, setMetalness] = useState(0.11);
    const [health, setHealth] = useState(0.53);
    const [mass, setMass] = useState(0.42);
    const [isOverloaded, setIsOverloaded] = useState(false);
    const [isBusy, setIsBusy] = useState(false);
    const [dataSent, setDataSent] = useState(false);
    const [noContribution, setNoContribution] = useState(false);
    const [isFailure, setIsFailure] = useState(false);
    const [isRebooting, setIsRebooting] = useState(false);
    const [showAbout, setShowAbout] = useState(false);

    const handleColorChange = (payload) => {
        console.log("Payload received:", payload);
        setData((prev) => {
            const updated = { ...prev, ...payload };
            console.log("Updated data:", updated);
            return updated;
        });
    };

    const handleOpacityChange = (value) => {
        setOpacity(value);
        setData((prev) => ({ ...prev, opacity: value }));
    };

    const handleMetalnessChange = (value) => {
        setMetalness(value);
        setData((prev) => ({ ...prev, metalness: value }));
    };

    const handleHealthChange = (value) => {
        setHealth(value);
        setData((prev) => ({ ...prev, healthScore: value }));
    };

    const handleMassChange = (value) => {
        setMass(value);
        setData((prev) => ({ ...prev, mass: value }));
    };

    const sendData = () => {
        const dataToSend = {
            ...data,
            hex: data.hex || '#c2260a',
            opacity: opacity,
            metalness: metalness,
            healthScore: health * 100,
            mass: mass * 10,
            widthExt: size.x,
            heightExt: size.y,
            depthExt: size.z
        };
        console.log('Data sent to display:', dataToSend);
        socket.emit("send-to-display", dataToSend);
        setDataSent(true);
        setIsBusy(true);
    };

    const handleNext = () => {
        if (currentStep === steps.length - 1) {
            sendData();
        } else {
            setCurrentStep((prev) => prev + 1);
        }
    };

    useEffect(() => {
        const updateDateTime = () => {
            const now = new Date();
            const month = String(now.getMonth() + 1).padStart(2, "0");
            const day = String(now.getDate()).padStart(2, "0");
            const hours = String(now.getHours()).padStart(2, "0");
            const minutes = String(now.getMinutes()).padStart(2, "0");
            const seconds = String(now.getSeconds()).padStart(2, "0");
            setDateTime(`${month}.${day}.${hours}:${minutes}:${seconds}`);
        };
        updateDateTime();
        const interval = setInterval(updateDateTime, 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (!socket) return;

        const handleSystemState = (state) => {
            const cameraState = state?.cameraState || 'IDLE';
            setIsOverloaded(cameraState === 'OVERLOAD');
            setIsFailure(cameraState === 'FAILURE');
            setIsRebooting(cameraState === 'REBOOT');
            setIsBusy(cameraState === 'GENERATING' || cameraState === 'PROCESSING' || cameraState === 'ANALYSING');
        };

        const handleSystemProcessing = (isProcessing) => {
            // Immediately mark system as busy when another phone sends data
            setIsBusy(isProcessing);
        };

        socket.on('system-state', handleSystemState);
        socket.on('system-processing', handleSystemProcessing);

        return () => {
            socket.off('system-state', handleSystemState);
            socket.off('system-processing', handleSystemProcessing);
        };
    }, [socket]);

    const steps = [
        <Onboarding socket={socket} onNext={() => setCurrentStep(1)} onNoClick={() => { setNoContribution(true); setCurrentStep(3); }} />,
        <ColorStep value={data} onChange={handleColorChange} />,
        <ExtensionStep size={size} setSize={setSize} />,
        <FeedbackStep isOverloaded={isOverloaded} isBusy={isBusy} dataSent={dataSent} noContribution={noContribution} isFailure={isFailure} isRebooting={isRebooting} onSend={sendData} />,
        // <SpeedStep />,
        // <MetalStep opacity={opacity} metalness={metalness} onOpacityChange={handleOpacityChange} onMetalnessChange={handleMetalnessChange} />,
        // <HealthStep health={health} mass={mass} onHealthChange={handleHealthChange} onMassChange={handleMassChange} />,
        // <FinalStep />
    ]

    return (
        <div className='data-bg'>
            <p className="date">{dateTime}</p>
            {steps[currentStep]}
            <Scene colour={data.hex} size={size} sceneNumber={currentStep + 1} opacity={opacity} metalness={metalness} />
            {currentStep > 0 && currentStep < steps.length - 1 && (
                <button className="btn" onClick={handleNext}>
                    next
                </button>
            )}
            <div style={{ display: "flex", justifyContent: 'center', marginTop: '-1.5rem', position: 'fixed', bottom: '3rem', left: '50%', transform: 'translateX(-50%)', zIndex: 1000 }}>
                {(currentStep === 0 || currentStep === steps.length - 1) && (
                    <button className="about-btn" onClick={() => setShowAbout(true)}>
                        Insight
                    </button>
                )}
            </div>
            {showAbout && <AboutStep onClose={() => setShowAbout(false)} />}
            {/* <img src="/img/logo.png" alt="logo" style={{ position: 'absolute', bottom: '5%', left: '38%', width: '20vw', height: 'auto', zIndex: 0, opacity: 0.8 }} /> */}
        </div>
    );
};
