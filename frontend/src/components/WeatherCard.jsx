import { useEffect, useState } from "react";
import weatherService from "../services/weatherService";
import "./WeatherCard.css";

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
    return (
      <div className="weather-widget weather-widget-loading">
        <span className="weather-loading-icon" aria-hidden="true">☁️</span>
        <span>Loading local weather...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="weather-widget-error">
        <span className="weather-error-icon" aria-hidden="true">⚠️</span>
        <div className="weather-error-body">
          <p className="weather-error-title">Weather unavailable</p>
          <p className="weather-error-msg">{error}</p>
        </div>
      </div>
    );
  }

  if (!weather) {
    return null;
  }

  return (
    <div className="weather-widget">
      <div className="weather-widget-header">
        <div>
          <span className="weather-widget-badge">Live weather</span>
          <h3 className="weather-widget-city">{weather.city}</h3>
        </div>
        <span className="weather-widget-icon" aria-hidden="true">☀️</span>
      </div>

      <div className="weather-widget-temp">
        {weather.temperature}<span className="weather-widget-unit">°C</span>
      </div>

      <p className="weather-widget-desc">{weather.description}</p>

      <div className="weather-widget-details">
        <span>Feels like <strong>{weather.feelsLike}°</strong></span>
        <span>Humidity <strong>{weather.humidity}%</strong></span>
      </div>
    </div>
  );
}

export default WeatherCard;
