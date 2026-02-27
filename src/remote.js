const socket = io(); 

socket.on('connect', () => {
    socket.emit('join-remote');
});
