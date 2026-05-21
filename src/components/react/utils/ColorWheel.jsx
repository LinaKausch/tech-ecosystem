import React, { useState, useRef } from 'react';

const size = 350;

//HSL TO RGB
const hslToRgb = (h, s, l) => {
    h = h / 360;
    s = s / 100;
    l = l / 100;

    let r, g, b;

    if (s === 0) {
        r = g = b = l;
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }

    return [
        Math.round(r * 255),
        Math.round(g * 255),
        Math.round(b * 255)
    ];
};

// Convert RGB to Hex
const rgbToHex = (r, g, b) => {
    return `#${[r, g, b].map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('').toLowerCase()}`;
};

//COLOUR NAMES
const getColorName = (hue) => {
    const colors = [
        { name: 'red', start: 0, end: 30 },
        { name: 'orange', start: 30, end: 60 },
        { name: 'yellow', start: 60, end: 90 },
        { name: 'lime', start: 90, end: 120 },
        { name: 'green', start: 120, end: 150 },
        { name: 'teal', start: 150, end: 180 },
        { name: 'cyan', start: 180, end: 210 },
        { name: 'sky blue', start: 210, end: 240 },
        { name: 'blue', start: 240, end: 270 },
        { name: 'purple', start: 270, end: 300 },
        { name: 'magenta', start: 300, end: 330 },
        { name: 'pink', start: 330, end: 360 }
    ];

    for (let color of colors) {
        if (hue >= color.start && hue < color.end) {
            return color.name;
        }
    }
    return 'Red';
};

//MAIN COMPONENT
export const ColorWheel = ({ onChange }) => {
    const wheelRef = useRef(null);
    const [angle, setAngle] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [startDragAngle, setStartDragAngle] = useState(0);

    //COLOUR CODES
    let hue = Math.round((-angle % 360 + 360) % 360);
    let colorName = getColorName(hue);
    let color = `hsl(${hue}, 90%, 40%)`;
    const [r, g, b] = hslToRgb(hue, 90, 40);
    let rgb = `rgb(${r}, ${g}, ${b})`;
    let rgbObj = { r, g, b };
    let hex = rgbToHex(r, g, b);
    // console.log(colorName, color, rgb, hex, "hue:", hue);


    //INTERACTION
    const handlePointerDown = (e) => {
        console.log("Pointer down event fired");
        e.target.setPointerCapture(e.pointerId);
        e.preventDefault();

        const rect = wheelRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        let newAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
        newAngle += 90;

        setStartDragAngle(angle - newAngle);
        setIsDragging(true);
        console.log("isDragging set to true");
    };

    const handlePointerMove = (e) => {
        e.preventDefault();
        if (!isDragging || !wheelRef.current) return;

        const rect = wheelRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        let newAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
        newAngle += 90;
        setAngle(newAngle + startDragAngle);

        if (onChange) onChange({ colorName, hex, rgbObj });
    };

    const handlePointerUp = (e) => {
        setIsDragging(false);
    };

    //DOM
    return (
        <div style={{ position: "relative", width: size, height: size }}>
            {/* marker */}
            <div
                style={{
                    width: 8,
                    height: 30,
                    background: "#1C1C1C",
                    border: "1px solid #7ECCF8",
                    position: "absolute",
                    top: -20,
                    left: "50%",
                    transform: "translateX(-50%)",
                    zIndex: 10,
                    pointerEvents: "none",
                }}
            ></div>
            {/* circle */}
            <div
                style={{
                    width: size,
                    height: size,
                    borderRadius: "50%",
                     backdropFilter: "blur(2.5px)",
                    WebkitBackdropFilter: "blur(2.5px)",
                    border: "1px solid #7ECCF8",
                    // background: "#1C1C1C",
                    background: "rgba(153, 153, 153, 0.04)",
                    position: "absolute",
                    top: 0,
                    left: 0,
                }}>
            </div>
            {/* wheel */}
            <div
                ref={wheelRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                style={{
                    width: size,
                    height: size,
                    borderRadius: "50%",
                    border: "1px solid #7ECCF8",
                    background: "conic-gradient(red, yellow, green, cyan, blue, purple, red)",
                    transform: `rotate(${angle}deg)`,
                    touchAction: "none",
                    mixBlendMode: "luminosity",
                    position: "absolute",
                    top: 0,
                    left: 0,
                }}> </div>
            {/* center circle */}
            <div
                style={{
                    width: size - 100,
                    height: size - 100,
                    borderRadius: "50%",
                    border: "1px solid #7ECCF8",
                    background: "#1C1C1C",
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                }}
            ></div>

        </div >
    )
}


//touchstart, touchmove, touchend
//pointerdown, pointermove, pointerup