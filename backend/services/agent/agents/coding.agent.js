import { checkAgentLimit } from "../config/agentLimit.js";
import { getModel } from "../config/llmModel.js";
import { deductCredit } from "../utils/deductCredit.js";

export const codingAgent = async (state) => {
  await checkAgentLimit("coding", state.userId);

  const intentLlm = await getModel("intent");
  const llm = await getModel("coding");

  const intentRes = await intentLlm.invoke(`
    You are an intent classifier.

    Return ONLY one of these values.

    CODE_GENERATION
    CODE_REVIEW
    CODE_EXPLANATION
    DEBUGGING
    OPTIMIZATION
    CONVERSION
    DOCUMENTATION

    User Request: ${state.prompt}
    `);

  const intent = intentRes.content;
  if (intent == "CODE_GENERATION") {
    const prompt = `
    You are CotexAI Coding Agent.

    Generate the requested Project.

    Default stack:
    - HTML
    - CSS
    - JavaScript

    Use React / Next.js / Vue ONLY if explicitly requested.

    Rules:

    - Responsive
    - Modern UI
    - CSS Variables
    - Flexbox/Grid
    - Smooth Scroll
    - Hover Effects
    - Beautiful sapcing
    - Working Project
    - Single page unless user asks otherwise.

    IMAGES
    ================================

    Always USE real "unsplash" for IMGAES.

    Never USE Placeholders.

    Return ONLY valid JSON.

    Schema:

    {
       "files":[
        {
           "name" : "index.html",
           "content" : "..."
        },
        {
           "name" : "style.css",
           "content" : "..."
        },
        {
           "name" : "script.js",
           "content" : "..."
        },
       ]
    }

    Rules:

    - Output  must start with {
    - Output must end with }
    - No Markdown
    - No explanation
    - No extra text
    - No \'\'\'
    - Never mention intent

    User Request: 
    ${state.prompt}

    `;
    const res = await llm.invoke(prompt);
    const data = JSON.parse(res.content);
    await deductCredit(state.userId, "coding");

    return {
      ...state,
      aiResponse: "code Generated Successfully",
      artifacts: [
        {
          id: Date.now(),
          type: "Project",
          files: data.files || [],
          title: state.prompt,
        },
      ],
    };
  }
  const res = await llm.invoke(`
    The user's request is: 
    ${intent}

    Return Markdown only.

    Never generate project files.

    Use headings like:

     # overview
     
     ## Explanation

     ## Problems

     ## Improvements

     ## Best Practices

     ## Optimized Code (If needed)

     User Request: 
      ${state.prompt}
    `);

  const data = res.content;
  await deductCredit(state.userId, "coding");

  return {
    ...state,
    aiResponse: data,
    artifacts: [],
  };
};
