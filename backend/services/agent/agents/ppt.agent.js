import { checkAgentLimit } from "../config/agentLimit.js";
import { getModel } from "../config/llmModel.js";
import { deductCredit } from "../utils/deductCredit.js";
import { generatePpt } from "../utils/generatePpt.js";
import { getFromS3 } from "../utils/getFromS3.js";
import { uploadToS3 } from "../utils/uploadToS3.js";

export const pptAgent = async (state) => {
  try {
    await checkAgentLimit("ppt", state.userId);

    const llm = await getModel("ppt");

    const prompt = `You are aa professional presentation designer.
  
  Return ONLY valid JSON.
  
  Format:
  
  {
  "title":"",
  "subtitle":"",
  "slides":[
  {
  "title":"",
  "points":[
  "",
  "",
  "",
  "",
  ]
  }
  ]
  }
  
  Rules:
  
  - Generate exactly 6 content slides.
  - Each slide should have 4-6 concise bullet points.
  - No markdown.
  - No explanation.
  - No code block.
  - Return ONLY JSON.
  
  Topic:
  ${state.prompt}
  `;

    const res = await llm.invoke(prompt);
    const data = JSON.parse(res.content);
    await deductCredit(state.userId, "ppt");

    const ppt = await generatePpt(data);

    const buffer = await ppt.write({ outputType: "nodebuffer" });

    const filename = `ppt-${Date.now()}.pptx`;

    await uploadToS3(
      filename,
      buffer,
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    );

    const downloadUrl = await getFromS3(filename, 10 * 60);

    return {
      ...state,
      aiResponse: `
  
  Your PPT has been generated successfully.
  
  **${data.title}**
  
  [Download PPT](${downloadUrl})
  
  _This download link expires in 10 minutes._`,
    };
  } catch (error) {
    if (error?.status === 429) throw error;

    console.log(` ppt agent error : ${error}`);
    return {
      ...state,
      aiResponse: `Failed to generate ppt. `,
    };
  }
};
