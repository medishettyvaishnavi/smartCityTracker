import api from "./api";

const assistantService = {
  async query(message, history = [], language = "en") {
    const response = await api.post("/assistant/query", {
      query: message,
      history,
      language,
    });

    return response.data;
  },
};

export default assistantService;
