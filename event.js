const Room1 = 'general'

// saves all the socket.id and nicknames
const users = {
  [Room1]: {},
};

const getUsersInRoom = (room) => {
  if (!users[room]) {
    return [];
  }

  return Object.values(users[room]).map(user => user.username);
};

const joinRoom = (socket) => ({ username, room = Room1 }) => {
  socket.join(room, () => {
    if(!users[room]){
      users[room] = {};
    }

    // save into socket for later disconnection
    // push user for the suitable room
    socket.roomId = room;
    users[room][socket.id] = {
      username: username,
      id: socket.id
    };
    // Notify all the users in the same room
    socket.to(room).emit('newUser', users[room]);
  });
}

const leaveRoom = (socket) => ({ room }) => {
  socket.leave(room, () => {
      let usersRoom = users[room]
      delete  users[room][socket.client.id]
      socket.to(room).emit('userLeave', usersRoom); // To all the users in the same room
  })
}

const offer = (socket) => ({room, offer}) => {
  socket.to(room).emit('offer', offer);
}

const answer = (socket) => ({room, answer}) => {
  console.log('switch answer')
  socket.to(room).emit('answer', answer);
}

const icecandidate = (socket) => ({room, candidate}) => {
  console.log('switch icecandidate')
  socket.to(room).emit('icecandidate', candidate);
}

module.exports = {
  getUsersInRoom,
  joinRoom,
  leaveRoom,
  offer,
  answer,
  icecandidate
}
