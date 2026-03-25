import React from 'react';
import { InputData } from "./world/input.jsx";

const socket = io();

const RemoteApp = () => {

    return (
        <div
            style={{
                background: "#1C1C1C"
            }}>
            <InputData socket={socket} />
        </div>
    );
};

export default RemoteApp;