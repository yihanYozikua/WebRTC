$(function(){
  var socket = io.connect();
  var $frmMessage = $('#send-message');
  var $frmNick = $('#setNick');
  var $nickError = $('#nickError');
  var $nickBox = $('#txtNickname');
  var $boxMessage = $('#message');
  var $chat = $('#chat');
  

  $frmNick.submit(function(e){
    console.log($nickBox.val());
    console.log('hi, frmNick');
    e.preventDefault();
    
    socket.emit('new user', $nickBox.val() );
    
    $nickBox.val('');

    $('#enterPage').hide();
    $('#chatroom-content').show();
    
  });

  $frmMessage.submit(function(e){
    e.preventDefault();
    socket.emit('send message', $boxMessage.val().trim());
    $boxMessage.val('');
  });

  socket.on('usernames', function(data){
    var sb = ' ';
    for(var d = 0; d < data.length; d++ ) {
      console.log(data[d]);
      sb += '<i class="fas fa-user-circle"></i>&nbsp' + data[d] + "<br />";
    }
    $('div#users').html(sb);

  });

  socket.on('chat', function(server,msg){
    
    var now = new Date(); 
    var datetime = now.getFullYear()+'/'+(now.getMonth()+1)+'/'+now.getDate(); 
      datetime += ' '+now.getHours()+':'+now.getMinutes()+':'+now.getSeconds(); 

    $chat.append("<i style='color: #9bffb2;'><b>" + msg + "</b> <p style='font-size: 1.5vh;'>" + datetime + "</p></i>");
  });

  socket.on('new message', function(data){
    console.log("new msg append");
    var msg = data.msg;
    var name = data.nick;

    var now = new Date(); 
    var datetime = (now.getMonth()+1)+'/'+now.getDate(); 
    datetime += ' '+now.getHours()+ ':' +now.getMinutes()+':'+now.getSeconds(); 

    $chat.append("<div class='msg-content'><b style='font-weight:normal; background-color: gray; padding: 0.5vh 1vh; border-radius: 5px;'>" + name + "</b>&nbsp" + msg + " <i style='font-size: 1.5vh; color: gray;'>&nbsp" + datetime + "</i><br /><div>");
  });
});