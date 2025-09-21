
let messages = [];

function list() {
  return messages;
}

function create({ content, author }) {
  const message = {
    id: String(messages.length + 1),
    content,
    author: author || 'anonymous',
    createdAt: new Date().toISOString()
  };
  messages.push(message);
  return message;
}

module.exports = { list, create };
