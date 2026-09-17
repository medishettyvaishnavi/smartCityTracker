import Complaint from "../models/Complaint.js";
import getWeather from "../services/weatherService.js";
import {
  detectIntent,
  generateNaturalResponse,
} from "../services/assistantService.js";

const formatComplaintFallback = (complaints, includeCategory = false) => {
  const details = complaints.map((complaint) => {
    const category = includeCategory ? ` (${complaint.category})` : "";
    return `${complaint.title}${category}: ${complaint.status}`;
  });

  return `Here is the latest information for your complaints: ${details.join("; ")}.`;
};

const formatStatusFallback = (complaints, history) => {
  const historyText = history
    .map((message) => message.content)
    .join(" ")
    .toLowerCase();
  const referencedComplaint = complaints.find((complaint) =>
    historyText.includes(complaint.title.toLowerCase())
  ) || complaints[0];

  return `The status of your complaint "${referencedComplaint.title}" is ${referencedComplaint.status}.`;
};

const findRelevantComplaints = (complaints, query) => {
  const ignoredWords = new Set([
    "about",
    "complaint",
    "complaints",
    "details",
    "detail",
    "give",
    "me",
    "my",
    "tell",
    "what",
    "the",
    "this",
  ]);
  const queryWords = query
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .split(/\s+/)
    .filter((word) => word.length > 2 && !ignoredWords.has(word));

  if (queryWords.length === 0) return complaints.slice(0, 1);

  const relevantComplaints = complaints.filter((complaint) => {
    const searchableText = [
      complaint.title,
      complaint.description,
      complaint.category,
      complaint.location?.address,
      complaint.location?.city,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return queryWords.some((word) => searchableText.includes(word));
  });

  return relevantComplaints.length > 0 ? relevantComplaints : complaints.slice(0, 1);
};

const formatDetailsFallback = (complaints) =>
  complaints
    .map((complaint) => {
      const location = [
        complaint.location?.address,
        complaint.location?.city,
      ]
        .filter(Boolean)
        .join(", ");
      return `${complaint.title} was submitted on ${new Date(complaint.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}. Category: ${complaint.category}. Location: ${location || "Not provided"}. Status: ${complaint.status}. Description: ${complaint.description}.`;
    })
    .join(" ");

const isGeminiUnavailable = (error) =>
  error?.status === 429 ||
  error?.status === 503 ||
  error?.response?.status === 429 ||
  error?.response?.status === 503 ||
  error?.code === 429 ||
  error?.code === 503;

const formatGeneralFallback = (query) => {
  const normalizedQuery = query.toLowerCase();

  if (
    normalizedQuery.includes("report") ||
    normalizedQuery.includes("garbage") ||
    normalizedQuery.includes("complaint") ||
    normalizedQuery.includes("issue")
  ) {
    return "To report a garbage problem, sign in, open Report Issue, choose Sanitation & Garbage, describe the problem, add the location and a photo if available, then submit the complaint.";
  }

  if (normalizedQuery.includes("weather")) {
    return "You can check the current weather for your city from the Smart City home page.";
  }

  return "I can help with registering, reporting complaints, tracking complaint status, viewing submitted complaints, and checking the weather.";
};

const getWeatherCity = (query, user) => {
  const cityMatch = query.match(/\b(?:in|for|at)\s+([a-zA-Z][a-zA-Z\s-]*?)(?:\?|$)/i);
  const userCity = user?.city || user?.location?.city;

  return cityMatch?.[1]?.trim() || userCity || "Hyderabad";
};

const formatWeatherFallback = (weather, city) =>
  `The weather in ${weather.name || city} is ${weather.main.temp}°C with ${weather.weather?.[0]?.description || "current conditions"}. Humidity is ${weather.main.humidity}%.`;

export const handleAssistantQuery = async (req, res) => {
  try {
    const { query, history = [] } = req.body;

    if (!query || !query.trim()) {
      return res.status(400).json({
        message: "Query is required",
      });
    }

    const safeHistory = Array.isArray(history)
      ? history
          .filter(
            (message) =>
              (message?.role === "user" || message?.role === "assistant") &&
              typeof message.content === "string"
          )
          .slice(-12)
      : [];

    const intent = await detectIntent(query, safeHistory);

    console.log("User query:", query);
    console.log("Detected intent:", intent);

    // --------------------------------
    // GET MY COMPLAINTS
    // --------------------------------
    if (intent === "GET_MY_COMPLAINTS") {
      const complaints = await Complaint.find({
        user: req.user.id,
      }).sort({ createdAt: -1 });

      if (complaints.length === 0) {
        return res.status(200).json({
          intent,
          answer: "You have not submitted any complaints yet.",
        });
      }

      const complaintContext = complaints.map((complaint) => ({
        title: complaint.title,
        category: complaint.category,
        status: complaint.status,
        createdAt: complaint.createdAt,
      }));

      let answer;
      try {
        answer = await generateNaturalResponse(query, complaintContext, safeHistory);
      } catch (error) {
        if (!isGeminiUnavailable(error)) throw error;
        answer = formatComplaintFallback(complaintContext, true);
      }

      return res.status(200).json({
        intent,
        answer,
      });
    }

    // --------------------------------
    // GET COMPLAINT DETAILS
    // --------------------------------
    if (intent === "GET_COMPLAINT_DETAILS") {
      const complaints = await Complaint.find({
        user: req.user.id,
      }).sort({ createdAt: -1 });

      if (complaints.length === 0) {
        return res.status(200).json({
          intent,
          answer: "You do not have any complaints yet.",
        });
      }

      const relevantComplaints = findRelevantComplaints(complaints, query);
      const detailsContext = relevantComplaints.map((complaint) => ({
        title: complaint.title,
        category: complaint.category,
        location: complaint.location,
        status: complaint.status,
        description: complaint.description,
        createdAt: complaint.createdAt,
      }));

      let answer;
      try {
        answer = await generateNaturalResponse(query, detailsContext, safeHistory);
      } catch (error) {
        if (!isGeminiUnavailable(error)) throw error;
        answer = formatDetailsFallback(relevantComplaints);
      }

      return res.status(200).json({
        intent,
        answer,
      });
    }

    // --------------------------------
    // GET COMPLAINT STATUS
    // --------------------------------
    if (intent === "GET_COMPLAINT_STATUS") {
      const complaints = await Complaint.find({
        user: req.user.id,
      }).sort({ createdAt: -1 });

      if (complaints.length === 0) {
        return res.status(200).json({
          intent,
          answer: "You do not have any complaints yet.",
        });
      }

      const statusContext = complaints.map((complaint) => ({
        title: complaint.title,
        status: complaint.status,
        createdAt: complaint.createdAt,
      }));

      let answer;
      try {
        answer = await generateNaturalResponse(query, statusContext, safeHistory);
      } catch (error) {
        if (!isGeminiUnavailable(error)) throw error;
        answer = formatStatusFallback(statusContext, safeHistory);
      }

      return res.status(200).json({
        intent,
        answer,
      });
    }

    // --------------------------------
    // GET WEATHER
    // --------------------------------
    if (intent === "GET_WEATHER") {
      const city = getWeatherCity(query, req.user);
      const weather = await getWeather(city);
      const weatherContext = {
        city: weather.name || city,
        temperature: Math.round(weather.main.temp * 10) / 10,
        feelsLike: Math.round(weather.main.feels_like * 10) / 10,
        humidity: weather.main.humidity,
        condition: weather.weather?.[0]?.main || "Unknown",
        description: weather.weather?.[0]?.description || "",
      };

      let answer;
      try {
        answer = await generateNaturalResponse(query, weatherContext, safeHistory);
      } catch (error) {
        if (!isGeminiUnavailable(error)) throw error;
        answer = formatWeatherFallback(weather, city);
      }

      return res.status(200).json({
        intent,
        answer,
        weather: weatherContext,
      });
    }

    // --------------------------------
    // GENERAL QUESTIONS
    // --------------------------------
    if (intent === "GENERAL_QUESTION") {
      let answer;
      try {
        answer = await generateNaturalResponse(query, {
          application: "Smart City Complaint & Service Tracker",
          availableFeatures: [
            "Register and login",
            "Report public service complaints",
            "Track complaint status",
            "View submitted complaints",
            "Check weather",
          ],
        }, safeHistory);
      } catch (error) {
        if (!isGeminiUnavailable(error)) throw error;
        answer = formatGeneralFallback(query);
      }

      return res.status(200).json({
        intent,
        answer,
      });
    }

    // --------------------------------
    // OTHER INTENTS
    // --------------------------------
    return res.status(200).json({
      intent,
      answer: "I can help you with Smart City services and complaints.",
    });
  } catch (error) {
    console.error("Assistant error:", error);

    return res.status(500).json({
      message: "Failed to process assistant query",
    });
  }
};