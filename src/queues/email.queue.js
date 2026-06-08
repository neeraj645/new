import { Queue } from "bullmq";
import redisConnection from "../config/ioredis.config.js";

export const emailQueue = new Queue(
    "emailQueue",
    {
        connection: redisConnection,
        defaultJobOptions: {
            attempts: 3,
            backoff: {
                type: "exponential",
                delay: 5000,
            },
            removeOnComplete: 1000,
            removeOnFail: 500,
        },
    }
);