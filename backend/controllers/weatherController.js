import getWeather from "../services/weatherService.js";

export const getWeatherData = async (req, res) => {
  try {
    const { city } = req.query;

    if (!city || !city.trim()) {
      return res.status(400).json({
        message: "City parameter is required",
      });
    }

    const weather = await getWeather(city.trim());

    if (!weather || !weather.main) {
      return res.status(502).json({
        message: "Invalid response received from weather provider",
      });
    }

    res.status(200).json({
      city: weather.name || city.trim(),
      temperature: Math.round(weather.main.temp * 10) / 10,
      feelsLike: Math.round(weather.main.feels_like * 10) / 10,
      humidity: weather.main.humidity,
      condition: weather.weather?.[0]?.main || "Unknown",
      description: weather.weather?.[0]?.description || "",
    });
  } catch (error) {
    console.error("Weather API error:", error.message);

    const status = error.statusCode || 500;
    res.status(status).json({
      message: error.message || "Unable to fetch weather data",
    });
  }
};
