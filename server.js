const express = require('express');
const http = require('http');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const socketIo = require('socket.io');
const bodyParser = require('body-parser');
const slackRoutes = require('./routes/slackRoutes');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
});

// Middleware to handle raw body for Slack request verification
app.use(express.json({ verify: (req, res, buf) => (req.rawBody = buf) }));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Attach Socket.io to requests
app.use((req, res, next) => {
    req.io = io;
    next();
});

// Slack routes
app.use('/api', slackRoutes);

// Handle WebSocket connections
io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });

    socket.on('chatMessage', async (msg) => {
        try {
            const user = await User.findOne({ userId: msg.userId });
            if (!user) {
                throw new Error('User not found');
            }

            const session = await Session.findById(msg.sessionId);
            if (!session) {
                throw new Error('Session not found');
            }

            const message = new Message({
                sessionId: session._id,
                userId: user._id,
                text: msg.text,
                timestamp: new Date(),
            });
            await message.save();

            // Emit the message to other clients
            io.emit('message', message);
        } catch (error) {
            console.error('Error handling chat message:', error);
        }
    });

    socket.on('reconnect_attempt', () => {
        console.log('User is attempting to reconnect');
    });

    socket.on('reconnect_error', () => {
        console.log('Reconnection attempt failed');
    });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => console.log(`Server running on port http://localhost:${PORT}`));
