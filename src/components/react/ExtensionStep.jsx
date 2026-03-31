import React, { useState } from 'react';

const ExtensionStep = ({ size, setSize }) => {
    const MAX_VOLUME = 1;
    const handleAxisChange = (axis, value) => {
        const newValue = parseFloat(value) || 0;

        setSize((prev) => {
            const newSize = { ...prev, [axis]: newValue };
            const volume = newSize.x * newSize.y * newSize.z;

            if (volume > MAX_VOLUME) {
                const scaleFactor = MAX_VOLUME / volume;
                const axes = ['x', 'y', 'z'];
                const otherAxes = axes.filter(a => a !== axis);

                otherAxes.forEach(a => {
                    newSize[a] = parseFloat((newSize[a] * scaleFactor).toFixed(2));
                });
            }
            return newSize;
        });
    };

    return (
        <div>
            <h1>
                {"Measure system stress from social media input"
                    .split(" ")
                    .map((word, i) => (
                        <span key={i} style={{ display: "block" }}>
                            {word}
                        </span>)
                    )}
            </h1>

            <div style={{ position: 'fixed', bottom: '-12%', left: '25%', transform: 'translate(-50%, -50%)', zIndex: 1000, padding: '1.5rem', pointerEvents: 'auto', borderRadius: '8px', color: 'white', maxWidth: '300px' }}>
                <div style={{ marginBottom: '0.8rem' }}>
                    <label style={{ fontSize: '12px', fontWeight: 'bold' }}>
                        X: {size.x.toFixed(2)}
                    </label>
                    <input
                        type="range"
                        min="0.1"
                        max="1.9"
                        step="0.1"
                        value={size.x}
                        onChange={(e) => handleAxisChange('x', e.target.value)}
                        style={{ display: 'block', width: '100%', marginTop: '0.3rem' }}
                    />
                </div>

                <div style={{ marginBottom: '0.8rem' }}>
                    <label style={{ fontSize: '12px', fontWeight: 'bold' }}>
                        Y: {size.y.toFixed(2)}
                    </label>
                    <input
                        type="range"
                        min="0.1"
                        max="1.9"
                        step="0.1"
                        value={size.y}
                        onChange={(e) => handleAxisChange('y', e.target.value)}
                        style={{ display: 'block', width: '100%', marginTop: '0.3rem' }}
                    />
                </div>

                <div style={{ marginBottom: '0.8rem' }}>
                    <label style={{ fontSize: '12px', fontWeight: 'bold' }}>
                        Z: {size.z.toFixed(2)}
                    </label>
                    <input
                        type="range"
                        min="0.1"
                        max="1.9"
                        step="0.1"
                        value={size.z}
                        onChange={(e) => handleAxisChange('z', e.target.value)}
                        style={{ display: 'block', width: '100%', marginTop: '0.3rem' }}
                    />
                </div>
            </div>

            <p className='data rgba' style={{ position: 'fixed', top: '10%', right: '5%', zIndex: 1000, margin: 0, pointerEvents: 'auto' }}>&#123;x: {size.x.toFixed(2)}, y: {size.y.toFixed(2)}, z: {size.z.toFixed(2)}&#125;</p>
        </div>
    )
}
export default ExtensionStep;