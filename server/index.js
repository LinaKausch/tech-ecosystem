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
const MAX_REMOTES = 5;
const waitingQueue = [];
let latestSystemState = {
    cameraState: 'IDLE',
    systemCollapsed: false,
};

const broadcastRemoteCount = () => {
    const remoteRoom = io.sockets.adapter.rooms.get('remote');
    const remoteCount = remoteRoom ? remoteRoom.size : 0;
    io.to('display').emit('remote-count', remoteCount);
    io.to('remote').emit('remote-count', remoteCount);
};

const broadcastSystemState = () => {
    io.to('remote').emit('system-state', latestSystemState);
};

const emitQueuePositions = () => {
    waitingQueue.forEach((socketId, index) => {
        const queuedSocket = io.sockets.sockets.get(socketId);
        if (!queuedSocket) return;
        queuedSocket.emit('remote-access', {
            admitted: false,
            queuePosition: index + 1,
        });
    });
};

const removeFromQueue = (socketId) => {
    const queueIndex = waitingQueue.indexOf(socketId);
    if (queueIndex !== -1) {
        waitingQueue.splice(queueIndex, 1);
        emitQueuePositions();
    }
};

const promoteQueuedRemotes = () => {
    const room = io.sockets.adapter.rooms.get('remote');
    const remoteCount = room ? room.size : 0;

    if (remoteCount > MAX_REMOTES) return;
    if (waitingQueue.length === 0) return;

    const nextSocketId = waitingQueue.shift();
    const nextSocket = io.sockets.sockets.get(nextSocketId);

    if (!nextSocket) {
        emitQueuePositions();
        promoteQueuedRemotes();
        return;
    }

    nextSocket.join('remote');
    nextSocket.emit('remote-access', { admitted: true, queuePosition: 0 });
    nextSocket.emit('system-state', latestSystemState);

    broadcastRemoteCount();
    emitQueuePositions();
};

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
        broadcastRemoteCount();
        broadcastSystemState();
    });
    socket.on('join-remote', () => {
        const room = io.sockets.adapter.rooms.get('remote');
        const remoteCount = room ? room.size : 0;
        if (remoteCount > MAX_REMOTES) {
            if (!waitingQueue.includes(socket.id)) {
                waitingQueue.push(socket.id);
            }
            socket.emit('remote-count', remoteCount);
            socket.emit('system-state', latestSystemState);
            socket.emit('remote-access', {
                admitted: false,
                queuePosition: waitingQueue.indexOf(socket.id) + 1,
            });
            emitQueuePositions();
            console.log('Remote room is full. Queued Socket ID:', socket.id);
            return;
        }

        removeFromQueue(socket.id);
        socket.join('remote');
        console.log('Remote connected! Socket ID:', socket.id);
        socket.emit('remote-access', { admitted: true, queuePosition: 0 });
        broadcastRemoteCount();
        socket.emit('system-state', latestSystemState);
    });

    socket.on('send-to-display', (data) => {
        console.log('Forwarding data to display:', data);
        io.to('display').emit('render-data', data);
        // Notify all other remotes that system is now processing this data
        socket.broadcast.emit('system-processing', true);
    });
    socket.on('system-state', (state) => {
        latestSystemState = {
            cameraState: state?.cameraState || 'IDLE',
            systemCollapsed: Boolean(state?.systemCollapsed),
        };
        broadcastSystemState();
    });
    // console.log('User connected! Socket ID:', socket.id);
    socket.on('disconnect', () => {
        console.log('User disconnected. Socket ID:', socket.id);
        removeFromQueue(socket.id);
        broadcastRemoteCount();
        promoteQueuedRemotes();
    });
});

server.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on port ${port}`);
});