export const ASSISTANT_LANGUAGES = {
  en: {
    label: "English",
    voice: "en-IN",
    promptName: "English",
  },
  te: {
    label: "తెలుగు",
    voice: "te-IN",
    promptName: "Telugu",
  },
  hi: {
    label: "हिन्दी",
    voice: "hi-IN",
    promptName: "Hindi",
  },
};

export const getAssistantLanguage = (language) =>
  ASSISTANT_LANGUAGES[language] || ASSISTANT_LANGUAGES.en;
