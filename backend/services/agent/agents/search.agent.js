import { checkAgentLimit } from "../config/agentLimit.js";
import { searchTool } from "../config/tavily.js";
import { deductCredit } from "../utils/deductCredit.js";

export const searchAgent = async (state) => {
  try {
    await checkAgentLimit("search", state.userId);

    const result = await searchTool.invoke({
      query: state.prompt,
    });

    await deductCredit(state.userId, "search");

    return {
      ...state,
      searchResults: result,
      images: result.images,
    };
  } catch (error) {
    if (error?.status === 429) throw error;

    return {
      ...state,
      searchResults: [],
      images: [],
    };
  }
};
