import axios from "axios";
import fs from "fs";
import { graph } from "../graph/graph.js";
import { addMessageInRedis } from "../config/memory.js";
import redis from "../../../shared/redis/redis.js";
import { uploadToS3 } from "../utils/uploadToS3.js";
import { getFromS3 } from "../utils/getFromS3.js";
import { checkAgentLimit } from "../config/agentLimit.js";

export const agent = async (req, res, next) => {
  try {
    const { prompt, conversationId, agent } = req.body;

    const file = req.file;

    const userId = req.headers["x-user-id"];

    if (!prompt || !conversationId) {
      return res
        .status(400)
        .json({ message: "prompt and conversationId are required" });
    }

    // Rate Limit Check before uploading file or saving to DB
    await checkAgentLimit(agent, userId);

    // Upload file to S3 and build attachment metadata
    let attachment = null;
    if (file) {
      const s3Key = `uploads/${Date.now()}-${file.originalname}`;
      const fileBuffer = fs.readFileSync(file.path);
      await uploadToS3(s3Key, fileBuffer, file.mimetype);
      const presignedUrl = await getFromS3(s3Key, 7 * 24 * 60 * 60); // 7 days
      attachment = {
        name: file.originalname,
        type: file.mimetype,
        url: presignedUrl,
      };
    }

    await redis.del(`message-${conversationId}`); // one time

    await axios.post(`${process.env.CHAT_SERVICE}/save-message`, {
      conversationId,
      role: "user",
      content: prompt,
      attachment,
    });

    const result = await graph.invoke({
      prompt,
      conversationId,
      agent,
      userId,
      file,
    });

    if (!result || typeof result.aiResponse !== "string") {
      console.error("agent controller invalid graph result", result);
      return res
        .status(500)
        .json({ message: "agent controller error: invalid graph response" });
    }

    const answer = result.aiResponse;
    const images = Array.isArray(result.images) ? result.images : [];

    await addMessageInRedis(conversationId, "user", prompt);
    await addMessageInRedis(conversationId, "assistant", answer);

    await axios.post(`${process.env.CHAT_SERVICE}/save-message`, {
      conversationId,
      role: "assistant",
      content: answer,
      images,
      artifacts: result?.artifacts,
    });

    console.log(answer);

    return res.status(200).json({
      answer,
      images,
      artifacts: result?.artifacts,
      attachment,
    });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (e) {
        console.error("failed to clean up temp file:", e);
      }
    }
    console.error("agent controller error", error);
    next(error);
  }
};
