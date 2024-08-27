// models/Message.js
const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    sessionId: {
        type: mongoose.Schema.Types.ObjectId, // Use ObjectId to reference the Session model
        ref: 'Session',
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId, // Use ObjectId to reference the User model
        ref: 'User',
        required: true,
    },
    text: {
        type: String,
        required: true,
        trim: true, // Ensure no leading/trailing whitespace
    },
    timestamp: {
        type: Date,
        default: Date.now, // Default to current date
    },
});

module.exports = mongoose.model('Message', MessageSchema);
