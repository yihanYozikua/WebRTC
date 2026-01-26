// Setup basic express server
const express = require('express');
const path = require('path');
const http = require('http')
const socket = require('socket.io')
const events = require("./event");
const port = process.env.PORT || 3000; // default port: 3000

const app = express();

// Express handles HTTP server
const server = http.createServer(app)

// Socket.io listens on the same server
// handles all requests contain Upgrade header
const io = socket(server);

var nicknames = [];

const onConnection = (socket) => {
  socket.on('new user', function(data){
		const room = socket.roomId || 'general';

		socket.emit('chat', 'SERVER', 'Welcome ' + data);
		socket.nickname = data;

		io.to(room).emit('chat', 'SERVER', socket.nickname + ' join the room');

		updateNicknames(room);
	});

  function updateNicknames(room){
		const usersInRoom = events.getUsersInRoom(room);
		io.to(room).emit('usernames', usersInRoom);
	}

  socket.on('send message', function(data){
		const room = socket.roomId || 'general';
		io.to(room).emit('new message', { 
			msg: data, 
			nick: socket.nickname
		});
	});

  // Listening for joining a room (joinRoom event)
  socket.on("joinRoom", events.joinRoom(socket));

  // Listening for disconnect event)
  socket.on('disconnect', function(){
		const currentRoom = socket.roomId || 'general';

    events.leaveRoom(socket)({ room: currentRoom })

		if (!socket.nickname) return;

		io.to(currentRoom).emit('chat', 'SERVER', socket.nickname + ' left the room');

		updateNicknames(currentRoom);
	});

  // for peer to peer communicate
  socket.on("offer", (data) => events.offer(socket)(data));
  socket.on("answer", (data) => events.answer(socket)(data));
  socket.on("icecandidate", (data) => events.icecandidate(socket)(data));
};

io.on("connection", onConnection);

// Routing
app.get('/', function(req, res){
	res.sendFile(path.join(__dirname, 'public', 'landing.html'));
});
app.get('/room/:roomId', function(req, res){
	res.sendFile(path.join(__dirname, 'public', 'room.html'))
})
app.use(express.static(path.join(__dirname, 'public'))); // load static resource


server.listen(port, () => {
  console.log('Server listening at port %d', port);
});

