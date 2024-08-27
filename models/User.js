const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    username: {
        type: String,
        trim: true,
    },
    slackUserId: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    lastActive: {
        type: Date,
        default: Date.now,
    },
    sessions: [
        {
            type: mongoose.Schema.Types.ObjectId, // Use ObjectId to reference the Session model
            ref: 'Session',
        },
    ],
});

module.exports = mongoose.model('User', UserSchema);
