import repl from 'repl';
import WebSocket from 'ws';
import nodeLocalStorage from 'node-localstorage';
const { LocalStorage } = nodeLocalStorage;

import { setWsClass } from 'unnamed-network/conn/ws.js';
setWsClass(WebSocket);

import ConnManager from 'unnamed-network/connManager.js';
import WssConnProvider from 'unnamed-network/connProvider/wss.js';

import { defaultFirstAddr } from './config.js';

import App from './src/index.js';

let [myAddr, storage, port] = process.argv.slice(2);
if (!myAddr) {
  console.log('usage: npm start [myAddr] [storage] [port]');
  console.log(`using default myAddr: ${defaultFirstAddr}`);
  myAddr = defaultFirstAddr.slice(0);
}
if (!port) {
  port = process.env.PORT || (new URL(myAddr)).port || 8000;
  console.log(`using port from myAddr: ${port}`);
}
if (!storage) {
  storage = './.local-storage/default';
  console.log(`using default storage: ${storage}`);
}

const localStorage = new LocalStorage(storage);

const wss = new WebSocket.Server({ port });
const wssConnProvider = new WssConnProvider(wss);

global.cm = new ConnManager(myAddr, wssConnProvider);
console.log(`=> global.cm : connManager`);

(async () => {
  const app = new App(global.cm, { defaultFirstAddr, localStorage });
  Object.keys(app).forEach(methodName => {
    Object.defineProperty(global, methodName, {
      get: () => app[methodName],
    });
    console.log(`=> global.${methodName}`);
  })
})();

const replServer = repl.start({ prompt: '> ' });



// ==========================
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

