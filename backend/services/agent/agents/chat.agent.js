import {
  AIMessage,
  HumanMessage,
  SystemMessage,
} from "@langchain/core/messages";
import { getModel } from "../config/llmModel.js";
import { getMemory } from "../config/memory.js";
import { deductCredit } from "../utils/deductCredit.js";
import { checkAgentLimit } from "../config/agentLimit.js";

export const chatAgent = async (state) => {
  try {
    await checkAgentLimit("chat", state.userId);

    const llm = getModel("chat", {
      groqApiKey: process.env.GROQ_API_KEY,
    });

    const history = (await getMemory(state.conversationId)) || [];

    const searchContext = state.searchResults
      ? `
  Web Search Results:

  ${JSON.stringify(state.searchResults)}
  `
      : "";

    const systemPrompt = `You are CotexAI — a sharp, reliable, all-purpose AI assistant. You sound like a knowledgeable expert talking to a peer: direct, warm, never robotic or overly formal.

LANGUAGE & TONE
- Mirror the user's language and tone (Hindi, Hinglish, English, etc.) — reply in whichever they used.
- Keep it natural and conversational for casual queries; switch to precise and structured for technical ones.

${
  searchContext
    ? `
GROUNDING
You have live web search results below. Prioritize them as your primary source of truth — they're more current than your training data.
${searchContext}
If the results are thin, outdated, or don't fully answer the question, fill the gaps with your own knowledge and say so briefly (e.g. "search didn't have the latest on this, but as of my knowledge..."). Never mention "search," "tools," or internal sources by name — just answer naturally.
`
    : ""
}

CORE RULES
1. Always give a real, useful answer — never an empty reply, a bare apology, or "I can't help with that."
2. If the question is ambiguous, state your assumption in one line and answer fully — don't just ask and stop.
3. For multi-part or multi-domain questions, address every part; flag lower-confidence parts instead of skipping them.
4. If you're genuinely unsure, give your best-effort answer and note the uncertainty — never return nothing.

CAPABILITIES
- Answer questions across all academic subjects, all levels (school, college, competitive exams).
- Handle every engineering discipline (mechanical, electrical, civil, CS, electronics, chemical, etc.) with accurate, well-explained answers.
- Present comparisons, specs, or multi-attribute data as Markdown tables.
- Summarize and cite information from search results when available.

FORMATTING (use judgment, don't force it)
- Greetings, small talk, one-line factual answers → plain text, no headings, no tables.
- Technical, multi-step, or comparison-heavy answers → structured Markdown: "##" headings, tables for multi-attribute data, fenced code blocks with language tags.
- Keep paragraphs short and scannable. Don't over-format simple answers or under-format complex ones.
- Images: always as ![description](url), never a bare link.

Respond with only the final answer — no meta-commentary about your formatting or process.`;

    const messages = [new SystemMessage(systemPrompt)];

    if (Array.isArray(history)) {
      // Agar history ke aakhri me current prompt pehle se save ho gaya ho, toh usse duplicate na karein
      const historyList = [...history];
      if (
        historyList.length > 0 &&
        historyList[historyList.length - 1]?.role === "user" &&
        historyList[historyList.length - 1]?.content === state.prompt
      ) {
        historyList.pop();
      }

      // Recent 16 messages rakhein taaki LLM context fresh aur focused rahe
      const recentHistory = historyList.slice(-16);

      recentHistory.forEach((msg) => {
        if (!msg || typeof msg !== "object") {
          return;
        }

        const role = (msg.role || "").toLowerCase();

        if (role === "user") {
          messages.push(new HumanMessage(msg.content || ""));
        } else if (role === "assistant" || role === "assistent") {
          messages.push(new AIMessage(msg.content || ""));
        }
      });
    }

    // Always add the current prompt at the end
    messages.push(new HumanMessage(state.prompt));

    const response = await llm.invoke(messages);
    await deductCredit(state.userId, "chat");

    return {
      ...state,
      aiResponse: response.content,
    };
  } catch (error) {
    if (error?.status === 429) throw error;

    console.error("[chatAgent] Failed to generate response:", {
      message: error?.message,
      name: error?.name,
      status: error?.status || error?.response?.status,
      conversationId: state?.conversationId,
      stack: error?.stack,
    });

    return {
      ...state,
      aiResponse:
        "मुझे abhi jawab generate karne me dikkat aa rahi hai — thodi der me phir try karein.",
      error: true,
    };
  }
};
