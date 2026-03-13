import { inputData } from './world/input.js';

const socket = io(); 

const sendData = (data) => {
    socket.emit('send-to-display', data);
};

socket.on('connect', () => {
    socket.emit('join-remote');
    inputData((payload) => {
        sendData(payload);
    });
});