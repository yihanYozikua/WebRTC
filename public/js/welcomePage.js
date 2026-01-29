import Chat from './chat.js';

const WelcomePage = {
  init() {
    const nickname = sessionStorage.getItem('myNickname');
    if (!nickname) {
      const name = prompt('Nickname is required:');
      if (!name) return window.location.href = '/';
      sessionStorage.setItem('myNickname', name);
    }

    const roomId = window.location.pathname.split('/')[2] || 'general';

    Chat.emit('join room', { username: sessionStorage.getItem('myNickname'), room: roomId });

    this.bindEvents();
    this.listenSocket();
  },

  bindEvents() {
    const msgForm = document.querySelector('#send-message');
    const msgInput = document.querySelector('#message');

    msgForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const msg = msgInput.value.trim();
      if (msg) {
        Chat.emit('send message', msg);
        msgInput.value = '';
      }
    });
  },

  listenSocket() {
    const chatBox = document.querySelector('#chat');
    const userList = document.querySelector('#users');

    Chat.on('usernames', (users) => {
      userList.innerHTML = users.map(u => `<div><i class="fas fa-user-circle"></i> ${u}</div>`).join('');
    });

    Chat.on('chat', (server, msg) => {
      const time = new Date().toLocaleTimeString();
      chatBox.innerHTML += `<div style="color: #9bffb2;"><b>${msg}</b> <small>${time}</small></div>`;
      chatBox.scrollTop = chatBox.scrollHeight;
    });

    Chat.on('new message', (data) => {
      const time = new Date().toLocaleTimeString();
      chatBox.innerHTML += `
                <div class="msg-content">
                    <b style="background: gray; padding: 2px 5px; border-radius: 3px;">${data.nick}</b> 
                    ${data.msg} <small style="color:gray">${time}</small>
                </div>`;
      chatBox.scrollTop = chatBox.scrollHeight;
    });
  }
};

WelcomePage.init();