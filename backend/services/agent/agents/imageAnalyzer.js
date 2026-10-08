import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { getModel } from "../config/llmModel.js";
import fs from "fs/promises";
import { deductCredit } from "../utils/deductCredit.js";
import { checkAgentLimit } from "../config/agentLimit.js";

export const imageAnalyzer = async (state) => {
  try {
    await checkAgentLimit("image", state.userId);

    const llm = await getModel("imageAnalyzer");

    const imageBuffer = await fs.readFile(state.file.path);

    const base64Image = imageBuffer.toString("base64");

    const messages = [
      new SystemMessage(
        `You are CortexAI image analyzer Agent.
                
                Rules:
                
                - Analyzer only the uploaded image.
                - Answer the user's question accurately.
                - If text exists in the image, extract it.
                - If charts or tables exist, explain them.
                - If something is unclear, say so.
                - Use markdown when helpful.
                - Do not hallucinate. 
                `,
      ),
      new HumanMessage({
        content: [
          { type: "text", text: state.prompt || "analyzer the image" },
          {
            type: "image_url",
            image_url: {
              url: `data:${state.file.mimetype};base64,${base64Image}`,
            },
          },
        ],
      }),
    ];

    const response = await llm.invoke(messages);
    await deductCredit(state.userId, "image");

    return {
      ...state,
      aiResponse: response.content,
    };
  } catch (error) {
    if (error?.status === 429) throw error;

    console.log(error);
    return {
      ...state,
      aiResponse: "failed to analyze file",
    };
  } finally {
    if (state.file?.path) {
      await fs.unlink(state.file.path).catch(() => {});
    }
  }
};
