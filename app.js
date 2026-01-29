const express = require('express');
const path = require('path');
const http = require('http');
const socket = require('socket.io');
const events = require('./event');

const app = express();
const server = http.createServer(app);
const io = socket(server);
const PORT = process.env.PORT || 3000;

const emitUsernames = (room) => {
  const usersInRoom = events.getUsersInRoom(room);
  io.to(room).emit('usernames', usersInRoom);
};

io.on('connection', (socket) => {
  socket.on('new user', (nickname) => {
    socket.nickname = nickname;
    socket.emit('chat', 'SERVER', `Welcome ${nickname}`);
  });

  socket.on('join room', (data) => {
    const { username, room } = data;
    socket.nickname = username;
    socket.roomId = room;
    events.joinRoom(socket)(data);

    io.to(room).emit('chat', 'SERVER', `${username} joined the room`);
    emitUsernames(room);
  });

  socket.on('send message', (msg) => {
    io.to(socket.roomId || 'general').emit('new message', { msg, nick: socket.nickname });
  });

  socket.on('disconnect', () => {
    if (socket.roomId) {
      const room = socket.roomId;
      events.leaveRoom(socket)({ room });
      io.to(room).emit('chat', 'SERVER', `${socket.nickname || 'Someone'} left`);
      emitUsernames(room);
    }
  });

  // WebRTC Signaling
  ['offer', 'answer', 'icecandidate'].forEach(ev => {
    socket.on(ev, (data) => events[ev](socket)(data));
  });
});

app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public/landing.html')));
app.get('/room/:roomId', (req, res) => res.sendFile(path.join(__dirname, 'public/room.html')));

server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));