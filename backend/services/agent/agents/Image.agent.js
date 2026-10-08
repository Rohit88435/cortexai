import axios from "axios";
import { getModel } from "../config/llmModel.js";
import { uploadToS3 } from "../utils/uploadToS3.js";
import { getFromS3 } from "../utils/getFromS3.js";
import { deductCredit } from "../utils/deductCredit.js";
import { checkAgentLimit } from "../config/agentLimit.js";

export const ImageAgent = async (state) => {
  try {
    await checkAgentLimit("image", state.userId);

    const llm = await getModel("image");

    const res = await llm.invoke(`
    You are an elite Ai Image prompt engineer.
    
    Convert the user resquest into a highly detailed image generation prompt.
    
    Requirements:
    
    - Cinematic lighting
    - Professional composition
    - Ultra realistic
    - High Detail
    - Beautiful color palette
    - sharp focus
    - 8k quality
    - Photorealistic
    - Depth of field
    - Professional photograph
    - Stunning visuals
    
    Return only the image Prompt.
    
    User Request :
    ${state.prompt}
    `);

    const prompt = res.content.trim();

    const generatedImageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}`;

    const imageRes = await axios.get(generatedImageUrl, {
      responseType: "arraybuffer",
    });
    await deductCredit(state.userId, "image");

    console.log(imageRes);

    const buffer = Buffer.from(imageRes.data);

    const contentType = imageRes.headers["content-type"] || "image/png";
    const extension = contentType.split("/")[1] || "png";
    const filname = `image-${Date.now()}.${extension}`;

    await uploadToS3(filname, buffer, contentType);

    const downloadUrl = await getFromS3(filname, 24 * 60);

    return {
      ...state,
      aiResponse: "# Image Generated Successfully\n\nYour image is ready.",
      images: [downloadUrl],
    };
  } catch (error) {
    if (error?.status === 429) throw error;

    console.error("Image agent error", error);
    return {
      ...state,
      aiResponse: `Failed to generate image`,
    };
  }
};
