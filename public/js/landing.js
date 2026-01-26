$(function(){
    const $frmNick = $('#setNick');
    const $nickBox = $('#txtNickname');

    $frmNick.submit(function(e){
        e.preventDefault();
        const nickname = $nickBox.val().trim();
        if(!nickname) return;

        // store the nickname into SessionStorage (disappear once the tab is closed)
        sessionStorage.setItem('myNickname', nickname);
        
        // generate random ID
        const randomId = Math.random().toString(36).substring(2, 9);
        // redirect to the room
        window.location.href = `/room/${randomId}`;
    });
});