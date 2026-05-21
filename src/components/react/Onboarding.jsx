import * as React from "react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const sentences = [
    "You are connected to the _system.",
    "You can contribute, but not control it.",
    "Your input influences the _system.",
    "The _system has limits."
];

const Onboarding = ({ onNext, socket, onNoClick }) => {
    const [currentSentence, setCurrentSentence] = useState(0);
    const [cameraState, setCameraState] = useState('IDLE');
    const [isAdmitted, setIsAdmitted] = useState(true);
    const [queuePosition, setQueuePosition] = useState(0);

    useEffect(() => {
        if (!socket) return;

        const handleSystemState = (state) => setCameraState(state?.cameraState || 'IDLE');
        const handleRemoteAccess = (state) => {
            setIsAdmitted(Boolean(state?.admitted));
            setQueuePosition(Number(state?.queuePosition) || 0);
        };

        socket.on('system-state', handleSystemState);
        socket.on('remote-access', handleRemoteAccess);

        return () => {
            socket.off('system-state', handleSystemState);
            socket.off('remote-access', handleRemoteAccess);
        };
    }, [socket]);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSentence((prev) => (prev + 1) % sentences.length);
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="onboarding-container">
            <motion.h2
                className="onboarding"
                key={currentSentence}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ staggerChildren: 0.05 }}
            >
                {sentences[currentSentence].split('').map((char, index) => (
                    <motion.span
                        key={index}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.1, delay: index * 0.05 }}
                    >
                        {char}
                    </motion.span>
                ))}
            </motion.h2>
            {(cameraState === 'FAILURE' || cameraState === 'REBOOT') ? (
                <Rebooting />
            ) : !isAdmitted ? (
                <ServerFull queuePosition={queuePosition} />
            ) : (
                <OnboardingCTA onNext={onNext} onNoClick={onNoClick} />
            )}
        </div>
    );
}

export const OnboardingCTA = ({ onNext, onNoClick }) => {
    return (
        <div style={{ zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <p style={{ fontFamily: 'Share Tech Mono', fontSize: '1.2rem' }}>Do you want to contribute?</p>
            <div style={{ display: 'flex', gap: '2rem' }}>
                <button className="glass-btn btn-n" onClick={() => onNoClick && onNoClick()}>No</button>
                <button className="glass-btn btn-y" onClick={() => onNext && onNext()}>Yes</button>
            </div>
        </div>
    )
}

export const ServerFull = () => {
    return (
        <div style={{ zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <p style={{ fontFamily: 'Share Tech Mono', fontSize: '1.2rem' }}>Server is full.</p>
            <p>Wait...</p>
        </div>
    )
}

export const Rebooting = () => {
    return (
        <div style={{ zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <p style={{ fontFamily: 'Share Tech Mono', fontSize: '1.2rem', textAlign: 'center', maxWidth: "70%" }}>System failed and currently rebooting</p>
            <p>Wait...</p>
        </div>
    )
}

export default Onboarding;