module.exports = (io, socket) => {
    
    /**
     * Handle user joining a specific room
     * Sends back a list of existing users to the newcomer to initiate P2P connections
     */
    socket.on('join-room', (roomId) => {
        socket.join(roomId);
        
        // Retrieve all current participants in the room
        const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || []);
        
        // Filter out the current user to get a list of remote peers
        const otherUsers = clients.filter(id => id !== socket.id);

        // Notify the new user about existing participants
        socket.emit('all-users', otherUsers);
        
        console.log(`[JOIN] User ${socket.id} joined room: ${roomId}. Total participants: ${clients.length}`);
    });

    /**
     * Relay WebRTC Offer to a specific target peer
     * @param {Object} payload - Includes sdp, targetID, and roomId
     */
    socket.on('offer', (payload) => {
        // Targeted delivery ensures only the intended peer receives the offer
        io.to(payload.targetID).emit('offer', {
            sdp: payload.sdp,
            senderID: socket.id
        });
    });

    /**
     * Relay WebRTC Answer back to the offerer
     * @param {Object} payload - Includes sdp and targetID
     */
    socket.on('answer', (payload) => {
        io.to(payload.targetID).emit('answer', {
            sdp: payload.sdp,
            senderID: socket.id
        });
    });

    /**
     * Relay ICE Candidates to establish the P2P connection
     * @param {Object} payload - Includes candidate and targetID
     */
    socket.on('ice-candidate', (payload) => {
        io.to(payload.targetID).emit('ice-candidate', {
            candidate: payload.candidate,
            senderID: socket.id
        });
    });

    /**
     * Handle disconnection lifecycle
     * Automatically notifies peers in all rooms the user was part of
     */
    socket.on('disconnecting', () => {
        // 'socket.rooms' contains the socket ID itself and the room IDs
        socket.rooms.forEach(room => {
            if (room !== socket.id) {
                // Inform other peers to destroy their local RTCPeerConnection for this user
                socket.to(room).emit('user-left', socket.id);
            }
        });
    });

    socket.on('disconnect', () => {
        console.log(`[LEAVE] User ${socket.id} has disconnected.`);
    });
};