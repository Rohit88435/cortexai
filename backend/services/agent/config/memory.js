import redis from "../../../shared/redis/redis.js";
import { getMessages } from "../utils/getMessages.js";

// redis for memory
export const getMemory = async (conversationId) => {
  try {
    if (!conversationId) {
      return [];
    }

    const key = `message-${conversationId}`;

    const cached = await redis.get(key);

    if (cached) {
      return JSON.parse(cached);
    }

    const messages = await getMessages(conversationId);
    await redis.set(key, JSON.stringify(messages || []), "EX", 24 * 60 * 60);

    return Array.isArray(messages) ? messages : [];
  } catch (error) {
    console.log("get memory error", error.message);
    return [];
  }
};

export const addMessageInRedis = async (conversationId, role, content) => {
  try {
    const key = `message-${conversationId}`;
    const rawMessages = await redis.get(key);
    const messages = rawMessages ? JSON.parse(rawMessages) : [];
    messages.push({
      role,
      content,
    });

    if (messages.length > 20) {
      messages.shift();
    }

    await redis.set(key, JSON.stringify(messages));
  } catch (error) {
    console.log("addMessageInRedis error");
  }
};
