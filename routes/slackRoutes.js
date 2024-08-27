const express = require('express');
const router = express.Router();
const slackController = require('../controllers/slackController');

// Slack event subscription endpoint
router.post('/slack/events', slackController.handleSlackEvent);

module.exports = router;
