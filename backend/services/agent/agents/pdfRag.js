import fs from "fs";
import { PDFParse } from "pdf-parse";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { vectorStore } from "../config/vectorDb.js";
import { getModel } from "../config/llmModel.js";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { deductCredit } from "../utils/deductCredit.js";
import { checkAgentLimit } from "../config/agentLimit.js";

export const pdfRag = async (state) => {
  try {
    await checkAgentLimit("pdf", state.userId);

    const buffer = fs.readFileSync(state.file.path);

    const pdf = new PDFParse({
      data: buffer,
    });

    const result = await pdf.getText();

    const text = result.text || "";
    if (!text.trim()) {
      throw new Error("No readable text was extracted from the PDF");
    }

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const docs = await splitter.createDocuments([text]);

    const collectionName = `pdf-${Date.now()}`;

    const store = await vectorStore(docs, collectionName);
    const relevantDocs = await store.similaritySearch(state.prompt, 5);

    const retrievedContext = relevantDocs
      .map((document) => document.pageContent)
      .join("\n\n")
      .trim();
    const context =
      text.length <= 30000 ? text : retrievedContext || text.slice(0, 30000);

    console.log("[pdfRag] PDF context prepared", {
      characters: text.length,
      chunks: docs.length,
      retrievedChunks: relevantDocs.length,
      contextCharacters: context.length,
    });

    const llm = await getModel("pdfRag");

    const messages = [
      new SystemMessage(`
            You are CortextAI PDF Assistent.
            
            Rules:
            - Answer ONLY from the uploaded PDF.
            - Never make up information.
            - If the answer is not present in the PDF, reply:
            " I couldn't find this information in the uploaded PDF."
            - Use Markdown formatting.
            `),
      new HumanMessage(
        `
              PDF CONTENT START
              ${context}
              PDF CONTENT END

              Question: ${state.prompt}
        `,
      ),
    ];

    const response = await llm.invoke(messages);

    await deductCredit(state.userId, "pdf");

    return {
      ...state,
      aiResponse: response.content,
    };
  } catch (error) {
    if (error?.status === 429) throw error;

    console.error("[pdfRag] Failed to analyze PDF:", error);
    return {
      ...state,
      aiResponse: "failed to analyze pdf",
    };
  } finally {
    if (state.file?.path && fs.existsSync(state.file.path)) {
      fs.unlinkSync(state.file.path);
    }
  }
};
