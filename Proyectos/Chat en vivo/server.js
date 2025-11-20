const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const bodyParser = require('body-parser');

app.use(express.static(__dirname));
app.use(bodyParser.json());

let users = {}; // Usuarios {username: password}
let messages = []; // Mensajes históricos
const ADMIN = 'admin'; // Usuario admin

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/login.html');
});

// Registro
app.post('/register', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.json({ success: false, msg: 'Completa todos los campos' });
    if (users[username]) return res.json({ success: false, msg: 'Usuario ya existe' });

    users[username] = password;
    res.json({ success: true });
});

// Login
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (users[username] && users[username] === password) {
        res.json({ success: true, admin: username === ADMIN });
    } else {
        res.json({ success: false, msg: 'Usuario o contraseña incorrectos' });
    }
});

// Socket.io
io.on('connection', socket => {
    console.log('Usuario conectado');

    // Enviar historial
    socket.emit('chat history', messages);

    // Recibir mensaje
    socket.on('chat message', msg => {
        messages.push(msg);
        io.emit('chat message', msg);
    });

    // Borrar mensaje (solo admin)
    socket.on('delete message', index => {
        messages.splice(index, 1);
        io.emit('chat history', messages);
    });

    socket.on('disconnect', () => console.log('Usuario desconectado'));
});

http.listen(3000, () => console.log('Servidor corriendo en http://localhost:3000'));
