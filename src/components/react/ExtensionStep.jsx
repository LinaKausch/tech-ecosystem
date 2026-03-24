import React, { useState } from 'react';

const ExtensionStep = ({ onChange, value }) => {


    return (

        <div>
            <h1>
                {"Measure system stress from social media input"
                    .split(" ")
                    .map((word, i) => (
                        <span key={i} style={{ display: "block" }}>
                            {word}
                        </span>)
                    )}
            </h1>
            <p className='data'>&#123;x: 0.25, y: 0.1, z: 0.2&#125;</p>
        </div>
    )
}
export default ExtensionStep;