const socket = io();
const videoGrid = document.getElementById('video-grid');
const localVideo = document.getElementById('localVideo');

// UI Elements for Room Management
const createBtn = document.getElementById('createBtn');
const shareZone = document.getElementById('share-zone');
const roomLinkDisplay = document.getElementById('roomLink');
const copyBtn = document.getElementById('copyBtn');

// UI Elements for Media Controls
const muteBtn = document.getElementById('muteBtn');
const cameraBtn = document.getElementById('cameraBtn');

let localStream;
let isMuted = false;
let isCameraOff = false;
const peers = {}; // Connection storage: { socketId: RTCPeerConnection }

/**
 * Initialize media and determine if user is joining an existing room via URL hash
 */
async function init() {
    try {
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localVideo.srcObject = localStream;

        // Check if there is a room ID in the URL hash (e.g., #room-123)
        const roomId = window.location.hash.substring(1);
        if (roomId) {
            joinRoom(roomId);
        }
    } catch (error) {
        console.error('Error accessing media devices:', error);
        alert('Could not access camera or microphone. Please check permissions.');
    }
}

/**
 * Joins a specific room and updates the UI to show sharing information
 * @param {string} roomId 
 */
function joinRoom(roomId) {
    socket.emit('join-room', roomId);

    // Update URL and UI
    window.location.hash = roomId;
    if (roomLinkDisplay) roomLinkDisplay.innerText = window.location.href;
    if (shareZone) shareZone.style.display = 'block';
    
    const createZone = document.getElementById('create-room-zone');
    if (createZone) createZone.style.display = 'none';
}

/**
 * Create a new room with a random ID
 */
if (createBtn) {
    createBtn.onclick = () => {
        const randomId = Math.random().toString(36).substring(2, 9);
        joinRoom(randomId);
    };
}

/**
 * Copy current URL to clipboard
 */
if (copyBtn) {
    copyBtn.onclick = () => {
        navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
    };
}

/**
 * Toggle Microphone Audio Track
 */
if (muteBtn) {
    muteBtn.onclick = () => {
        isMuted = !isMuted;
        localStream.getAudioTracks().forEach(track => track.enabled = !isMuted);
        muteBtn.innerText = isMuted ? 'Unmute Mic' : 'Mute Mic';
        muteBtn.classList.toggle('off', isMuted);
    };
}

/**
 * Toggle Camera Video Track
 */
if (cameraBtn) {
    cameraBtn.onclick = () => {
        isCameraOff = !isCameraOff;
        localStream.getVideoTracks().forEach(track => track.enabled = !isCameraOff);
        cameraBtn.innerText = isCameraOff ? 'Start Video' : 'Stop Video';
        cameraBtn.classList.toggle('off', isCameraOff);
    };
}

/**
 * Signaling: Handle list of existing users when joining a room
 */
socket.on('all-users', (users) => {
    users.forEach(id => {
        const pc = createPeerConnection(id);
        // Initiator creates the offer
        pc.createOffer().then(sdp => {
            pc.setLocalDescription(sdp);
            socket.emit('offer', { sdp, targetID: id });
        });
    });
});

/**
 * Core Logic: Create WebRTC Connection
 * @param {string} targetID - The Socket ID of the remote peer
 */
function createPeerConnection(targetID) {
    const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });
    peers[targetID] = pc;

    // Attach local tracks to the connection
    localStream.getTracks().forEach(track => pc.addTrack(track, localStream));

    // Handle incoming remote stream
    pc.ontrack = (e) => {
        if (!document.getElementById(`container-${targetID}`)) {
            const container = document.createElement('div');
            container.id = `container-${targetID}`;
            container.className = 'video-container';

            const v = document.createElement('video');
            v.id = targetID;
            v.srcObject = e.streams[0];
            v.autoplay = true;
            v.playsInline = true;

            const label = document.createElement('p');
            label.innerText = `Remote User (${targetID.substring(0, 4)})`;

            container.appendChild(v);
            container.appendChild(label);
            videoGrid.appendChild(container);
        }
    };

    // Handle ICE candidates
    pc.onicecandidate = (e) => {
        if (e.candidate) {
            socket.emit('ice-candidate', { candidate: e.candidate, targetID });
        }
    };

    return pc;
}

/**
 * Signaling: Process incoming SDP Offer
 */
socket.on('offer', async ({ sdp, senderID }) => {
    const pc = createPeerConnection(senderID);
    await pc.setRemoteDescription(new RTCSessionDescription(sdp));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    socket.emit('answer', { sdp: answer, targetID: senderID });
});

/**
 * Signaling: Process incoming SDP Answer
 */
socket.on('answer', ({ sdp, senderID }) => {
    if (peers[senderID]) {
        peers[senderID].setRemoteDescription(new RTCSessionDescription(sdp));
    }
});

/**
 * Signaling: Process incoming ICE Candidate
 */
socket.on('ice-candidate', ({ candidate, senderID }) => {
    if (peers[senderID]) {
        peers[senderID].addIceCandidate(new RTCIceCandidate(candidate));
    }
});

/**
 * Cleanup: Remove user when they disconnect
 */
socket.on('user-left', (id) => {
    if (peers[id]) {
        peers[id].close();
        delete peers[id];
        const container = document.getElementById(`container-${id}`);
        if (container) container.remove();
    }
});

init();