import React, { useEffect, useState } from 'react';
import { InputData } from "./world/input.jsx";
import Background from './components/react/utils/Background.jsx';

const socket = io();

const RemoteApp = () => {
    const [error, setError] = useState('');
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const roomId = params.get('roomId');

        if (!roomId) {
            setError('No roomId provided in URL. Use ?roomId=display-1');
            console.error('Missing roomId parameter');
            return;
        }

        // Prevent duplicate join in StrictMode
        if (!socket._joinedRoom) {
            socket._joinedRoom = true;
            socket.emit('join-remote', { roomId });
        }

        socket.on('remote-access', (info) => {
            setConnected(Boolean(info?.admitted));
        });

        socket.on('remote-join-failed', (d) => {
            setError(d?.error || 'Failed to join remote');
        });

        return () => {
            if (socket._joinedRoom) {
                socket.emit('leave-remote', { roomId });
                socket._joinedRoom = false;
            }
            socket.off('remote-access');
            socket.off('remote-join-failed');
        };
    }, []);

    if (error) {
        return <div style={{ color: '#ff4d4d', padding: 20 }}>{error}</div>;
    }

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
