// app.js

// Setup basic express server
import express from 'express';
import path from 'path';
import http from 'http';
import { fileURLToPath } from 'url';
import { Server } from 'socket.io';
const port = process.env.PORT || 3000; // default port: 3000

const app = express();
const server = http.createServer(app) // use express to handle http server
// const io = socket(server);
const io = new Server(server);

// Register Connection Event
const onConnection = (socket) => {
  console.log('Socket.io init success')
};
io.on("connection", onConnection);

// Routing
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.set('views', path.join(__dirname, 'src'));
app.set('view engine', 'ejs');

// index page​​​​​​​​​​
app.get('/',function(req, res){
  res.render('index');
});

server.listen(port, () => {
  console.log('Server listening at port %d', port);
});

