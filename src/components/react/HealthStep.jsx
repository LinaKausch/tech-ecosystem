import React, { useState } from 'react';

const HealthStep = ({ onHealthChange, onMassChange, health = 0.53, mass = 0.42 }) => {


    return (
        <div>
            <h1>
                {"Measure current system load"
                    .split(" ")
                    .map((word, i) => (
                        <span key={i} style={{ display: "block" }}>
                            {word}
                        </span>)
                    )}
            </h1>
            <div style={{ position: 'fixed', bottom: '0%', left: '25%', transform: 'translate(-50%, -50%)', zIndex: 1000, padding: '1.5rem', pointerEvents: 'auto', borderRadius: '8px', color: 'white', maxWidth: '300px' }}>
                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ fontSize: '12px', fontWeight: 'bold' }}></label>
                    <input
                        type="range"
                        min="0.09"
                        max="1"
                        step="0.01"
                        value={health}
                        onChange={(e) => onHealthChange(parseFloat(e.target.value))}
                        style={{ display: 'block', width: '100%', marginTop: '0.3rem' }}
                    />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ fontSize: '12px', fontWeight: 'bold' }}></label>
                    <input
                        type="range"
                        min="0.01"
                        max="1"
                        step="0.01"
                        value={mass}
                        onChange={(e) => onMassChange(parseFloat(e.target.value))}
                        style={{ display: 'block', width: '100%', marginTop: '0.3rem' }}
                    />
                </div>
                <p className='data'>{`h: ${health.toFixed(2)} | m: ${mass.toFixed(2)}`}</p>
            </div>
        </div>
    )
}

export default HealthStep;