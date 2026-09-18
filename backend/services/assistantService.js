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
  error?.code === 503 ||
  error?.code === "GEMINI_NOT_CONFIGURED";

const SUPPORTED_LANGUAGES = new Set(["en", "te", "hi"]);

export const normalizeAssistantLanguage = (language) =>
  SUPPORTED_LANGUAGES.has(language) ? language : "en";

const languageName = (language) => ({
  en: "English",
  te: "Telugu",
  hi: "Hindi",
}[normalizeAssistantLanguage(language)]);

const containsAny = (value, terms) => terms.some((term) => value.includes(term));

const inferIntentWithoutGemini = (query) => {
  const normalizedQuery = query.toLowerCase();

  if (
    /^(hi|hello|hey|good morning|good afternoon|good evening)\b/.test(normalizedQuery) ||
    containsAny(normalizedQuery, ["నమస్కారం", "హలో", "హాయ్", "नमस्ते", "हैलो", "हाय"])
  ) {
    return "GENERAL_QUESTION";
  }

  if (containsAny(normalizedQuery, ["ఫిర్యాదు", "ఫిర్యాదులు", "शिकायत", "शिकायतें"])) {
    if (containsAny(normalizedQuery, ["స్థితి", "స్టేటస్", "स्थिति", "स्टेटस"])) {
      return "GET_COMPLAINT_STATUS";
    }
    return "GET_MY_COMPLAINTS";
  }

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

const isComplaintFollowUp = (query) => {
  const normalizedQuery = query.toLowerCase();
  return (
    /\b(when|date|day)\b/.test(normalizedQuery) &&
    /\b(submit|submitted|report|reported|file|filed)\b/.test(normalizedQuery)
  ) || /\b(status|progress|state)\b/.test(normalizedQuery);
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

  if (history.length > 0 && (isComplaintFollowUp(query) || containsAny(normalizedQuery, ["స్థితి", "స్టేటస్", "स्थिति", "स्टेटस"]))) {
    return normalizedQuery.includes("status") ||
      normalizedQuery.includes("progress") ||
      normalizedQuery.includes("state") ||
      containsAny(normalizedQuery, ["స్థితి", "స్టేటస్", "स्थिति", "स्टेटस"])
      ? "GET_COMPLAINT_STATUS"
      : "GET_COMPLAINT_DETAILS";
  }

  if (history.length > 0 && containsAny(normalizedQuery, ["ఎప్పుడు", "సమర్పించ", "कब", "जमा"])) {
    return "GET_COMPLAINT_DETAILS";
  }

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
    const ai = createGeminiClient();
    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
    });

    return response.text.trim().toUpperCase();
  } catch (error) {
    if (!isGeminiUnavailable(error)) throw error;
    return inferIntentWithoutGemini(query);
  }
};

export const generateNaturalResponse = async (query, context, history = [], language = "en") => {
  const ai = createGeminiClient();
  const responseLanguage = languageName(language);
  const prompt = `
You are the Smart City Assistant for a citizen complaint and service tracking application.

Answer the user's question using ONLY the information provided in the context.

Do not invent complaint details, statuses, dates, locations, or other facts.

If the context does not contain enough information to answer the question, clearly say that you do not have enough information.

Keep the answer short, clear, friendly, and conversational.
Respond only in ${responseLanguage}. Keep complaint titles and other database values unchanged when useful.

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

export const generateGeneralResponse = async (query, context, history = [], language = "en") => {
  const ai = createGeminiClient();
  const responseLanguage = languageName(language);
  const prompt = `
You are the friendly Smart City Assistant for a citizen complaint and service tracking application.

Answer casual greetings and general questions naturally and conversationally.
For questions about this application, use the available features below and do not claim features that are not listed.
Keep the answer short, clear, and helpful. For a greeting, greet the user and offer to help.
Respond only in ${responseLanguage}.

User question:
${query}

Previous conversation:
${JSON.stringify(history, null, 2)}

Available application features:
${JSON.stringify(context, null, 2)}
`;

  const response = await ai.models.generateContent({
    model: "gemini-3.6-flash",
    contents: prompt,
  });

  return response.text.trim();
};