document.addEventListener('DOMContentLoaded', () => {
    const nickForm = document.querySelector('#setNick');
    const nickInput = document.querySelector('#txtNickname');

    nickForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const nickname = nickInput.value.trim();
        if (!nickname) return;

        sessionStorage.setItem('myNickname', nickname);
        const randomId = Math.random().toString(36).substring(2, 9);
        window.location.href = `/room/${randomId}`;
    });
});