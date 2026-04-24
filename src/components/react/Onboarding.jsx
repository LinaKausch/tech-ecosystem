import * as React from "react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const sentences = [
    "You are connected to the _system.",
    "You can contribute, but not control it.",
    "Your input influences the _system.",
    "The _system has limits."
];

const Onboarding = () => {
    const [currentSentence, setCurrentSentence] = useState(0);

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
             <div className="onboarding-cta" style={{zIndex: 1}}>
                <p>Do you want to contribute?</p>
            </div>
        </div>
    );
}

export default Onboarding;