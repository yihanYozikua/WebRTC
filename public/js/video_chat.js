import Chat from "./chat.js";


let peer;
let cacheStream;

const startButton = document.getElementById("startButton");
const callButton = document.getElementById("callButton");
const hangupButton = document.getElementById("hangupButton");

const localVideo = document.getElementById("localVideo");
const remoteVideo = document.getElementById("remoteVideo");

const local_vid_area = document.getElementById("local-container");
const remote_vid_area = document.getElementById("remote-container");

const offerOptions = {
  offerToReceiveAudio: 1,
  offerToReceiveVideo: 1,
};
// Media config
// const mediaConstraints = {
//   audio: false,
//   video: true,
// };
const Init = async () => {
  peer = buildPeerConnection();
  Chat.emit("joinRoom", { username: "test" });
  Chat.on("offer", (offer) => setRemoteDescription("offer", offer));
  Chat.on("answer", (answer) => setRemoteDescription("answer", answer));
  Chat.on("icecandidate", (candidate) => addCandidate(candidate));

  startButton.addEventListener("click", getUserStream);
  callButton.addEventListener("click", caller);
  hangupButton.addEventListener("click", close);
};

function buildPeerConnection() {
  const peer = new RTCPeerConnection();
  peer.onicecandidate = onIceCandidate;
  peer.ontrack = addRemoteStream;

  return peer;
}

function onIceCandidate(event) {
  Chat.emit("icecandidate", event.candidate);
}

function addRemoteStream(event) {
  if (remoteVideo.srcObject !== event.streams[0]) {
    remoteVideo.srcObject = event.streams[0];
  }
}

async function getUserStream() {
  console.log("getUserMedia ...");
  console.log("Requesting local stream");

  local_vid_area.style.display = "flex";
  remote_vid_area.style.display = "flex";
  if ("mediaDevices" in navigator) {
    const stream = await navigator.mediaDevices.getUserMedia(
      mediaConstraints
    );
    cacheStream = stream;
    localVideo.srcObject = stream;
    stream.getTracks().forEach((track) => peer.addTrack(track, stream));

    // enable "Enter Video Chat" Button & disabled itself
    callButton.removeAttribute("disabled");
    hangupButton.removeAttribute("disabled");
    startButton.setAttribute("disabled", "disabled");
  }
}

async function caller() {
  try {
    console.log("createOffer start");
    const offer = await peer.createOffer(offerOptions);
    await peer.setLocalDescription(offer);
    sendSDPBySignaling("offer", offer);
  } catch (error) {
    console.log(`Failed to create session description: ${error.toString()}`);
  }
}

async function setRemoteDescription(type, desc) {
  try {
    console.log(type, desc)
    await peer.setRemoteDescription(desc);
    if (type === "offer") createAnswer();
  } catch (error) {
    console.log(`Failed to create session description: ${error.toString()}`);
  }
}
async function createAnswer () {
  try {
    console.log("create answer");
    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);
    sendSDPBySignaling("answer", answer);
  } catch (e) {
    onSetSessionDescriptionError(e);
  }
}

function addCandidate(candidate) {
  try {
    peer.addIceCandidate(candidate);
  } catch (error) {
    console.log(`Failed to add ICE: ${error.toString()}`);
  }
}

function sendSDPBySignaling(event, sdp) {
  console.log(event, sdp)
  Chat.emit(event, sdp);
}

function close() {
  peer.close();
  peer = null;
  cacheStream.getTracks().forEach((track) => track.stop());

  local_vid_area.style.display = "none";
  remote_vid_area.style.display = "none";

  // enable "Start" Button Button & disabled "Enter Video Chat"
  startButton.removeAttribute("disabled");
  callButton.setAttribute("disabled", "disabled");

  window.location.reload();
}

Init().catch((err) => console.log(err));



// ==========================
// Message
// let peer;
// let cacheStream;
let socket;
let dataChannel;

const textSendBtn = document.getElementById("textSendBtn");
textSendBtn.addEventListener("click", sendMessage);

console.log("ENTER TEXTING.JS");

// const offerOptions = {
//   offerToReceiveAudio: 1,
//   offerToReceiveVideo: 1,
// };
// Media config
const mediaConstraints = {
  audio: false,
  video: {
    aspectRatio: {
      ideal: 1.333333, // 3:2 aspect is preferred
    },
  },
};

