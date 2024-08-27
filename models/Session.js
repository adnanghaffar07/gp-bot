// models/Session.js
const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
    sessionId: {
        type: String,
        required: true,
        unique: true,
        trim: true, // Ensure no leading/trailing whitespace
    },
    startTime: {
        type: Date,
        default: Date.now,
    },
    endTime: {
        type: Date,
    },
    users: [
        {
            type: mongoose.Schema.Types.ObjectId, // Use ObjectId to reference the User model
            ref: 'User',
        },
    ],
});

module.exports = mongoose.model('Session', SessionSchema);
