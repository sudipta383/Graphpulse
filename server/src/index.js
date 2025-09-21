require('dotenv').config();
const express = require('express');
const http = require('http');
const { ApolloServer } = require('apollo-server-express');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const { WebSocketServer } = require('ws');
const { useServer } = require('graphql-ws/lib/use/ws');
const pino = require('pino');

const typeDefs = require('./schema');
const resolvers = require('./resolvers');
const pubsub = require('./pubsub');
const { verifyToken } = require('./auth/jwt');

const log = pino({ level: process.env.LOG_LEVEL || 'info' });

async function start() {
  const app = express();

  // Simple health check
  app.get('/health', (req, res) => res.json({ status: 'ok' }));

  // Build schema
  const schema = makeExecutableSchema({ typeDefs, resolvers });

  // Apollo server for queries + mutations
  const apolloServer = new ApolloServer({
    schema,
    context: ({ req }) => {
      // extract token for HTTP requests
      const token = req.headers.authorization?.replace('Bearer ', '');
      const user = token ? verifyToken(token) : null;
      return { pubsub, user, log };
    },
    plugins: []
  });

  await apolloServer.start();
  apolloServer.applyMiddleware({ app, path: '/graphql' });

  const server = http.createServer(app);

  // WebSocket server for GraphQL subscriptions
  const wsServer = new WebSocketServer({
    server,
    path: '/graphql'
  });

  const serverCleanup = useServer({
    schema,
    context: async (ctx, msg, args) => {
      // ctx.connectionParams is sent by client when initiating WS connection
      const token = ctx.connectionParams?.authorization?.replace('Bearer ', '') || ctx.connectionParams?.authToken;
      const user = token ? verifyToken(token) : null;
      return { pubsub, user, log };
    },
    onConnect: async (ctx) => {
      // optional: early auth check
      // throw new Error('Unauthorized') to close connection
      return;
    },
    onError: (ctx, msg, errors) => {
      log.error({ errors }, 'Subscription error');
    }
  }, wsServer);

  const PORT = process.env.PORT || 4000;
  server.listen(PORT, () => {
    log.info(`HTTP/GraphQL ready at http://localhost:${PORT}${apolloServer.graphqlPath}`);
    log.info(`Subscriptions ready at ws://localhost:${PORT}${apolloServer.graphqlPath}`);
  });

  // graceful shutdown
  const shutdown = async () => {
    log.info('Shutting down...');
    await apolloServer.stop();
    serverCleanup.dispose();
    server.close(() => log.info('Server closed'));
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
