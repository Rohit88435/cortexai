import { ChatGroq } from "@langchain/groq";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import dotenv from "dotenv";
import { ChatOpenRouter } from "@langchain/openrouter";

dotenv.config();

const groq = new ChatGroq({
  model: "openai/gpt-oss-120b",
  temperature: 0,
});

const gemini = new ChatGoogleGenerativeAI({
  model: "gemini-3.6-flash",
});

const openrouter = new ChatOpenRouter({
  model: "deepseek/deepseek-chat",
  temperature: 0,
  maxTokens: 2500,

  // other params...
});

export const getModel = (agent) => {
  switch (agent) {
    case "chat":
      return groq;
    case "search":
      return groq;
    case "coding":
      return openrouter;
    case "imageAnalyzer":
      return gemini;
    default:
      return groq;
  }
};
