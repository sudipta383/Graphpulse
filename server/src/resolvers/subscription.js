const { MESSAGE_TOPIC } = require('../pubsub/constants');

module.exports = {
  messagePosted: {
    subscribe: (_, __, { pubsub }) => pubsub.asyncIterator([MESSAGE_TOPIC])
  }
};
