const { Server } = require('socket.io');

let io;

const init = (server) => {
    io = new Server(server, {
        cors: {
            origin: process.env.FRONTEND_URL || '*',
            methods: ['GET', 'POST', 'PATCH']
        }
    });

    io.on('connection', (socket) => {
        socket.on('register_farmer', (farmerId) => {
            if (!farmerId) return;
            socket.join(String(farmerId));
        });
    });

    return io;
};

const getIO = () => {
    if (!io) {
        throw new Error('Socket.IO not initialized. Call init(server) first.');
    }
    return io;
};

module.exports = { init, getIO };
