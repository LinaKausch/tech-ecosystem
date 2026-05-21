import React, { useState, useEffect } from 'react';
import ColorStep from '../components/react/ColorStep.jsx';
import Scene from '../components/react/utils/Scene.jsx';
import ExtensionStep from '../components/react/ExtensionStep.jsx';
import Onboarding from '../components/react/Onboarding.jsx';
import FeedbackStep from '../components/react/FeedbackStep.jsx';
import AboutStep from '../components/react/AboutStep.jsx';
import HealthStep from '../components/react/HealthStep.jsx';
// import Onboarding from '../components/react/Onboarding.jsx';


export const InputData = ({ socket }) => {
    const [data, setData] = useState({});
    const [dateTime, setDateTime] = useState("");
    const [currentStep, setCurrentStep] = useState(0);
    const [size, setSize] = useState({ x: 0.25, y: 0.25, z: 0.25 });
    const [health, setHealth] = useState(0.53);
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

    const sendData = () => {
        const dataToSend = {
            hex: data.hex || '#c2260a',
            healthScore: health * 100,
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
    ]

    return (
        <div className='data-bg'>
            <p className="date">{dateTime}</p>
            {steps[currentStep]}
            <Scene colour={data.hex} size={size} sceneNumber={currentStep + 1} />
            {currentStep > 0 && currentStep < steps.length - 1 && (
                <button className="btn" onClick={handleNext}>
                    next
                </button>
            )}
            <div style={{ display: "flex", justifyContent: 'center', marginTop: '-1.5rem', position: 'fixed', bottom: '3rem', left: '50%', transform: 'translateX(-50%)', zIndex: 1000 }}>
                {(currentStep === 0 || currentStep === steps.length - 1) && (
                    <button className="about-btn" onClick={() => setShowAbout(true)}>
                        About
                    </button>
                )}
            </div>
            {showAbout && <AboutStep onClose={() => setShowAbout(false)} />}
            {/* <img src="/img/logo.png" alt="logo" style={{ position: 'absolute', bottom: '5%', left: '38%', width: '20vw', height: 'auto', zIndex: 0, opacity: 0.8 }} /> */}
        </div>
    );
};
