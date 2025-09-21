const messagesStore = require('../store/messages');

module.exports = {
  messages: async () => {
    return messagesStore.list();
  }
};
