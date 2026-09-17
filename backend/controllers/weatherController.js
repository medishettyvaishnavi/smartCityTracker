import getWeather from "../services/weatherService.js";

export const getWeatherData = async (req, res) => {
  try {
    const { city } = req.query;

    if (!city) {
      return res.status(400).json({
        message: "City is required",
      });
    }

    const weather = await getWeather(city);

    res.status(200).json({
      city: weather.name,
      temperature: weather.main.temp,
      feelsLike: weather.main.feels_like,
      humidity: weather.main.humidity,
      condition: weather.weather[0].main,
      description: weather.weather[0].description,
    });
  } catch (error) {
    console.error("Weather API error:", error.message);

    res.status(500).json({
      message: error.message || "Unable to fetch weather data",
    });
  }
};
