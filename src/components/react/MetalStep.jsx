import React from 'react';

const MetalStep = ({ onOpacityChange, onMetalnessChange, opacity = 0.99, metalness = 0.11 }) => {
    return (
        <div>
            <h1>
                {"Estimate stability of attention today"
                    .split(" ")
                    .map((word, i) => (
                        <span key={i} style={{ display: "block" }}>
                            {word}
                        </span>)
                    )}
            </h1>

            <div style={{ position: 'fixed', bottom: '0%', left: '25%', transform: 'translate(-50%, -50%)', zIndex: 1000, padding: '1.5rem', pointerEvents: 'auto', borderRadius: '8px', color: 'white', maxWidth: '300px' }}>
                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ fontSize: '12px', fontWeight: 'bold' }}>
                    </label>
                    <input
                        type="range"
                        min="0.29"
                        max="0.99"
                        step="0.01"
                        value={opacity}
                        onChange={(e) => onOpacityChange(parseFloat(e.target.value))}
                        style={{ display: 'block', width: '100%', marginTop: '0.3rem' }}
                    />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ fontSize: '12px', fontWeight: 'bold' }}>

                    </label>
                    <input
                        type="range"
                        min="0.01"
                        max="0.99"
                        step="0.01"
                        value={metalness}
                        onChange={(e) => onMetalnessChange(parseFloat(e.target.value))}
                        style={{ display: 'block', width: '100%', marginTop: '0.3rem' }}
                    />
                </div>
            </div>
            <p className='data rgba' style={{ position: 'fixed', top: '10%', right: '5%', zIndex: 1000, margin: 0, pointerEvents: 'auto' }}>op: {opacity.toFixed(2)} | metal: {metalness.toFixed(2)}</p>
        </div>
    )
}
export default MetalStep;