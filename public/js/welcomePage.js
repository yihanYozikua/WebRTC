import Chat from './chat.js';

$(function () {
  const nickname = sessionStorage.getItem('myNickname') ||
                   (prompt('To join the room, a nickname is required...') || '').trim();

  if (!nickname) {
    alert('A nickname is REQUIRED to join this video call!!!');
    window.location.href = '/';
    return;
  }
  sessionStorage.setItem('myNickname', nickname);
  const roomId = window.location.pathname.split('/')[2] || 'general';

  // connect and emit
  Chat.emit('new user', nickname);
  Chat.emit('join room', {username: nickname, room: roomId});

  $('#enterPage').hide();
  $('#chatroom-content').show();
  const $frmMessage = $('#send-message');
  const $boxMessage = $('#message');
  const $chat = $('#chat');

  Chat.on('usernames', (data) => {
    let sb = ' ';
    for (let i = 0; i < data.length; i++) {
      console.log(data[i]);
      sb += '<i class="fas fa-user-circle"></i>&nbsp' + data[i] + "<br />";
    }
    $('div#users').html(sb);
  });
  Chat.on('chat', (server, msg) => {
    const now = new Date();
    let datetime = now.getFullYear() + '/' + (now.getMonth() + 1) + '/' + now.getDate();
    datetime += ' ' + now.getHours() + ':' + now.getMinutes() + ':' + now.getSeconds();

    $chat.append(
      "<i style='color: #9bffb2;'><b>" + msg + "</b> <p style='font-size: 1.5vh;'>" + datetime + "</p></i>");
  });
  Chat.on('new message', (data) => {
    const now = new Date();
    let datetime = (now.getMonth() + 1) + '/' + now.getDate();
    datetime += ' ' + now.getHours() + ':' + now.getMinutes() + ':' + now.getSeconds();

    $chat.append(
      "<div class='msg-content'><b style='font-weight:normal; background-color: gray; padding: 0.5vh 1vh; border-radius: 5px;'>" +
      data.nick + "</b>&nbsp" + data.msg + " <i style='font-size: 1.5vh; color: gray;'>&nbsp" + datetime +
      "</i><br /><div>");
  });

  $frmMessage.submit(function (e) {
    e.preventDefault();
    Chat.emit('send message', $boxMessage.val().trim());
    $boxMessage.val('');
  });
});