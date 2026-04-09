import React, { useState, useEffect } from 'react';

const rows = 40;
const cols = 20;

const createGrid = () => {
    return Array.from({ length: rows * cols }, () =>
        // Math.random() > 0.5 ? 1 : 0
        Math.random() * 0.9
    )
};

const Background = () => {
    const [grid, setGrid] = useState(createGrid());
    const [time, setTime] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setTime(t => (t + 1) % 100);
            setGrid(createGrid());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 0,
            display: "grid",
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gridTemplateRows: `repeat(${rows}, 1fr)`,
            gap: '1px',
            filter: 'blur(2px)',
            backgroundColor: '#1C1C1C',
            overflow: 'hidden'
        }}>
            {grid.map((cell, index) => {
                return (
                    <div
                        key={index}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: `rgba(0,0,0,${cell})`,
                            transition: 'background-color 0.5s ease',
                            fontWeight: 'bold'
                        }}
                    >
        
                    </div>
                )
            })}
        </div>
    );
}

export default Background;
