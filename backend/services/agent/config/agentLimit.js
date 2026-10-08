import redis from "../../../shared/redis/redis.js";

const Limits = {
  chat: 10,
  auto: 10,
  coding: 5,
  pdf: 5,
  ppt: 5,
  image: 5,
  search: 10,
};

export const checkAgentLimit = async (agent, userId) => {
  try {
    if (!userId) {
      const error = new Error("User ID is required for rate limit verification.");
      error.status = 400;
      throw error;
    }

    const currentAgent = (agent || "chat").toLowerCase();
    const max = Limits[currentAgent] || Limits["chat"];

    const key = `rate:${userId}:${currentAgent}`;
    const count = await redis.incr(key);

    if (count === 1) {
      await redis.expire(key, 60);
    } else {
      // Safety check: Agar TTL kisi reason se miss ho gaya ho, dobara expire set karein
      const curTtl = await redis.ttl(key);
      if (curTtl === -1) {
        await redis.expire(key, 60);
      }
    }

    const rawTtl = await redis.ttl(key);
    const ttl = rawTtl > 0 ? rawTtl : 60;

    if (count > max) {
      const minutes = Math.floor(ttl / 60);
      const seconds = ttl % 60;
      const time = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;

      const error = new Error(`Rate limit exceeded for ${currentAgent}.`);

      error.status = 429;
      error.statusCode = 429;
      error.data = {
        success: false,
        agent: currentAgent,
        limit: max,
        remainingTime: ttl,
        retryAfter: time,
        message: `You have reached the ${currentAgent} limit (${max} requests/minute). Try again in ${time}.`,
      };
      throw error;
    }

    return {
      remaining: Math.max(0, max - count),
      limit: max,
    };
  } catch (error) {
    console.error("checkAgentLimit error:", error);
    throw error;
  }
};

