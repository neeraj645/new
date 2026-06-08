import IORedis from "ioredis";

const redisConnection = new IORedis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

redisConnection.on("connect", () => {
  console.log("BullMQ Redis Connected");
});

export default redisConnection;

// here we only one ioredis connection because our application is small
// but for larger applications you can create saperate connections 
// example: one for queues, one for workers, one for cache, one for pub/sub, etc.
