const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const registerEvents = require('./event');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

io.on('connection', (socket) => {
    console.log(`[Connected] User ID: ${socket.id}`);
    registerEvents(io, socket);
});

server.on('error', (err) => {
    console.error('Server error:', err);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on port ${PORT}`);
});