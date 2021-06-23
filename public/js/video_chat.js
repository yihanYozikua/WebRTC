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
const mediaConstraints = {
  audio: false,
  video: true,
};
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
  // remote_vid_area.style.display = "flex";
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
    remote_vid_area.style.display = "flex";
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