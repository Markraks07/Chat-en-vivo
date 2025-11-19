const socket = io();
const form = document.getElementById('form');
const input = document.getElementById('input');
const messages = document.getElementById('messages');

form.addEventListener('submit', function(e) {
    e.preventDefault();
    if (input.value) {
        const msg = input.value;
        socket.emit('chat message', msg);
        input.value = '';
    }
});

socket.on('chat message', function(msg) {
    const item = document.createElement('li');
    item.textContent = msg;
    item.classList.add('received'); // todos los mensajes entrantes
    messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
});
