// Setup basic express server
const express = require('express');
const path = require('path');
const http = require('http')
const socket = require('socket.io')
const events = require("./event");
const port = process.env.PORT || 3000; // default port: 3000

const app = express();
const server = http.createServer(app) // use express to handle http server

const io = socket(server);
let nicknames = [];

const onConnection = (socket) => {
  socket.on('new user', (data) => {
    console.log(data);
    if( nicknames.indexOf(data) != -1 ){

    }
    else{
      socket.emit('chat', 'SERVER', 'Welcome ' + data);

      socket.nickname = data;
      nicknames.push(socket.nickname);
      socket.emit('usernames', nicknames);
      updateNicknames();
    }
  });

  function updateNicknames(){
    socket.emit('usernames', nicknames);
  }

  socket.on('send messages', function(data){
    console.log("send msg emit");
		sockets.emit('new message', { msg: data, nick: socket.nickname });
  });

  // Listening for joining a room (joinRoom event)
  socket.on("joinRoom", events.joinRoom(socket));
  socket.on("disconnect", () => {
    events.leaveRoom(socket)({ room: "general" });
    if(!socket.nickname) return;
    socket.emit('chat', 'SERVER', socket.nickname + ' left the room');
    nicknames.splice(nicknames.indexOf(socket.nickname), 1);
    updateNicknames();
    }  
  );

  // for peer to peer communicate
  socket.on("offer", (offer) => events.offer(socket)({room: "general", offer}));
  socket.on("answer", (answer) => events.answer(socket)({room: "general", answer}));
  socket.on("icecandidate", (candidate) => events.icecandidate(socket)({room: "general", candidate}));
};

io.on("connection", onConnection);
// Routing
app.use(express.static(path.join(__dirname, 'public'))); // load static resource
app.get('/', function(req, res){
	res.sendfile(__dirname + '/index.html');
});
app.use('/public', express.static(__dirname + '/public'));

server.listen(port, () => {
  console.log('Server listening at port %d', port);
});