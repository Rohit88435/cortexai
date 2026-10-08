import { QdrantVectorStore } from "@langchain/qdrant";
import { embeddings } from "./embbedings.js";
import dotenv from "dotenv";
dotenv.config();
export const vectorStore = async (docs, collectionName) => {
  return QdrantVectorStore.fromDocuments(docs, embeddings, {
    url: process.env.QDRANT_URL,
    apiKey: process.env.QDRANT_API_KEY,
    collectionName,
  });
};
