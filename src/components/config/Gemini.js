// openaiApi.js
// Install: npm install openai

import OpenAI from "openai";

const apiKey = "";

// Create client
const client = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });

const MODEL = "gpt-4o-mini";

const generationConfig = {
  temperature: 1,
  top_p: 0.95,
  max_output_tokens: 500, // "max_tokens" in Chat Completions, but valid here
};

/**
 * run(prompt, history?)
 * @param {string} prompt - The user prompt
 * @param {Array<{role: string, content: string}>} history - Optional chat history
 */
async function run(prompt, history = []) {
  const input = [
    ...history.map(m => ({ role: m.role, content: m.content })),
    { role: "user", content: prompt },
  ];

  const result = await client.responses.create({
    model: MODEL,
    input,
    temperature: generationConfig.temperature,
    top_p: generationConfig.top_p,
    max_output_tokens: generationConfig.max_output_tokens,
  });

  const text = result.output_text || "";
  console.log(text);
  return text;
}

export default run;
