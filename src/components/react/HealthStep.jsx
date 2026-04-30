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
            <div className="slider-container">
                <div className="slider-group">
                    <label></label>
                    <input
                        type="range"
                        min="0.09"
                        max="1"
                        step="0.01"
                        value={health}
                        onChange={(e) => onHealthChange(parseFloat(e.target.value))}
                    />
                </div>
                <p className='data'>{`h: ${health.toFixed(2)}`}</p>
            </div>
        </div>
    )
}

export default HealthStep;