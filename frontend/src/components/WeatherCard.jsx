import { useEffect, useState } from "react";
import weatherService from "../services/weatherService";

function WeatherCard({ city }) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await weatherService.getWeather(city);

        setWeather(data);
      } catch (error) {
        console.error("Weather error:", error);

        if (error.response) {
          setError(
            error.response.data?.message || "Unable to fetch weather data"
          );
        } else if (error.request) {
          setError("Unable to connect to the server");
        } else {
          setError("Something went wrong");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [city]);

  if (loading) {
    return <p>Loading weather...</p>;
  }

  if (error) {
    return (
      <div className="weather-error">
        <p>{error}</p>
      </div>
    );
  }

  if (!weather) {
    return null;
  }

  return (
    <div>
      <h3>{weather.city}</h3>

      <p>{weather.temperature}°C</p>

      <p>{weather.description}</p>

      <p>Feels like: {weather.feelsLike}°C</p>

      <p>Humidity: {weather.humidity}%</p>
    </div>
  );
}

export default WeatherCard;