// core functions
function connection() {
  socket = io.connect("/");

  socket.emit("joinRoom", { username: "test" });
  
  // Socket events
  socket.on("newUser", (data) => {
    const message = "Welcome to Socket.IO Chat – ";
    console.log(message);
    console.log(data);
  });

  socket.on("userLeave", (data) => {
    const message = "Someone Leave ~";
    console.log(message);
    console.log(data);
  });

  socket.on("disconnect", () => {
    console.log("you have been disconnected");
  });

  socket.on("offer", handleSDPOffer);
  socket.on("answer", handleSDPAnswer);
  socket.on("icecandidate", handleNewIceCandidate);
  return socket;
}
function closeDataChannels(channel) {
  channel.close()
}
async function calling() {
  try {
    if (peer) {
      alert("你已經建立連線!");
    } else {
      createPeerConnection();

      await addStreamProcess();
    }
  } catch (error) {
    console.log(`Error ${error.name}: ${error.message}`);
  }
}
connection();

function closing() {
  // Disconnect all our event listeners; we don't want stray events
  // to interfere with the hangup while it's ongoing.
  console.log("Closing connection call");
  if (!peer) return;

  peer.onicecandidate = null;
  peer.ontrack = null;
  peer.onnegotiationneeded = null;
  peer.onconnectionstatechange = null;
  peer.oniceconnectionstatechange = null;
  peer.onicegatheringstatechange = null;
  peer.onsignalingstatechange = null;

  // Stop all tracks on the connection
  peer.getSenders().forEach((sender) => {
    peer.removeTrack(sender);
  });

  // Stop the webcam preview as well by pausing the <video>
  // element, then stopping each of the getUserMedia() tracks
  // on it.
  const localVideo = document.getElementById("localVideo");
  if (localVideo.srcObject) {
    localVideo.pause();
    localVideo.srcObject.getTracks().forEach((track) => {
      track.stop();
    });
  }

  // Close the peer connection

  peer.close();
  peer = null;
  cacheStream = null;
  dataChannel = null;
}
// core functions end

// utils
function createPeerConnection() {
  console.log("CREATE PEER CONNECTION");
  peer = new RTCPeerConnection();
  peer.onicecandidate = handleIceCandidate;
  peer.ontrack = handleRemoteStream;
  peer.onnegotiationneeded = handleNegotiationNeeded;
  peer.onconnectionstatechange = handleConnectionStateChange;
  peer.oniceconnectionstatechange = handleICEConnectionStateChange;
  peer.onicegatheringstatechange = handleICEGatheringStateChange;
  peer.onsignalingstatechange = handleSignalingStateChange;

  peer.ondatachannel = handleDataChannel;
  dataChannel = peer.createDataChannel("my local channel");
}

function handleDataChannel (event) {
  console.log("Receive Data Channel Callback", event);
  const receiveChannel = event.channel;
  
  receiveChannel.onmessage = onReceiveMessageCallback;
  receiveChannel.onopen = onChannelStageChange(receiveChannel);
  receiveChannel.onclose = onChannelStageChange(receiveChannel);
}

function onChannelStageChange(channel) {
  const readyState = channel.readyState;
  console.log('Channel Stage Change ==> ', channel)
  console.log(`channel state is: ${readyState}`);
}

function onReceiveMessageCallback(event) {
  const type = event.target.label

  if (type === 'FileChannel') onReceiveFile(event)
  else console.log("Received Message ==> ", event.data);
}

let receiveBuffer = [];
let receivedSize = 0;
function onReceiveFile(event) {
  console.log("Received Message", event);
  console.log(`Received Message ${event.data.byteLength}`);
  receiveBuffer.push(event.data);
  receivedSize += event.data.byteLength;

  const receiveProgress = document.querySelector('progress#receiveProgress');
  receiveProgress.value = receivedSize;
}

function sendMessage() {
  const textArea = document.querySelector('#dataChannelSend')
  if (dataChannel.readyState === 'open') dataChannel.send(textArea.value)
}

function sendFileData() {

  const fileInput = document.querySelector('input#fileInput');
  const file = fileInput.files[0];
  console.log(`File is ${[file.name, file.size, file.type, file.lastModified].join(' ')}`);

  // Handle 0 size files.
  if (file.size === 0) {
    alert('File is empty, please select a non-empty file');
    return;
  }

  const fileChannel = peer.createDataChannel('FileChannel')
  fileChannel.onopen = () => {

    const sendProgress = document.querySelector('progress#sendProgress');
    sendProgress.max = file.size;
    const chunkSize = 16384;
    const fileReader = new FileReader();
    let offset = 0;
    fileReader.addEventListener('error', error => console.error('Error reading file:', error));
    fileReader.addEventListener('abort', event => console.log('File reading aborted:', event));
    fileReader.addEventListener('load', e => {
      console.log('FileRead.onload ', e);
      fileChannel.send(e.target.result);
      offset += e.target.result.byteLength;
      sendProgress.value = offset;
      if (offset < file.size) {
        readSlice(offset);
      }
    });
    const readSlice = o => {
      console.log('readSlice ', o);
      const slice = file.slice(offset, o + chunkSize);
      fileReader.readAsArrayBuffer(slice);
    };
    readSlice(0);
  }

  fileChannel.onclose = () => console.log('closing File Channel')
}

