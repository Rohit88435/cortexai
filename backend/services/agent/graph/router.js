import { getModel } from "../config/llmModel.js";

export const router = async (state) => {
  if (state.agent && state.agent !== "auto") {
    return {
      ...state,
      agent: state.agent,
    };
  }

  if (state.file?.mimetype === "application/pdf") {
    return {
      ...state,
      agent: "pdfRag",
    };
  }
  if (state.file?.mimetype?.startsWith("image/")) {
    return {
      ...state,
      agent: "imageAnalyzer",
    };
  }

  const llm = await getModel("router");

  const prompt = `You are an agent router.
Choose the single best agent for the user's request.

Available agents:
- chat
- search
- coding
- pdf
- ppt
- image

Use these rules:
- chat: general conversation, explanations, learning, questions
- search: current events, latest information, news
- coding: code generation, debugging, architecture, APIs
- pdf: generate or discuss PDFs/documents
- ppt: generate or discuss presentations
- image: create or edit images

Return exactly one word from this list only:
chat, search, coding, pdf, ppt, image

User query:
${state.prompt}`;

  const response = await llm.invoke(prompt);

  return {
    ...state,
    agent: response.content.trim().toLowerCase(),
  };
};
