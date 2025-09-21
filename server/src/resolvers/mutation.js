const messagesStore = require('../store/messages');
const { MESSAGE_TOPIC } = require('../pubsub/constants');

module.exports = {
  postMessage: async (_, { content, author }, { pubsub, user }) => {
    
    const message = messagesStore.create({ content, author });
    await pubsub.publish(MESSAGE_TOPIC, { messagePosted: message });
    return message;
  }
};