async function handleNegotiationNeeded() {
  console.log("*** handleNegotiationNeeded fired!");
  try {
    console.log("createOffer ...");
    console.log("setLocalDescription ...");
    await peer.setLocalDescription(await peer.createOffer(offerOptions));
    console.log("signaling offer ...");
    sendSDPBySignaling("offer", peer.localDescription);
  } catch (error) {
    console.log(`Failed to create session description: ${error.toString()}`);
    console.log(`Error ${error.name}: ${error.message}`);
  }
}

function handleSignalingStateChange() {
  console.log("*** WebRTC signaling 狀態改變: " + peer.signalingState);
}

function handleConnectionStateChange() {
  console.log("*** WebRTC connectionState 狀態改變: " + peer.connectionState);

  switch (peer.connectionState) {
    case "closed":
    case "failed":
    case "disconnected":
      closing();
      break;
  }
}

function handleICEConnectionStateChange() {
  console.log("*** ICE agent連線狀態改變: " + peer.iceConnectionState);

  switch (peer.iceConnectionState) {
    case "closed":
    case "failed":
    case "disconnected":
      closing();
      break;
  }
}

function handleICEGatheringStateChange() {
  console.log("*** ICE gathering state changed to: " + peer.iceGatheringState);
}

function handleIceCandidate(event) {
  socket.emit("icecandidate", event.candidate);
}

function handleRemoteStream(event) {
  const remoteVideo = document.getElementById("remoteVideo");
  if (remoteVideo.srcObject !== event.streams[0]) {
    remoteVideo.srcObject = event.streams[0];
  }
}

// async function getUserStream() {
//   console.log("getUserMedia ...");
//   if ("mediaDevices" in navigator) {
//     const stream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
//     cacheStream = stream;

//     const localVideo = document.getElementById("localVideo");
//     localVideo.srcObject = cacheStream;
//   }
// }

async function addStreamProcess() {
  let errMsg = "";
  try {
    await getUserStream();
  } catch (error) {
    errMsg = "getUserStream error ===> " + error.toString();
    throw new Error(errMsg);
  }

  try {
    cacheStream
      .getTracks()
      .forEach((track) => peer.addTrack(track, cacheStream));
  } catch (error) {
    errMsg = "Peer addTransceiver error ===> " + error.toString();
    throw new Error(errMsg);
  }
}

async function handleSDPOffer(desc) {
  console.log("*** 收到遠端送來的offer");
  try {
    if (!peer) {
      createPeerConnection();
    }

    console.log("setRemoteDescription ...");
    await peer.setRemoteDescription(desc);

    if (!cacheStream) {
      await addStreamProcess();
    }

    await createAnswer();
  } catch (error) {
    console.log(`Failed to create session description: ${error.toString()}`);
    console.log(`Error ${error.name}: ${error.message}`);
  }
}

async function handleSDPAnswer(desc) {
  console.log("*** 遠端接受我們的offer並發送answer回來");
  try {
    console.log("setRemoteDescription ...");
    await peer.setRemoteDescription(desc)
  } catch (error) {
    console.log(`Error ${error.name}: ${error.message}`);
  }
}
// async function createAnswer() {
//   try {
//     console.log("createAnswer ...");
//     const answer = await peer.createAnswer();
//     console.log("setLocalDescription ...");
//     await peer.setLocalDescription(answer);
//     console.log("signaling answer ...");
//     sendSDPBySignaling("answer", answer);
//   } catch (error) {
//     errMsg = "Create Answer error ===> " + error.toString();
//     throw new Error(errMsg);
//   }
// }

async function handleNewIceCandidate(candidate) {
  console.log(`*** 加入新取得的 ICE candidate: ${JSON.stringify(candidate)}`);
  try {
    await peer.addIceCandidate(candidate);
  } catch (error) {
    console.log(`Failed to add ICE: ${error.toString()}`);
  }
}

// function sendSDPBySignaling(event, sdp) {
//   socket.emit(event, sdp);
// }