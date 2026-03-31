import React, { useState, useEffect } from 'react';
import ColorStep from '../components/react/ColorStep.jsx';
import Scene from '../components/react/utils/Scene.jsx';
import ExtensionStep from '../components/react/ExtensionStep.jsx';
import SpeedStep from '../components/react/speedStep.jsx';
import MetalStep from '../components/react/MetalStep.jsx';
import HealthStep from '../components/react/HealthStep.jsx';

export const InputData = ({ socket }) => {
    const [data, setData] = useState({});
    const [dateTime, setDateTime] = useState("");
    const [currentStep, setCurrentStep] = useState(0);
    const [size, setSize] = useState({ x: 0.5, y: 0.5, z: 0.5 });
    const [opacity, setOpacity] = useState(0.91);
    const [metalness, setMetalness] = useState(0.11);

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

    const handleNext = () => {
        const dataToSend = {
            ...data,
            opacity: opacity,
            metalness: metalness,
            widthExt: size.x,
            heightExt: size.y,
            depthExt: size.z
        };
        console.log('Data sent to display:', dataToSend);
        socket.emit("send-to-display", dataToSend);
        setCurrentStep((prev) => prev + 1);
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

    const steps = [
        // <ColorStep value={data} onChange={handleColorChange} />,
        // <ExtensionStep size={size} setSize={setSize} />,
        // <SpeedStep />,
        <MetalStep opacity={opacity} metalness={metalness} onOpacityChange={handleOpacityChange} onMetalnessChange={handleMetalnessChange} />,
        <HealthStep />
    ]

    return (
        <div>
            <p className="date">{dateTime}</p>

            {steps[currentStep]}

            {/* <Scene colour={data.hex} size={size} /> */}
            <Scene colour={data.hex} size={size} sceneNumber={currentStep + 1} opacity={opacity} metalness={metalness} />
            <button className="btn" onClick={handleNext}>
                next
            </button>
            <p className="page">sys_data_[{currentStep + 1}|5]</p>
        </div>
    );
};


