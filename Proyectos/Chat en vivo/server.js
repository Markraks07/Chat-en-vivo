const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const bodyParser = require('body-parser');

app.use(express.static(__dirname));
app.use(bodyParser.json());

let users = {}; // Usuarios {username: password}
let messages = []; // Mensajes históricos

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/login.html'); // Inicio en login
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
        res.json({ success: true });
    } else {
        res.json({ success: false, msg: 'Usuario o contraseña incorrectos' });
    }
});

// Socket.io
io.on('connection', socket => {
    console.log('Usuario conectado');

    // Enviar historial al nuevo usuario
    socket.emit('chat history', messages);

    // Recibir mensajes nuevos
    socket.on('chat message', msg => {
        messages.push(msg); // Guardar mensaje
        io.emit('chat message', msg); // Emitir a todos
    });

    socket.on('disconnect', () => console.log('Usuario desconectado'));
});

http.listen(3000, () => console.log('Servidor corriendo en http://localhost:3000'));
