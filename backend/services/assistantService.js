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

const isGeminiUnavailable = (error) =>
  error?.status === 429 ||
  error?.status === 503 ||
  error?.response?.status === 429 ||
  error?.response?.status === 503 ||
  error?.code === 429 ||
  error?.code === 503;

const inferIntentWithoutGemini = (query) => {
  const normalizedQuery = query.toLowerCase();

  if (
    normalizedQuery.includes("weather") ||
    normalizedQuery.includes("temperature") ||
    normalizedQuery.includes("forecast") ||
    normalizedQuery.includes("raining")
  ) {
    return "GET_WEATHER";
  }

  if (
    normalizedQuery.includes("detail") ||
    normalizedQuery.includes("tell me about")
  ) {
    return "GET_COMPLAINT_DETAILS";
  }

  if (normalizedQuery.includes("status")) {
    return "GET_COMPLAINT_STATUS";
  }

  if (
    normalizedQuery.includes("complaint") ||
    normalizedQuery.includes("issue")
  ) {
    return "GET_MY_COMPLAINTS";
  }

  return "GENERAL_QUESTION";
};

export const detectIntent = async (query, history = []) => {
  const normalizedQuery = query.toLowerCase();

  if (
    normalizedQuery.includes("weather") ||
    normalizedQuery.includes("temperature") ||
    normalizedQuery.includes("forecast") ||
    normalizedQuery.includes("raining")
  ) {
    return "GET_WEATHER";
  }

  if (
    normalizedQuery.includes("detail") ||
    normalizedQuery.includes("tell me about")
  ) {
    return "GET_COMPLAINT_DETAILS";
  }

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

Previous conversation:
${JSON.stringify(history, null, 2)}

Return ONLY the intent name.
Do not provide an explanation.
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
    });

    return response.text.trim();
  } catch (error) {
    if (!isGeminiUnavailable(error)) throw error;
    return inferIntentWithoutGemini(query);
  }
};

export const generateNaturalResponse = async (query, context, history = []) => {
  const ai = createGeminiClient();
  const prompt = `
You are the Smart City Assistant for a citizen complaint and service tracking application.

Answer the user's question using ONLY the information provided in the context.

Do not invent complaint details, statuses, dates, locations, or other facts.

If the context does not contain enough information to answer the question, clearly say that you do not have enough information.

Keep the answer short, clear, friendly, and conversational.

User question:
${query}

Previous conversation:
${JSON.stringify(history, null, 2)}

Context:
${JSON.stringify(context, null, 2)}
`;

  const response = await ai.models.generateContent({
    model: "gemini-3.6-flash",
    contents: prompt,
  });

  return response.text.trim();
};