import React, { useState } from 'react';

const ExtensionStep = ({ size, setSize }) => {
    const MAX_VOLUME = 0.15;
    const MIN_VOLUME = 0.008; // 0.5 * 0.5 * 0.5
    const MAX_SIZE = 1;
    const MIN_SIZE = 0.1;

    const handleAxisChange = (axis, value) => {
        const newValue = Math.min(MAX_SIZE, parseFloat(value) || 0);

        setSize((prev) => {
            const newSize = { ...prev, [axis]: newValue };
            const volume = newSize.x * newSize.y * newSize.z;

            if (volume > MAX_VOLUME) {
                const scaleFactor = MAX_VOLUME / volume;
                const axes = ['x', 'y', 'z'];
                const otherAxes = axes.filter(a => a !== axis);

                otherAxes.forEach(a => {
                    newSize[a] = Math.min(MAX_SIZE, parseFloat((newSize[a] * scaleFactor).toFixed(2)));
                });
            } else if (volume < MIN_VOLUME) {
                const scaleFactor = MIN_VOLUME / volume;
                const axes = ['x', 'y', 'z'];
                const otherAxes = axes.filter(a => a !== axis);

                otherAxes.forEach(a => {
                    newSize[a] = Math.min(MAX_SIZE, parseFloat((newSize[a] * scaleFactor).toFixed(2)));
                });
            }
            return newSize;
        });
    };

    return (
        <div>
            <div style={{ position: 'fixed', bottom: '-12%', left: '25%', transform: 'translate(-50%, -50%)', zIndex: 1000, padding: '1.5rem', pointerEvents: 'auto', color: 'white', maxWidth: '300px' }}>
                <div style={{ marginBottom: '0.8rem' }}>
                    <label style={{ fontSize: '12px', fontWeight: 'bold' }}>
                        X: {size.x.toFixed(2)}
                    </label>
                    <input
                        type="range"
                        min="0.1"
                        max="1"
                        step="0.01"
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
                        max="1"
                        step="0.01"
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
                        max="1"
                        step="0.01"
                        value={size.z}
                        onChange={(e) => handleAxisChange('z', e.target.value)}
                        style={{ display: 'block', width: '100%', marginTop: '0.3rem' }}
                    />
                </div>
            </div>

            {/* <p className='data rgba' style={{ position: 'fixed', top: '10%', right: '5%', zIndex: 1000, margin: 0, pointerEvents: 'auto' }}>&#123;x: {size.x.toFixed(2)}, y: {size.y.toFixed(2)}, z: {size.z.toFixed(2)}&#125;</p> */}
        </div>
    )
}
export default ExtensionStep;