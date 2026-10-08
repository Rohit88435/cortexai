import { StateGraph } from "@langchain/langgraph";
import { agentState } from "./state.js";
import { router } from "./router.js";
import { chatAgent } from "../agents/chat.agent.js";
import { searchAgent } from "../agents/search.agent.js";
import { codingAgent } from "../agents/coding.agent.js";
import { pptAgent } from "../agents/ppt.agent.js";
import { pdfAgent } from "../agents/pdf.agent.js";
import { ImageAgent } from "../agents/Image.agent.js";
import { pdfRag } from "../agents/pdfRag.js";
import { imageAnalyzer } from "../agents/imageAnalyzer.js";

const workFlow = new StateGraph(agentState);

//! nodes =----------------------------------
workFlow.addNode("router", router);
workFlow.addNode("chat", chatAgent);
workFlow.addNode("search", searchAgent);
workFlow.addNode("coding", codingAgent);
workFlow.addNode("ppt", pptAgent);
workFlow.addNode("pdf", pdfAgent);
workFlow.addNode("image", ImageAgent);
workFlow.addNode("pdfRag", pdfRag);
workFlow.addNode("imageAnalyzer", imageAnalyzer);

//? Egdes start with node s-----------------------------------
workFlow.addEdge("__start__", "router");
workFlow.addConditionalEdges(
  "router",
  (state) => {
    switch (state.agent) {
      case "chat":
        return "chat";
      case "search":
        return "search";
      case "coding":
        return "coding";
      case "pdf":
        return "pdf";
      case "ppt":
        return "ppt";
      case "image":
        return "image";
      case "pdfRag":
        return "pdfRag";
      case "imageAnalyzer":
        return "imageAnalyzer";
      default:
        return "chat";
    }
  },
  {
    //?  agents map kr dega -----------------
    chat: "chat",
    search: "search",
    pdf: "pdf",
    ppt: "ppt",
    coding: "coding",
    image: "image",
    pdfRag: "pdfRag",
    imageAnalyzer: "imageAnalyzer",
  },
);

workFlow.addEdge("search", "chat");

//?  agent connect with end ----------------------------
workFlow.addEdge("chat", "__end__");
workFlow.addEdge("coding", "__end__");
workFlow.addEdge("image", "__end__");
workFlow.addEdge("ppt", "__end__");
workFlow.addEdge("pdf", "__end__");
workFlow.addEdge("pdfRag", "__end__");
workFlow.addEdge("imageAnalyzer", "__end__");

export const graph = workFlow.compile();
