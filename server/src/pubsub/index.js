const { PubSub } = require('graphql-subscriptions');
const Redis = require('ioredis');
const { RedisPubSub } = require('graphql-redis-subscriptions');
const log = require('pino')();

const REDIS_URL = process.env.REDIS_URL;

let pubsub;

if (REDIS_URL) {
  log.info('Initializing Redis-backed PubSub');
  const options = {
    // optional ioredis options
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD,
    tls: process.env.REDIS_TLS ? {} : undefined
  };
  const pubClient = new Redis(process.env.REDIS_URL || options);
  const subClient = new Redis(process.env.REDIS_URL || options);
  pubsub = new RedisPubSub({
    publisher: pubClient,
    subscriber: subClient
  });
} else {
  log.info('Initializing in-memory PubSub (dev only)');
  pubsub = new PubSub();
}

module.exports = pubsub;
