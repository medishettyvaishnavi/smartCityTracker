import api from "./api";

export const assistantService = {
  async query(message) {
    const response = await api.post("/assistant/query", {
      query: message,
    });

    return response.data;
  },
};

export default assistantService;