const socket = io();

const Chat = {
  emit(event, data) {
    socket.emit(event, data);
  },
  on(event, callback) {
    socket.on(event, callback);
  }
};

export default Chat;