const Message = require('../models/Message');
const Session = require('../models/Session');
const User = require('../models/User');
const slackService = require('../services/slackService');
const crypto = require('crypto');
const { createEventAdapter } = require('@slack/events-api');

const slackSigningSecret = '6b7b9150353a7869f91e76932411f99d';
const slackEvents = createEventAdapter(slackSigningSecret);

// Middleware to handle Slack events
const handleSlackEvent = async (req, res) => {
    const slackSignature = req.headers['x-slack-signature'];
    const slackRequestTimestamp = req.headers['x-slack-request-timestamp'];
    const rawBody = req.rawBody;
    const sigBasestring = `v0:${slackRequestTimestamp}:${rawBody}`;
    const mySignature = `v0=${crypto
        .createHmac('sha256', slackSigningSecret)
        .update(sigBasestring, 'utf8')
        .digest('hex')}`;

    if (crypto.timingSafeEqual(Buffer.from(mySignature), Buffer.from(slackSignature))) {
        slackEvents.requestListener()(req, res);
    } else {
        res.status(400).send('Verification failed');
    }
};

// Event listener for Slack messages
slackEvents.on('message', async (event) => {
    if (event.subtype && event.subtype === 'bot_message') {
        // Ignore bot messages
        return;
    }

    try {
        // Extract necessary fields from the event
        const { channel, user, text, ts } = event;

        // Find or create a user based on Slack user ID
        let userDoc = await User.findOne({ slackUserId: user });
        if (!userDoc) {
            userDoc = new User({
                userId: user,
                slackUserId: user,
                username: user, // This could be retrieved via Slack API if available
            });
            await userDoc.save();
        }

        // Check if there's an active session for this user in the channel
        let session = await Session.findOne({ users: userDoc._id, active: true });
        if (!session) {
            session = new Session({
                sessionId: `session-${Date.now()}`,
                users: [userDoc._id],
                startTime: new Date(),
                active: true,
            });
            await session.save();
        }

        // Save message to the database
        const message = new Message({
            sessionId: session._id,
            userId: userDoc._id,
            text: text,
            timestamp: new Date(parseFloat(ts) * 1000), // Convert Slack ts to JavaScript Date
        });
        await message.save();

        // Send acknowledgment or response to Slack
        await slackService.sendMessageToSlack(channel, `Message received: ${text}`);

        // Emit message to connected Socket.io clients
        req.io.emit('message', message);

    } catch (error) {
        console.error('Error handling Slack message:', error);
    }
});

slackEvents.on('error', (error) => {
    console.error('Slack event error:', error.message);
});

module.exports = {
    handleSlackEvent,
};
