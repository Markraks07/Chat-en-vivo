const socket = io();

const input = document.getElementById('input');
const sendBtn = document.getElementById('sendBtn');
const messages = document.getElementById('messages');
const sendSound = document.getElementById('sendSound');
const receiveSound = document.getElementById('receiveSound');

let username = localStorage.getItem('loggedUser');
let isAdmin = localStorage.getItem('isAdmin') === 'true';

// Función hora
function getCurrentTime() {
    const now = new Date();
    let h = now.getHours();
    let m = now.getMinutes();
    if (h < 10) h = '0'+h;
    if (m < 10) m = '0'+m;
    return `${h}:${m}`;
}

// Enviar mensaje
function sendMessage() {
    if (!input.value || !username) return;
    const msgObj = { user: username, text: input.value, time: getCurrentTime() };
    socket.emit('chat message', msgObj);
    input.value = '';
    sendSound.play();
}

sendBtn.addEventListener('click', sendMessage);
input.addEventListener('keydown', e => { if(e.key==='Enter'){ e.preventDefault(); sendMessage(); } });

// Mostrar mensaje
function displayMessage(msgObj, index) {
    const item = document.createElement('li');
    item.classList.add('message');
    item.classList.add(msgObj.user === username ? 'mine' : 'other');

    const userSpan = document.createElement('span');
    userSpan.classList.add('username');
    userSpan.textContent = msgObj.user;

    const textSpan = document.createElement('span');
    textSpan.textContent = msgObj.text;

    const timeSpan = document.createElement('span');
    timeSpan.classList.add('time');
    timeSpan.textContent = msgObj.time;

    item.appendChild(userSpan);
    item.appendChild(textSpan);
    item.appendChild(timeSpan);

    if (isAdmin) {
        const delBtn = document.createElement('div');
        delBtn.classList.add('delete-btn');
        delBtn.textContent = 'Borrar';
        delBtn.addEventListener('click', () => {
            socket.emit('delete message', index);
        });
        item.appendChild(delBtn);
    }

    messages.appendChild(item);
    messages.scrollTop = messages.scrollHeight;

    if(msgObj.user !== username) receiveSound.play();
}

// Recibir mensajes
socket.on('chat message', msg => displayMessage(msg, messages.children.length));
socket.on('chat history', msgs => {
    messages.innerHTML = '';
    msgs.forEach((m,i) => displayMessage(m,i));
});
