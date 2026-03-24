import React, { useState } from 'react';
import ColorStep from '../components/react/ColorStep.jsx';
import ExtensionStep from '../components/react/ExtensionStep.jsx';
import SpeedStep from '../components/react/speedStep.jsx';
import MetalStep from '../components/react/MetalStep.jsx';
import HealthStep from '../components/react/HealthStep.jsx';

export const InputData = ({ socket }) => {
    const [data, setData] = useState({ color: null });

    const handleColorChange = (payload) => {
        setData((prev) => ({ ...prev, ...payload }));
        socket.emit("send-to-display", payload);
    };

    return (
        <div>
            <ColorStep value={data.color} onChange={handleColorChange} />
            {/* <ExtensionStep />
            <SpeedStep />
            <MetalStep />
            <HealthStep /> */}
        </div>
    );
};

// export const inputData = (onChange) => {
//     const $input = document.querySelector('.input');
//     if (!$input) return;
//     shapeInput($input, onChange);
//     colorInput($input, onChange);
// };

// const colorInput = ($input, onChange) => {

//     const colorBtns = [];

//     for (let i = 0; i < 3; i++) {
//         const $inputBtn = document.createElement('button');
//         colorBtns.push($inputBtn);
//         $input.appendChild(colorBtns[i]);
//     }
//     colorBtns[0].textContent = 'Blue';
//     colorBtns[1].textContent = 'Red';
//     colorBtns[2].textContent = 'Green';

//     colorBtns.forEach((btn, index) => {
//         btn.addEventListener('click', () => {
//             const payload = {
//                 type: 'color-input',
//                 color: index === 0 ? 'blue' : index === 1 ? 'red' : 'green'
//             };
//             if (onChange) {
//                 onChange(payload);
//             }
//         })

//     });
// }

// const shapeInput = ($input, onChange) => {
//     const sliders = [];

//     for (let i = 0; i < 3; i++) {
//         const $slider = document.createElement('input');
//         $slider.type = 'range';
//         $slider.min = 1;
//         $slider.max = 10;
//         sliders.push($slider);
//         $input.appendChild($slider);
//     }

//     sliders.forEach((slider, index) => {
//         slider.addEventListener('input', () => {
//             const payload = {
//                 type: 'shape-input',
//                 dimension: index === 0 ? 'width' : index === 1 ? 'height' : 'depth',
//                 value: slider.value
//             };
//             if (onChange) {
//                 onChange(payload);
//             }
//         });
//     })
// };

// const materialInput = ($input, onChange) => {



// }

// const hiddenInput = ($input, onChange) => {     


// }

