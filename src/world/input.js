import * as THREE from 'three';

export const inputData = (onChange) => {
    const $input = document.querySelector('.input');
    if (!$input) return;

    const $inputBtn = document.createElement('button');
    $inputBtn.textContent = 'Random Color';
    $input.appendChild($inputBtn);

    $inputBtn.addEventListener('click', () => {
        const randomColor = new THREE.Color(Math.random(), Math.random(), Math.random());
        const payload = {
            type: 'dna-input',
            dna: {
                size: 0.01,
                color: {
                    r: randomColor.r,
                    g: randomColor.g,
                    b: randomColor.b
                },
                segmentsW: Math.floor(THREE.MathUtils.randFloat(3, 16)),
                segmentsH: Math.floor(THREE.MathUtils.randFloat(3, 16))
            }
        };

        if (onChange) {
            onChange(payload);
        }
    });
}
