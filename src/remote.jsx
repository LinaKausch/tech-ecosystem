import React, { useEffect } from 'react';
import { InputData } from "./world/input.jsx";
import Background from './components/react/Background.jsx';

const socket = io();

const RemoteApp = () => {
    useEffect(() => {
        socket.emit('join-remote');
    }, []);

    return (
        <>
            <Background />
            <div className='bckg' style={{ zIndex: 1 }}>
                <InputData socket={socket} />
            </div>
        </>
    );
};

export default RemoteApp;
