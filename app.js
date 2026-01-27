// Setup basic express server
const express = require('express');
const path = require('path');
const http = require('http')
const socket = require('socket.io')
const events = require('./event');

const port = process.env.PORT || 3000; // default port: 3000

const app = express();
// Express handles HTTP server
const server = http.createServer(app)
// Socket.io listens on the same server and handles all requests contain Upgrade header
const io = socket(server);

const getRoom = (socket) => socket.roomId || 'general';
const emitUsernames = (room) => {
  const usersInRoom = events.getUsersInRoom(room);
  io.to(room).emit('usernames', usersInRoom);
};
const handleNewUser = (socket) => (nickname) => {
  const room = getRoom(socket);
  socket.nickname = nickname;
  socket.emit('chat', 'SERVER', `Welcome ${nickname}`);
  io.to(room).emit('chat', 'SERVER', `${nickname} join the room`);
  emitUsernames(room);
};
const handleSendMessage = (socket) => (msg) => {
  const room = getRoom(socket);
  io.to(room).emit('new message', {msg, nick: socket.nickname});
};
const handleDisconnect = (socket) => () => {
  const room = getRoom(socket);
  events.leaveRoom(socket)({room});

  if (!socket.username) {
    return
  }

  io.to(room).emit('chat', 'SERVER', `${socket.nickname} left the room`);
  emitUsernames(room);
};

const onConnection = (socket) => {
  socket.on('new user', handleNewUser(socket));
  socket.on('send message', handleSendMessage(socket));
  socket.on('join room', events.joinRoom(socket));
  socket.on('disconnect', handleDisconnect(socket));
  socket.on('offer', (data) => events.offer(socket)(data));
  socket.on('answer', (data) => events.answer(socket)(data));
  socket.on('icecandidate', (data) => events.icecandidate(socket)(data));
};

io.on('connection', onConnection);

// Routing
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'landing.html'));
});
app.get('/room/:roomId', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'room.html'))
})
app.use(express.static(path.join(__dirname, 'public'))); // load static resource

server.listen(port, () => {
  console.log('Server listening at port %d', port);
});

