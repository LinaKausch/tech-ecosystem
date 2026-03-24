import React, { useState } from 'react';

const HealthStep = ({ onChange, value }) => {


    return (
        <div>
            <h1>
                {"Measure current system load"
                    .split(" ")
                    .map((word, i) => (
                        <span key={i} style={{ display: "block" }}>
                            {word}
                        </span>)
                    )}
            </h1>
            <p className='data'>{"{h: 2.51 || m: 1.71}"}</p>
        </div>
    )
}
export default HealthStep;