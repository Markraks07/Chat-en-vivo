const socket = io();

const choiceContainer = document.getElementById('choice-container');
const authContainer = document.getElementById('auth-container');
const chatContainer = document.getElementById('chat-container');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const authTitle = document.getElementById('auth-title');
const authBtn = document.getElementById('auth-submit');
const authMsg = document.getElementById('auth-msg');

const form = document.getElementById('form');
const input = document.getElementById('input');
const messages = document.getElementById('messages');

let username = '';
let action = ''; // 'register' o 'login'

// Hora actual
function getCurrentTime() {
    const now = new Date();
    const h = now.getHours().toString().padStart(2,'0');
    const m = now.getMinutes().toString().padStart(2,'0');
    return `${h}:${m}`;
}

// Mostrar formulario
document.getElementById('btn-register').addEventListener('click', () => {
    choiceContainer.style.display = 'none';
    authContainer.style.display = 'block';
    authTitle.textContent = 'Registrarse';
    authBtn.textContent = 'Registrar';
    action = 'register';
    authMsg.textContent = '';
    usernameInput.value = '';
    passwordInput.value = '';
});

document.getElementById('btn-login').addEventListener('click', () => {
    choiceContainer.style.display = 'none';
    authContainer.style.display = 'block';
    authTitle.textContent = 'Iniciar sesión';
    authBtn.textContent = 'Iniciar sesión';
    action = 'login';
    authMsg.textContent = '';
    usernameInput.value = '';
    passwordInput.value = '';
});

// Click registrar/iniciar
authBtn.addEventListener('click', () => {
    const user = usernameInput.value.trim();
    const pass = passwordInput.value.trim();
    if (!user || !pass) return;

    fetch(action === 'register' ? '/register' : '/login', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({username:user,password:pass})
    }).then(res => res.json())
      .then(data => {
          if (data.success) {
              if(action === 'register'){
                  authMsg.style.color = 'green';
                  authMsg.textContent = 'Registrado con éxito. Ahora inicia sesión.';
                  authTitle.textContent = 'Iniciar sesión';
                  authBtn.textContent = 'Iniciar sesión';
                  action = 'login';
                  usernameInput.value = '';
                  passwordInput.value = '';
              } else {
                  username = user;
                  authContainer.style.display = 'none';
                  chatContainer.style.display = 'flex';
              }
          } else {
              authMsg.style.color = 'red';
              authMsg.textContent = data.msg;
          }
      });
});

// Enviar mensaje
form.addEventListener('submit', e => {
    e.preventDefault();
    if (!input.value || !username) return;
    const msg = { user: username, text: input.value, time: getCurrentTime() };
    socket.emit('chat message', msg);
    input.value = '';
});

// Recibir mensaje
socket.on('chat message', msg => {
    const item = document.createElement('li');
    const userSpan = document.createElement('span');
    userSpan.className = 'username';
    userSpan.textContent = msg.user;

    const textSpan = document.createElement('span');
    textSpan.textContent = msg.text;

    const timeSpan = document.createElement('span');
    timeSpan.className = 'time';
    timeSpan.textContent = msg.time;

    item.appendChild(userSpan);
    item.appendChild(textSpan);
    item.appendChild(timeSpan);

    item.className = msg.user === username ? 'sent' : 'received';
    messages.appendChild(item);
    messages.scrollTop = messages.scrollHeight;
});
