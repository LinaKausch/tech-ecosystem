import { handleRemoteData } from './world/scene.js';

const socket = io();
const $url = document.getElementById('url');

socket.on('connect', () => {
    socket.emit('join-display');
    const url = `${new URL(`remote.html?id=${socket.id}`, window.location)}`;
    $url.textContent = url;
    $url.setAttribute('href', url);
    
    const typeNumber = 4;
    const errorCorrectionLevel = 'L';
    const qr = qrcode(typeNumber, errorCorrectionLevel);
    qr.addData(url);
    qr.make();
    document.getElementById('qr').innerHTML = qr.createImgTag(4);
});

socket.on("render-data", (data) => {
    console.log("Display performing action:", data.hex);
    handleRemoteData(data);
});
