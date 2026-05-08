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

// Multi-display state
const displays = new Map(); // displayId -> { socketId, waitingQueue: [], systemState, resetTimer }
let displayCounter = 0;

const generateDisplayId = () => {
    displayCounter += 1;
    return `display-${displayCounter}`;
};

const getDisplay = (displayId) => {
    if (!displays.has(displayId)) {
        displays.set(displayId, {
            socketId: null,
            waitingQueue: [],
            systemState: { cameraState: 'IDLE', systemCollapsed: false },
            resetTimer: null,
        });
    }
    return displays.get(displayId);
};

const broadcastRemoteCount = (displayId) => {
    const roomName = `remote-${displayId}`;
    const remoteRoom = io.sockets.adapter.rooms.get(roomName);
    const remoteCount = remoteRoom ? remoteRoom.size : 0;
    io.to(`display-${displayId}`).emit('remote-count', remoteCount);
    io.to(roomName).emit('remote-count', remoteCount);
};

const broadcastSystemState = (displayId) => {
    const state = getDisplay(displayId).systemState;
    io.to(`remote-${displayId}`).emit('system-state', state);
};

const emitQueuePositions = (displayId) => {
    const disp = getDisplay(displayId);
    disp.waitingQueue.forEach((socketId, index) => {
        const queuedSocket = io.sockets.sockets.get(socketId);
        if (!queuedSocket) return;
        queuedSocket.emit('remote-access', { admitted: false, queuePosition: index + 1 });
    });
};

const removeFromQueue = (displayId, socketId) => {
    const disp = getDisplay(displayId);
    const idx = disp.waitingQueue.indexOf(socketId);
    if (idx !== -1) {
        disp.waitingQueue.splice(idx, 1);
        emitQueuePositions(displayId);
    }
};

const promoteQueuedRemotes = (displayId) => {
    const room = io.sockets.adapter.rooms.get(`remote-${displayId}`);
    const remoteCount = room ? room.size : 0;
    const disp = getDisplay(displayId);

    if (remoteCount >= MAX_REMOTES) return;
    if (disp.waitingQueue.length === 0) return;

    const nextSocketId = disp.waitingQueue.shift();
    const nextSocket = io.sockets.sockets.get(nextSocketId);
    if (!nextSocket) {
        emitQueuePositions(displayId);
        promoteQueuedRemotes(displayId);
        return;
    }

    nextSocket.join(`remote-${displayId}`);
    nextSocket.data = nextSocket.data || {};
    nextSocket.data.displayId = displayId;
    nextSocket.emit('remote-access', { admitted: true, queuePosition: 0 });
    nextSocket.emit('system-state', disp.systemState);

    broadcastRemoteCount(displayId);
    emitQueuePositions(displayId);
};

app.use(express.static(join(__dirname, '../dist')));


// Support multiple displays: each display gets its own rooms `display-<id>` and `remote-<id>`
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('join-display', (config = {}) => {
        // Allow client to request a specific id (optional), otherwise generate one
        const displayId = config.displayId || generateDisplayId();
        const disp = getDisplay(displayId);

        if (disp.socketId) {
            socket.emit('display-taken', { displayId });
            console.log(`Display ${displayId} already taken.`);
            return;
        }

        disp.socketId = socket.id;
        socket.data = socket.data || {};
        socket.data.displayId = displayId;
        socket.join(`display-${displayId}`);
        console.log(`Display connected. displayId=${displayId}, socket=${socket.id}`);

        // Send assigned id back to display
        socket.emit('display-room-id', { roomId: displayId });

        broadcastRemoteCount(displayId);
        broadcastSystemState(displayId);

        // Print remote link in server logs for convenience
        console.log(`Remote URL: http://localhost:${port}/remote.html?roomId=${displayId}`);
    });

    socket.on('join-remote', (data = {}) => {
        const displayId = data.roomId;
        if (!displayId || !displays.has(displayId)) {
            socket.emit('remote-join-failed', { error: 'Invalid display id' });
            console.log(`Remote connection rejected, invalid display id: ${displayId}`);
            return;
        }

        const disp = getDisplay(displayId);
        const room = io.sockets.adapter.rooms.get(`remote-${displayId}`);
        const remoteCount = room ? room.size : 0;

        if (remoteCount >= MAX_REMOTES) {
            if (!disp.waitingQueue.includes(socket.id)) disp.waitingQueue.push(socket.id);
            socket.data = socket.data || {};
            socket.data.displayId = displayId;
            socket.emit('remote-count', remoteCount);
            socket.emit('system-state', disp.systemState);
            socket.emit('remote-access', { admitted: false, queuePosition: disp.waitingQueue.indexOf(socket.id) + 1 });
            emitQueuePositions(displayId);
            console.log(`Remote queued for ${displayId}: ${socket.id}`);
            return;
        }

        // Admit remote
        removeFromQueue(displayId, socket.id);
        socket.join(`remote-${displayId}`);
        socket.data = socket.data || {};
        socket.data.displayId = displayId;
        socket.emit('remote-access', { admitted: true, queuePosition: 0 });
        socket.emit('system-state', disp.systemState);
        console.log(`Remote connected to ${displayId}: ${socket.id}`);

        broadcastRemoteCount(displayId);
    });

    socket.on('send-to-display', (data) => {
        const displayId = socket.data?.displayId;
        if (!displayId) return;
        console.log(`Forwarding data to display ${displayId}:`, data);
        io.to(`display-${displayId}`).emit('render-data', data);
        socket.to(`remote-${displayId}`).emit('system-processing', true);
    });

    socket.on('system-state', (state) => {
        const displayId = socket.data?.displayId;
        if (!displayId) return;
        const disp = getDisplay(displayId);
        disp.systemState = { cameraState: state?.cameraState || 'IDLE', systemCollapsed: Boolean(state?.systemCollapsed) };
        broadcastSystemState(displayId);
    });

    socket.on('leave-remote', (data = {}) => {
        const displayId = data.roomId || socket.data?.displayId;
        if (!displayId) return;
        removeFromQueue(displayId, socket.id);
        try { socket.leave(`remote-${displayId}`); } catch (e) { }
        socket.data = socket.data || {};
        delete socket.data.displayId;
        console.log(`Remote left ${displayId}: ${socket.id}`);
        broadcastRemoteCount(displayId);
        promoteQueuedRemotes(displayId);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected', socket.id);
        const displayId = socket.data?.displayId;
        // If it was a display
        if (displayId && displays.has(displayId)) {
            const disp = getDisplay(displayId);
            if (disp.socketId === socket.id) {
                disp.socketId = null;
                console.log(`Display ${displayId} disconnected.`);
                // clear waiting queue
                disp.waitingQueue = [];
            } else {
                // a remote disconnected
                removeFromQueue(displayId, socket.id);
                broadcastRemoteCount(displayId);
                promoteQueuedRemotes(displayId);
            }
        } else {
            // Might be a queued remote for any display: remove from all queues
            for (const [id, disp] of displays.entries()) {
                removeFromQueue(id, socket.id);
                promoteQueuedRemotes(id);
            }
        }
    });
});

server.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on port ${port}`);
});