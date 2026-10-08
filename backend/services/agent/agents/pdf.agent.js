import { getModel } from "../config/llmModel.js";
import { generatePdf } from "../utils/generatePdf.js";
import { getFromS3 } from "../utils/getFromS3.js";
import { uploadToS3 } from "../utils/uploadToS3.js";
import { deductCredit } from "../utils/deductCredit.js";
import { checkAgentLimit } from "../config/agentLimit.js";

export const pdfAgent = async (state) => {
  try {
    await checkAgentLimit("pdf", state.userId);

    const llm = await getModel("pdf");

    const prompt = `
   You are qn expert document writer.
   
   Return ONLY valid JSON.
   
   Do NOT return markdown.
   
   Do not return explanation.
   
   Structure:
   
   {
   "title":"",
   "subtitle":"",
   "section":[
   {
   "heading":"",
   "points":[],
   }
   ]
   }
   
   Generate 4-8 sections.
   
   Each section should have 3-6 concise bullet points.
   
   Topic : 
   ${state.prompt}
   
   `;

    const res = await llm.invoke(prompt);

    const data = JSON.parse(res.content);
    await deductCredit(state.userId, "pdf");

    console.log(data);

    const pdfBuffer = await generatePdf(data);

    const filename = `pdf-${Date.now()}.pdf`;

    await uploadToS3(filename, pdfBuffer, "application/pdf");

    const downloadUrl = await getFromS3(filename, 10 * 60);

    return {
      ...state,
      aiResponse: `## PDF Ready

Your document has been generated successfully.

**${data.title}**

[Download PDF](${downloadUrl})

_This download link expires in 10 minutes._`,
    };
  } catch (error) {
    if (error?.status === 429) throw error;

    console.log(` pdf agent error : ${error}`);
    return {
      ...state,
      aiResponse: `Failed to generate pdf. `,
    };
  }
};
