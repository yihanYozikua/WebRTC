# WebRTC

It's a Real-Time Chat program built with WebRTC and Socket.io.
![](https://i.imgur.com/8F1HE9Z.jpg)

---
There are **3 features** in this WebRTC:
1. Real-Time Video Chat
2. Text Chat => can see the list of joining and leaving in real-time
3. check "who's online"
---

<!-- ## Table of Contents -->
> * [Dev Tools](#dev-tools)
> * [Usage](#usage)
> * [Files Description](#files-description)
> * [Reference](#reference)
> * [Demo Screenshot](#demo-screenshot)


## Dev Tools
* **WebRTC**
* **MediaStream**
* **Express**
* **Socket.io**
* Programming Language
  * **Javascript**
  * **HTML5** / **CSS**


## Usage
* Download 
```bash=
git clone https://github.com/yihanYozikua/WebRTC.git
cd final
npm install
```
* Execution
```bash=
node app.js
```


## Files Description
### /public/css/
  HTML style.
### /public/js/
  * /public/js/chat.js：User connection events. Including “new entering”, “leave”, and “disconnect.”
  * /public/js/onlineList.js：Show or hide online users list user interface.
  * /public/js/video_chat.js：WebRTC controller.
  * /public/js/welcome_page.js：Welcome page controller.
### /public/index.html
  User interface.
### app.js
  Start up the socket.io connection.
### event.js
  Events list may occur in the chat room. Including joinRoom, leaveRoom, offer, answer, icecandidate.

## Reference
* [WebRTC API](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API)
* [MediaStream API](https://developer.mozilla.org/en-US/docs/Web/API/MediaStream)
* [IT邦幫忙鐵人賽-菜雞前端邁入網頁即時通訊(WebRTC)之旅 系列](https://ithelp.ithome.com.tw/users/20129521/ironman/3138)


## Demo Screenshot
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