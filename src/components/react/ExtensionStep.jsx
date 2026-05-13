import React, { useState } from 'react';
import Slider from './utils/Slider';

const ExtensionStep = ({ size, setSize }) => {
    const MAX_VOLUME = 0.15;
    const MIN_VOLUME = 0.008; // 0.5 * 0.5 * 0.5
    const MAX_SIZE = 1;
    const MIN_SIZE = 0.1;

    // Morphing slider states
    const [morphState, setMorphState] = useState(0.5); // 0 = state1, 0.5 = state2, 1 = state3

    const state1 = { x: 0.42, y: 0.42, z: 0.09 };
    const state2 = { x: 0.25, y: 0.25, z: 0.25 };
    const state3 = { x: 0.5, y: 0.18, z: 0.18 };

    const interpolateSize = (value) => {
        // value ranges from 0 to 1
        let result;
        if (value <= 0.5) {
            // Interpolate between state1 and state2
            const t = value * 2; // 0 to 1
            result = {
                x: state1.x + (state2.x - state1.x) * t,
                y: state1.y + (state2.y - state1.y) * t,
                z: state1.z + (state2.z - state1.z) * t,
            };
        } else {
            // Interpolate between state2 and state3
            const t = (value - 0.5) * 2; // 0 to 1
            result = {
                x: state2.x + (state3.x - state2.x) * t,
                y: state2.y + (state3.y - state2.y) * t,
                z: state2.z + (state3.z - state2.z) * t,
            };
        }
        return result;
    };

    const handleMorphChange = (value) => {
        const newValue = parseFloat(value);
        setMorphState(newValue);
        let newSize = interpolateSize(newValue);
        const volume = newSize.x * newSize.y * newSize.z;

        // Scale to fit within MAX_VOLUME
        if (volume > MAX_VOLUME) {
            const scaleFactor = Math.cbrt(MAX_VOLUME / volume); // cube root to scale all axes
            newSize = {
                x: newSize.x * scaleFactor,
                y: newSize.y * scaleFactor,
                z: newSize.z * scaleFactor,
            };
        }

        setSize(newSize);
    };

    // const handleAxisChange = (axis, value) => {
    //     const newValue = Math.min(MAX_SIZE, parseFloat(value) || 0);

    //     setSize((prev) => {
    //         const newSize = { ...prev, [axis]: newValue };
    //         const volume = newSize.x * newSize.y * newSize.z;

    //         if (volume > MAX_VOLUME) {
    //             const scaleFactor = MAX_VOLUME / volume;
    //             const axes = ['x', 'y', 'z'];
    //             const otherAxes = axes.filter(a => a !== axis);

    //             otherAxes.forEach(a => {
    //                 newSize[a] = Math.min(MAX_SIZE, parseFloat((newSize[a] * scaleFactor).toFixed(2)));
    //             });
    //         } else if (volume < MIN_VOLUME) {
    //             const scaleFactor = MIN_VOLUME / volume;
    //             const axes = ['x', 'y', 'z'];
    //             const otherAxes = axes.filter(a => a !== axis);

    //             otherAxes.forEach(a => {
    //                 newSize[a] = Math.min(MAX_SIZE, parseFloat((newSize[a] * scaleFactor).toFixed(2)));
    //             });
    //         }
    //         return newSize;
    //     });
    // };

    return (
        <div className='extension-container'>
            <div className='data-container'>
                <p className='data size'>{size.x.toFixed(2)}</p>
                <p className='barcode'>{size.x.toFixed(1)}{size.y.toFixed(1)}</p>
                <p className='data size'>{size.y.toFixed(2)}</p>
                <p className='barcode'>{size.y.toFixed(1)}{size.z.toFixed(1)}</p>
                <p className='data size'>{size.z.toFixed(2)}</p>
            </div>
            <div className='bounds-container'></div>
            <div className="slider-container extension">
                <div
                    style={{
                        width: 'calc(100vw - 9.95rem)',
                        height: '1.5rem',
                        // background: "linear-gradient(to right, red, yellow, green, cyan, blue, purple, red)",
                        background: 'cyan',
                        touchAction: "none",
                        // mixBlendMode: "luminosity",
                        position: "absolute",
                        top: "-0.15rem",
                        left: "0.08rem",
                        filter: "blur(2px)",
                    }}> </div>
                <div
                    style={{
                        width: 'calc(100vw - 10rem)',
                        height: '1.5rem',
                        // background: "linear-gradient(to right, red, yellow, green, cyan, blue, purple, red)",
                        background: '#1c1c1c',
                        touchAction: "none",
                        // mixBlendMode: "luminosity",
                        position: "absolute",
                        top: "-0.15rem",
                        left: "0.08rem",
                        filter: "blur(2px)",
                    }}> </div>
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={morphState}
                    onChange={(e) => handleMorphChange(e.target.value)}
                />
                {/* <Slider /> */}
            </div>
        </div>
    )
}
export default ExtensionStep;