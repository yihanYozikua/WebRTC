import Chat from "./chat.js";

const roomId = window.location.pathname.split('/')[2] || 'general';
let peer;
let localStream;

const config = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

const VideoChat = {
  elements: {},

  async init() {
    this.elements = {
      start: document.getElementById("startButton"),
      call: document.getElementById("callButton"),
      hangup: document.getElementById("hangupButton"),
      local: document.getElementById("localVideo"),
      remote: document.getElementById("remoteVideo")
    };

    this.elements.start.onclick = () => this.startMedia();
    this.elements.call.onclick = () => this.makeCall();
    this.elements.hangup.onclick = () => location.reload();

    this.setupSignaling();
  },

  async startMedia() {
    localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
    this.elements.local.srcObject = localStream;
    this.elements.start.disabled = true;
    this.elements.call.disabled = false;
    this.elements.hangup.disabled = false;
  },

  setupPeer() {
    peer = new RTCPeerConnection(config);
    localStream.getTracks().forEach(track => peer.addTrack(track, localStream));

    peer.onicecandidate = (e) => {
      if (e.candidate) Chat.emit('icecandidate', { room: roomId, candidate: e.candidate });
    };

    peer.ontrack = (e) => {
      this.elements.remote.srcObject = e.streams[0];
    };
  },

  async makeCall() {
    this.setupPeer();
    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    Chat.emit('offer', { room: roomId, offer });
  },

  setupSignaling() {
    Chat.on('offer', async (offer) => {
      if (!peer) this.setupPeer();
      await peer.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);
      Chat.emit('answer', { room: roomId, answer });
    });

    Chat.on('answer', async (answer) => {
      await peer.setRemoteDescription(new RTCSessionDescription(answer));
    });

    Chat.on('icecandidate', async (candidate) => {
      if (peer) await peer.addIceCandidate(new RTCIceCandidate(candidate));
    });
  }
};

VideoChat.init();