import api from "./api";

const weatherService = {
  async getWeather(city) {
    if (!city || !city.trim()) {
      throw new Error("City name is required");
    }

    const response = await api.get("/weather", {
      params: { city: city.trim() },
    });

    const data = response.data;

    return {
      city: data.city || data.name,
      temperature: data.temperature ?? data.main?.temp,
      description: data.description || data.weather?.[0]?.description,
      feelsLike: data.feelsLike ?? data.main?.feels_like,
      humidity: data.humidity ?? data.main?.humidity,
      condition: data.condition || data.weather?.[0]?.main,
    };
  },
};

export default weatherService;
