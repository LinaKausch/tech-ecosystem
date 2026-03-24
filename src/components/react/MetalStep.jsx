import React, { useState } from 'react';

const MetalStep = ({ onChange, value }) => {


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
            <p className='data'>[0.85|0.72]</p>
        </div>
    )
}
export default MetalStep;