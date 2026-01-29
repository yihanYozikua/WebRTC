import Chat from "./chat.js";

const roomId = window.location.pathname.split('/')[2] || 'general';
let peer;
let localStream;

const config = {iceServers: [{urls: 'stun:stun.l.google.com:19302'}]};

const VideoChat = {
  elements: {},

  async init() {
    console.log("VideoChat intialized...");

    this.elements = {
      start: document.getElementById("startButton"),
      call: document.getElementById("callButton"),
      hangup: document.getElementById("hangupButton"),
      local: document.getElementById("localVideo"),
      remote: document.getElementById("remoteVideo"),
      localContainer: document.getElementById("local-container"),
      remoteContainer: document.getElementById("remote-container")
    };

    if (!this.elements.start || !this.elements.local) {
      console.error("Couldn't find the HTML DOM.")
      return;
    }

    this.elements.start.onclick = () => this.startMedia();
    this.elements.call.onclick = () => this.makeCall();
    this.elements.hangup.onclick = () => location.reload();

    this.setupSignaling();
  },

  async startMedia() {
    console.log("get user's media...");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({audio: true, video: true});
      localStream = stream;

      if (this.elements.localContainer) {
        this.elements.localContainer.style.display = "flex";
      }

      this.elements.local.srcObject = stream;

      await this.elements.local.play();

      this.elements.start.disabled = true;
      this.elements.call.disabled = false;
      this.elements.hangup.disabled = false;

    } catch (err) {
      console.error("Couldn't start up the camera. err=", err);
      alert("Please make sure that you already grant the access to camera and run the site under HTTPS.");
    }
  },

  setupPeer() {
    peer = new RTCPeerConnection(config);

    localStream.getTracks().forEach(track => peer.addTrack(track, localStream));

    // ICE
    peer.onicecandidate = (e) => {
      if (e.candidate) {
        Chat.emit('icecandidate', {room: roomId, candidate: e.candidate});
      }
    };

    // When receiving others' video track
    peer.ontrack = (e) => {
      console.log("Received track: " + e.candidate);
      if (this.elements.remoteContainer) {
        this.elements.remoteContainer.style.display = "flex";
      }
      this.elements.remote.srcObject = e.streams[0];
    };
  },

  async makeCall() {
    console.log("Making call...");
    this.setupPeer();
    const offer = await peer.createOffer({offerToReceiveAudio: true, offerToReceiveVideo: true});
    await peer.setLocalDescription(offer);
    Chat.emit('offer', {room: roomId, offer});
  },

  setupSignaling() {
    Chat.on('offer', async (offer) => {
      console.log("Get the Offer");
      if (!peer) {
        this.setupPeer();
      }
      await peer.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);
      Chat.emit('answer', {room: roomId, answer});
    });

    Chat.on('answer', async (answer) => {
      console.log("Get the Answer");
      if (peer) {
        await peer.setRemoteDescription(new RTCSessionDescription(answer));
      }
    });

    Chat.on('icecandidate', async (candidate) => {
      if (peer) {
        try {
          await peer.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (e) {
          console.warn("Failed to add ICE candidate. error=", e);
        }
      }
    });
  }
};

window.addEventListener('load', () => VideoChat.init());