import api from "./api";

const assistantService = {
  async query(message, history = []) {
    const response = await api.post("/assistant/query", {
      query: message,
      history,
    });

    return response.data;
  },
};

export default assistantService;
