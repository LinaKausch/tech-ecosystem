import React, { useState } from 'react';

const SpeedStep = ({ onChange, value }) => {


    return (
        <div>
            <h1>
                {"Estimate your dependency of AI usage"
                    .split(" ")
                    .map((word, i) => (
                        <span key={i} style={{ display: "block" }}>
                            {word}
                        </span>)
                    )}
            </h1>
            <p className='data'>[f0.35]</p>
            <p className='data'>"very_dependent"</p>
        </div>
    )
}
export default SpeedStep;