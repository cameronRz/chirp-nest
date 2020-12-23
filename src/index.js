const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const { generateMessage, generateLocationMessage } = require('./utils/messages');

const app = express();
const server = http.createServer(app); // create server to pass into socket.io
const io = socketio(server);

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, '../public')));

io.on('connection', (socket) => {
    console.log('New WebSocket Connection.');

    // // emit to particular client
    // socket.emit('message', generateMessage('Welcome to Chirp Nest!'));

    // // emit to all clients except new joining client
    // socket.broadcast.emit('message', generateMessage('A new new user has joined.'));

    socket.on('join', ({ username, room }) => {
        socket.join(room);

        // emit to particular client
        socket.emit('message', generateMessage('Welcome to Chirp Nest!'));

        // emit to all clients except new joining client in specific room
        socket.broadcast.to(room).emit('message', generateMessage(`${username} has joined.`));
        
    });

    socket.on('sendMessage', (messageInput, callback) => {
        // emit to all clients
        io.emit('message', generateMessage(messageInput));
        callback();
    });

    // event auto fired from client when a user disconnects
    socket.on('disconnect', () => {
        io.emit('message', generateMessage('A user has disconnected.'));
    });

    socket.on('sendLocation', (coords, callback) => {
        io.emit('locationMessage', generateLocationMessage(coords));
        callback();
    });
});

server.listen(PORT, () => {
    console.log(`App running on port: ${PORT}.`);
});