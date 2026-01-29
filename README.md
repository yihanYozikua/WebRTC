# Chipi Chat
This is a real-time Video chat app.
![](./img/createConnections.png)

<!-- ## Table of Contents -->
> * [Dev Tools](#dev-tools)
> * [Files Description](#files-description)
> * [How to run locally](#how-to-run-locally)
> * [Reference](#reference)
> * [Screenshots](#screenshots)


## Dev Tools
- [WebRTC](https://webrtc.org/)
- [Express](https://expressjs.com/)
- [Socket.io](https://socket.io/)
- [Node.js](https://nodejs.org/en)

## Files Description
```
.
├── app.js: Routing and socket events transferer.
├── event.js
├── public
│   ├── css
│   ├── js
│   │   ├── chat.js: Singleton to manage all interface.
│   │   ├── landing.js: Enter nickname, generate roomId and redirection.
│   │   ├── onlineList.js: Show or hide online users list user interface.
│   │   ├── videoChat.js: P2P connection, media streaming and WebRTC status.
│   │   └── welcomePage.js: Text chat and online lists.
│   ├── landing.html
│   └── room.html
```
* Caller: Establish RTCPeerConnection -> createOffer -> send `offer` to the other side via `chat.js`
* Receiver: Receive offer event -> setRemoteDescription -> createAnswer -> return the answer.
* ICE exchange: 2 ends will exchange the icecandidate via server until the connection built successfully. And then the video screen will show up in the remoteVideo label.

## How to run locally
Download 
```bash=
git clone https://github.com/yihanYozikua/WebRTC.git
cd WebRTC
npm install
```
Execution
```bash=
node app.js
```

## Reference
* [WebRTC API](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API)
* [MediaStream API](https://developer.mozilla.org/en-US/docs/Web/API/MediaStream)
* [IT邦幫忙鐵人賽-菜雞前端邁入網頁即時通訊(WebRTC)之旅 系列](https://ithelp.ithome.com.tw/users/20129521/ironman/3138)
* [Node.js Style Guide](https://github.com/felixge/node-style-guide)

## Screenshots
### Full features!
![](https://i.imgur.com/8F1HE9Z.jpg)

### Welcome Page!
![](https://i.imgur.com/qwPPoB9.png)

### Will show in the text chat area in real-time when some one join or leave!
![](https://i.imgur.com/MsYb0tT.png)

![](https://i.imgur.com/Hha3gl2.png)

### Texting in the text chat area!
![](https://i.imgur.com/aUGLEaz.png)

### Click the toggler to see who's online now!
![](https://i.imgur.com/tnL1IkC.png)

### Video Chat in real-time!
![](https://i.imgur.com/4x9Mq4O.jpg)