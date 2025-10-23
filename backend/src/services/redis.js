const redis = require('redis');
const client = redis.createClient({
  socket: {
    host: process.env.REDIS_HOST,
    port: 6379
  }
});

client.connect().catch(console.error);

module.exports = client;
