import express from 'express';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { Server } from 'socket.io';

const port = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server);

app.use(express.static(join(__dirname, '..')));

app.get('/', (req, res) => {
    res.sendFile(join(__dirname, '..', 'index.html'));
});

app.get('/remote', (req, res) => {
    res.sendFile(join(__dirname, '..', 'remote.html'));
});

//maybe i need unlimited displays but limited remotes?
io.on('connection', (socket) => {
    socket.on('join-display', () => {
        const room = io.sockets.adapter.rooms.get('display');
        if (room && room.size >= 1) {
            socket.emit('display-full');
            console.log('Display room is full.');
            return;
        }
        socket.join('display');
        console.log('Display connected! Socket ID:', socket.id);
    });
    socket.on('join-remote', () => {
        const room = io.sockets.adapter.rooms.get('remote');
        if (room && room.size >= 5) {
            socket.emit('remote-full');
            console.log('Remote room is full.');
            return;
        }
        socket.join('remote');
        console.log('Remote connected! Socket ID:', socket.id);
    });

    socket.on('send-to-display', (data) => {
        console.log('Forwarding data to display:', data);
        io.to('display').emit('render-data', data);
    });
    // console.log('User connected! Socket ID:', socket.id);
    socket.on('disconnect', () => {
        console.log('User disconnected. Socket ID:', socket.id);
    });
});

server.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on port ${port}`);
});