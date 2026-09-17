import { GoogleGenAI } from "@google/genai";

const createGeminiClient = () => {
  if (!process.env.GEMINI_API_KEY) {
    const error = new Error("GEMINI_API_KEY is not configured");
    error.code = "GEMINI_NOT_CONFIGURED";
    throw error;
  }

  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });
};

export const detectIntent = async (query) => {
  const ai = createGeminiClient();

  const prompt = `
You are an intent classifier for a Smart City Complaint & Service Tracker.

Classify the user's question into exactly ONE of these intents:

GET_MY_COMPLAINTS
GET_COMPLAINT_STATUS
GET_COMPLAINT_DETAILS
GET_WEATHER
GENERAL_QUESTION

User question:
"${query}"

Return ONLY the intent name.
Do not provide an explanation.
`;

  const response = await ai.models.generateContent({
    model: "gemini-3.6-flash",
    contents: prompt,
  });

  return response.text.trim();
};

export const generateNaturalResponse = async (query, context) => {
  const ai = createGeminiClient();
  const prompt = `
You are the Smart City Assistant for a citizen complaint and service tracking application.

Answer the user's question using ONLY the information provided in the context.

Do not invent complaint details, statuses, dates, locations, or other facts.

If the context does not contain enough information to answer the question, clearly say that you do not have enough information.

Keep the answer short, clear, friendly, and conversational.

User question:
${query}

Context:
${JSON.stringify(context, null, 2)}
`;

  const response = await ai.models.generateContent({
    model: "gemini-3.6-flash",
    contents: prompt,
  });

  return response.text.trim();
};