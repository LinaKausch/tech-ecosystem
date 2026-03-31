import React, { useState } from 'react';
import { ColorWheel } from './utils/ColorWheel';

const ColorStep = ({ onChange, value }) => {
    const [selectedColor, setSelectedColor] = useState({
        colorName: "red",
        rgbObj: { r: 194, g: 38, b: 10},
        hex: "#c2260a"
    });

    const handleColorChange = (colorData) => {
        setSelectedColor(colorData);
          if (onChange) {
            onChange(colorData);
        }
        console.log(colorData)
    }

    return (
        <div>
            <h1>
                {"What is your system state today?"
                    .split(" ")
                    .map((word, i) => (
                        <span key={i} style={{ display: "block" }}>
                            {word}
                        </span>)
                    )}
            </h1>
            <p className='data hex'>{selectedColor.hex}</p>
            <div style={{ display: "flex", justifyContent: "center", marginTop: "-2rem" }}>
                <ColorWheel onChange={handleColorChange} />
            </div>
            <p className='data colorname'>`{selectedColor.colorName}`</p>
            <p className='data rgba'>rgba({selectedColor.rgbObj.r},{selectedColor.rgbObj.g},{selectedColor.rgbObj.b},1)</p>
        </div>
    )
}

export default ColorStep;