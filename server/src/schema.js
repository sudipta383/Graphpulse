const { gql } = require('apollo-server-express');

module.exports = gql`
  scalar DateTime

  type Message {
    id: ID!
    content: String!
    author: String
    createdAt: String!
  }

  type Query {
    messages: [Message!]!
  }

  type Mutation {
    postMessage(content: String!, author: String): Message!
  }

  type Subscription {
    messagePosted: Message!
  }
`;
