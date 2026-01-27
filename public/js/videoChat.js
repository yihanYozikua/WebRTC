import Chat from "./chat.js";

const roomId = window.location.pathname.split('/')[2] || 'general';
let peer;
let cacheStream;
let startButton, callButton, hangupButton;
let localVideo, remoteVideo, local_vid_area, remote_vid_area;

const offerOptions = {
  offerToReceiveAudio: 1,
  offerToReceiveVideo: 1,
};

// Media config
const mediaConstraints = { // https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamConstraints
  audio: true,
  video: true,
};

const onIceCandidate = (event) => {
  if (event.candidate) {
    Chat.emit('icecandidate', {
      room: roomId,
      candidate: event.candidate
    });
  }
}

const addRemoteStream = (event) => {
  if (remoteVideo.srcObject !== event.streams[0]) {
    remoteVideo.srcObject = event.streams[0];
  }
}

// build Peer Connection
const buildPeerConnection = () => {
  const peer = new RTCPeerConnection();
  peer.onicecandidate = onIceCandidate;
  // https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/ontrack
  peer.ontrack = addRemoteStream;

  return peer;
}

async function getUserStream() {
  console.log("getUserMedia ...");
  console.log("Requesting local stream");

  local_vid_area.style.display = "flex";
  if ("mediaDevices" in navigator) {
    const stream = await navigator.mediaDevices.getUserMedia(
      mediaConstraints
    );
    cacheStream = stream;
    localVideo.srcObject = stream;
    stream.getTracks().forEach((track) => peer.addTrack(track, stream)); // https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/addTrack

    // enable "Enter Video Chat" Button & disabled itself
    callButton.removeAttribute("disabled");
    hangupButton.removeAttribute("disabled");
    startButton.setAttribute("disabled", "disabled");
  }
}

const caller = async () => {
  try {
    console.log("createOffer start");
    remote_vid_area.style.display = "flex";

    // https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/createOffer
    const offer = await peer.createOffer(offerOptions);
    await peer.setLocalDescription(offer);
    sendSDPBySignaling("offer", offer);
  } catch (error) {
    console.log(`Failed to create session description: ${error.toString()}`);
  }
}

const createAnswer = async () => {
  try {
    console.log("create answer");
    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);
    sendSDPBySignaling("answer", answer);
  } catch (e) {
    onSetSessionDescriptionError(e);
  }
}

// https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/setRemoteDescription
const setRemoteDescription = async (type, desc) => {
  try {
    console.log(type, desc)
    await peer.setRemoteDescription(desc);
    if (type === "offer") {
      await createAnswer();
    }
  } catch (error) {
    console.log(`Failed to create session description: ${error.toString()}`);
  }
}

const addCandidate = (candidate) => {
  try {
    peer.addIceCandidate(candidate);
  } catch (error) {
    console.log(`Failed to add ICE: ${error.toString()}`);
  }
}

const sendSDPBySignaling = (event, sdp) => {
  Chat.emit(event, {
    room: roomId,
    [event]: sdp
  });
}

const close = () => {
  if (peer) {
    peer.close();
    peer = null;
  }
  if (cacheStream) {
    cacheStream.getTracks().forEach((track) => track.stop());
  }
  window.location.reload();
}

const Init = async () => {
  startButton = document.getElementById("startButton");
  callButton = document.getElementById("callButton");
  hangupButton = document.getElementById("hangupButton");
  localVideo = document.getElementById("localVideo");
  remoteVideo = document.getElementById("remoteVideo");
  local_vid_area = document.getElementById("local-container");
  remote_vid_area = document.getElementById("remote-container");

  if (!startButton) {
    return;
  }

  peer = buildPeerConnection();

  Chat.on("offer", (offer) => setRemoteDescription("offer", offer));
  Chat.on("answer", (answer) => setRemoteDescription("answer", answer));
  Chat.on("icecandidate", (candidate) => addCandidate(candidate));

  startButton.addEventListener("click", getUserStream);
  callButton.addEventListener("click", caller);
  hangupButton.addEventListener("click", close);
};

window.addEventListener('load', () => {
  Init().catch((err) => console.log(err));
});
