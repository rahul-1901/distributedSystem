import { Queue } from "bullmq";
import { env } from "../config/env.js";

if (!env.REDIS_URL) {
  throw new Error("REDIS_URL is missing");
}

export const pushQueue = new Queue("push", {
  connection: {
    url: env.REDIS_URL,
  },

  defaultJobOptions: {
    attempts: 3,

    backoff: {
      type: "exponential",
      delay: 3000,
    },

    removeOnComplete: {
      count: 100,
    },

    removeOnFail: {
      count: 500,
    },
  },
});
