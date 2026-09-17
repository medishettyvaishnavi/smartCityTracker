const getWeather = async (city) => {
  const apiKey = process.env.WEATHER_API_KEY;

  if (!apiKey) {
    const error = new Error("Weather service is not configured (missing WEATHER_API_KEY)");
    error.statusCode = 500;
    throw error;
  }

  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
    city
  )}&appid=${apiKey}&units=metric`;

  let response;
  try {
    response = await fetch(url);
  } catch (networkError) {
    const error = new Error("Unable to connect to weather provider. Please check internet connection.");
    error.statusCode = 503;
    throw error;
  }

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    let msg = errData.message || "Failed to fetch weather data";
    msg = msg.charAt(0).toUpperCase() + msg.slice(1);

    const error = new Error(msg);
    error.statusCode = response.status === 404 ? 404 : response.status;
    throw error;
  }

  const data = await response.json();

  return data;
};

export default getWeather;
