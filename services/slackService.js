// services/slackService.js
const { WebClient } = require('@slack/web-api');
const slackClient = new WebClient(process.env.SLACK_BOT_TOKEN);

const sendMessageToSlack = async (channel, text) => {
    try {
        await slackClient.chat.postMessage({
            channel: channel,
            text: text,
        });
    } catch (error) {
        console.error('Error sending message to Slack:', error);
    }
};

module.exports = {
    sendMessageToSlack,
};
