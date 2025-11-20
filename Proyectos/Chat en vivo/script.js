const socket = io();

const choiceContainer = document.getElementById('choice-container');
const authContainer = document.getElementById('auth-container');
const chatContainer = document.getElementById('chat-container');
const usernameInput = document.getElementById('username-input');
const passwordInput = document.getElementById('password-input');
const authTitle = document.getElementById('auth-title');
const authBtn = document.getElementById('auth-btn');
const authMsg = document.getElementById('auth-msg');

const form = document.getElementById('form');
const input = document.getElementById('input');
const messages = document.getElementById('messages');

let username = '';
let action = ''; // 'register' o 'login'

// Función para obtener hora
function getCurrentTime() {
    const now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();
    if (hours < 10) hours = '0' + hours;
    if (minutes < 10) minutes = '0' + minutes;
    return `${hours}:${minutes}`;
}

// Mostrar formulario de registro
document.getElementById('show-register').addEventListener('click', () => {
    choiceContainer.style.display = 'none';
    authContainer.style.display = 'block';
    authTitle.textContent = 'Registrarse';
    authBtn.textContent = 'Registrar';
    action = 'register';
    authMsg.textContent = '';
    usernameInput.value = '';
    passwordInput.value = '';
});

// Mostrar formulario de login
document.getElementById('show-login').addEventListener('click', () => {
    choiceContainer.style.display = 'none';
    authContainer.style.display = 'block';
    authTitle.textContent = 'Iniciar sesión';
    authBtn.textContent = 'Iniciar sesión';
    action = 'login';
    authMsg.textContent = '';
    usernameInput.value = '';
    passwordInput.value = '';
});

// Click en botón registrar/iniciar
authBtn.addEventListener('click', () => {
    const user = usernameInput.value.trim();
    const pass = passwordInput.value.trim();
    if (!user || !pass) return;

    const url = action === 'register' ? '/register' : '/login';

    fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user, password: pass })
    }).then(res => res.json())
      .then(data => {
          if (data.success) {
              if (action === 'register') {
                  // Después de registrarse, mostrar mensaje y cambiar a login
                  authMsg.style.color = 'green';
                  authMsg.textContent = 'Registrado correctamente. Ahora inicia sesión.';
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

// BOTÓN Y ENTER PARA ENVIAR SIN RECARGAR LA PÁGINA
const sendBtn = document.getElementById('sendBtn');

// Enviar con botón
sendBtn.addEventListener('click', () => {
    sendMessage();
});

// Enviar con Enter
input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault(); // evita recargar
        sendMessage();
    }
});

// Función enviar mensaje
function sendMessage() {
    if (input.value && username) {
        const msgObj = { user: username, text: input.value, time: getCurrentTime() };
        socket.emit('chat message', msgObj);
        input.value = '';
    }
}


// Recibir mensaje
socket.on('chat message', function(msgObj) {
    const item = document.createElement('li');
    
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

    if (msgObj.user === username) {
        item.classList.add('sent');
    } else {
        item.classList.add('received');
    }

    messages.appendChild(item);
    messages.scrollTop = messages.scrollHeight;
});
