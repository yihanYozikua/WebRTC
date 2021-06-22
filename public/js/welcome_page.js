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
    var sb = '';
    for(var d = 0; d < data.length; d++ ) {
      console.log(data[d]);
      sb += data[d] + "<br />";
    }
    $('div#users').html(sb);

  });

  socket.on('chat', function(server,msg){
    
    var now = new Date(); 
    var datetime = now.getFullYear()+'/'+(now.getMonth()+1)+'/'+now.getDate(); 
      datetime += ' '+now.getHours()+':'+now.getMinutes()+':'+now.getSeconds(); 

    $chat.append("<br /><i><b>[ " + msg + " ]</b> (" + 
      datetime + ")</i><br />");
  });

  socket.on('new message', function(data){
    console.log("new msg append");
    var msg = data.msg;
    var name = data.nick;

    var now = new Date(); 
    var datetime = now.getFullYear()+'/'+(now.getMonth()+1)+'/'+now.getDate(); 
      datetime += ' '+now.getHours()+':'+now.getMinutes()+':'+now.getSeconds(); 

    $chat.append("<b>" + name + " </b>: " + msg + " (<i>" + datetime + "<i>)<br />");
  });
});