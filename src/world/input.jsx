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

    const handleColorChange = (payload) => {
        console.log("Payload received:", payload);
        setData((prev) => {
            const updated = { ...prev, ...payload };
            console.log("Updated data:", updated);
            return updated;
        });
    };

    const handleNext = () => {
        socket.emit("send-to-display", data);
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

    return (
        <div>
            <p className="date">{dateTime}</p>

            <ColorStep value={data} onChange={handleColorChange} />
            {/* <ExtensionStep size={size} setSize={setSize} /> */}
            {/* <SpeedStep /> */}
            {/* <MetalStep /> */}
            {/* <HealthStep /> */}

            <Scene colour={data.hex} size={size} />
              {/* <Scene colour={data.hex} size={size} showBounds={currentStep === 2} /> */}
            <button className="btn" onClick={handleNext}>
                next
            </button>
            <p className="page">sys_data_[{currentStep + 1}|5]</p>
        </div>
    );
};


