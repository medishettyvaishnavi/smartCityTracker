import Complaint from "../models/Complaint.js";
import getWeather from "../services/weatherService.js";
import {
  detectIntent,
  generateGeneralResponse,
  generateNaturalResponse,
  normalizeAssistantLanguage,
} from "../services/assistantService.js";

const formatComplaintFallback = (complaints, includeCategory = false, language = "en") => {
  const labels = {
    en: { intro: "Here is the latest information for your complaints", category: "Category", status: "Status" },
    te: { intro: "మీ ఫిర్యాదుల తాజా సమాచారం ఇది", category: "వర్గం", status: "స్థితి" },
    hi: { intro: "आपकी शिकायतों की नवीनतम जानकारी यह है", category: "श्रेणी", status: "स्थिति" },
  }[language] || { intro: "Here is the latest information for your complaints", category: "Category", status: "Status" };
  const details = complaints.map((complaint) => {
    const category = includeCategory ? ` (${labels.category}: ${complaint.category})` : "";
    return `${complaint.title}${category}: ${labels.status}: ${complaint.status}`;
  });

  return `${labels.intro}: ${details.join("; ")}.`;
};

const formatStatusFallback = (complaints, history, language = "en") => {
  const historyText = history
    .map((message) => message.content)
    .join(" ")
    .toLowerCase();
  const referencedComplaint = complaints.find((complaint) =>
    historyText.includes(complaint.title.toLowerCase())
  ) || complaints[0];

  const messages = {
    en: `The status of your complaint "${referencedComplaint.title}" is ${referencedComplaint.status}.`,
    te: `మీ ఫిర్యాదు "${referencedComplaint.title}" స్థితి ${referencedComplaint.status}.`,
    hi: `आपकी शिकायत "${referencedComplaint.title}" की स्थिति ${referencedComplaint.status} है।`,
  };
  return messages[language] || messages.en;
};

const findRelevantComplaints = (complaints, query, history = []) => {
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
  const conversationText = [
    ...history.map((message) => message.content),
    query,
  ].join(" ");
  const queryWords = conversationText
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

const formatDetailsFallback = (complaints, language = "en") => {
  const labels = {
    en: { submitted: "was submitted on", category: "Category", location: "Location", status: "Status", description: "Description" },
    te: { submitted: "సమర్పించిన తేదీ", category: "వర్గం", location: "ప్రదేశం", status: "స్థితి", description: "వివరణ" },
    hi: { submitted: "जमा करने की तारीख", category: "श्रेणी", location: "स्थान", status: "स्थिति", description: "विवरण" },
  }[language] || { submitted: "was submitted on", category: "Category", location: "Location", status: "Status", description: "Description" };

  return complaints
    .map((complaint) => {
      const location = [
        complaint.location?.address,
        complaint.location?.city,
      ]
        .filter(Boolean)
        .join(", ");
      const date = new Date(complaint.createdAt).toLocaleDateString(language === "te" ? "te-IN" : language === "hi" ? "hi-IN" : "en-US", { month: "long", day: "numeric", year: "numeric" });
      return `${complaint.title} ${labels.submitted} ${date}. ${labels.category}: ${complaint.category}. ${labels.location}: ${location || "Not provided"}. ${labels.status}: ${complaint.status}. ${labels.description}: ${complaint.description}.`;
    })
    .join(" ");
    };

const isGeminiUnavailable = (error) =>
  error?.status === 429 ||
  error?.status === 503 ||
  error?.response?.status === 429 ||
  error?.response?.status === 503 ||
  error?.code === 429 ||
  error?.code === 503 ||
  error?.code === "GEMINI_NOT_CONFIGURED";

const formatGeneralFallback = (query, language = "en") => {
  const normalizedQuery = query.toLowerCase();

  if (
    /^(hi|hello|hey|good morning|good afternoon|good evening)\b/.test(normalizedQuery) ||
    ["నమస్కారం", "హలో", "హాయ్", "नमस्ते", "हैलो", "हाय"].some((greeting) => normalizedQuery.includes(greeting))
  ) {
    return {
      en: "Hello! How can I help you with complaints, city services, or the weather today?",
      te: "నమస్కారం! ఫిర్యాదులు, నగర సేవలు లేదా వాతావరణం గురించి నేను మీకు ఎలా సహాయం చేయగలను?",
      hi: "नमस्ते! शिकायतों, शहर की सेवाओं या मौसम के बारे में मैं आपकी कैसे मदद कर सकता हूँ?",
    }[language];
  }

  if (
    normalizedQuery.includes("report") ||
    normalizedQuery.includes("garbage") ||
    normalizedQuery.includes("complaint") ||
    normalizedQuery.includes("issue")
  ) {
    return {
      en: "To report a garbage problem, sign in, open Report Issue, choose Sanitation & Garbage, describe the problem, add the location and a photo if available, then submit the complaint.",
      te: "చెత్త సమస్యను నివేదించడానికి సైన్ ఇన్ చేసి, Report Issue తెరిచి, Sanitation & Garbage ఎంచుకుని, సమస్య వివరాలు మరియు ప్రదేశాన్ని నమోదు చేసి, అందుబాటులో ఉంటే ఫోటో జత చేసి ఫిర్యాదును సమర్పించండి.",
      hi: "कचरे की समस्या दर्ज करने के लिए साइन इन करें, Report Issue खोलें, Sanitation & Garbage चुनें, समस्या और स्थान दर्ज करें, उपलब्ध हो तो फोटो जोड़ें और शिकायत जमा करें।",
    }[language];
  }

  if (normalizedQuery.includes("weather")) {
    return {
      en: "You can check the current weather for your city from the Smart City home page.",
      te: "Smart City హోమ్ పేజీలో మీ నగర ప్రస్తుత వాతావరణాన్ని చూడవచ్చు.",
      hi: "आप Smart City होम पेज पर अपने शहर का वर्तमान मौसम देख सकते हैं।",
    }[language];
  }

  return {
    en: "I can help with registering, reporting complaints, tracking complaint status, viewing submitted complaints, and checking the weather.",
    te: "రిజిస్ట్రేషన్, ఫిర్యాదుల నమోదు, ఫిర్యాదు స్థితి, సమర్పించిన ఫిర్యాదులు మరియు వాతావరణం గురించి నేను సహాయం చేయగలను.",
    hi: "मैं पंजीकरण, शिकायत दर्ज करने, शिकायत की स्थिति देखने, जमा की गई शिकायतें देखने और मौसम की जानकारी में मदद कर सकता हूँ।",
  }[language];
};

const getWeatherCity = (query, user) => {
  const cityMatch = query.match(/\b(?:in|for|at)\s+([a-zA-Z][a-zA-Z\s-]*?)(?:\?|$)/i);
  const userCity = user?.city || user?.location?.city;

  return cityMatch?.[1]?.trim() || userCity || "Hyderabad";
};

const formatWeatherFallback = (weather, city, language = "en") => {
  const name = weather.name || city;
  if (language === "te") return `${name}లో వాతావరణం ${weather.main.temp}°C, ${weather.weather?.[0]?.description || "ప్రస్తుత పరిస్థితులు"}. తేమ ${weather.main.humidity}%.`;
  if (language === "hi") return `${name} में मौसम ${weather.main.temp}°C है और ${weather.weather?.[0]?.description || "वर्तमान स्थिति"}। नमी ${weather.main.humidity}% है।`;
  return `The weather in ${name} is ${weather.main.temp}°C with ${weather.weather?.[0]?.description || "current conditions"}. Humidity is ${weather.main.humidity}%.`;
};

export const handleAssistantQuery = async (req, res) => {
  try {
    const { query, history = [], language: requestedLanguage = "en" } = req.body;
    const language = normalizeAssistantLanguage(requestedLanguage);

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
        answer = await generateNaturalResponse(query, complaintContext, safeHistory, language);
      } catch (error) {
        if (!isGeminiUnavailable(error)) throw error;
        answer = formatComplaintFallback(complaintContext, true, language);
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

      const relevantComplaints = findRelevantComplaints(complaints, query, safeHistory);
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
        answer = await generateNaturalResponse(query, detailsContext, safeHistory, language);
      } catch (error) {
        if (!isGeminiUnavailable(error)) throw error;
        answer = formatDetailsFallback(relevantComplaints, language);
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
        answer = await generateNaturalResponse(query, statusContext, safeHistory, language);
      } catch (error) {
        if (!isGeminiUnavailable(error)) throw error;
        answer = formatStatusFallback(statusContext, safeHistory, language);
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
        answer = await generateNaturalResponse(query, weatherContext, safeHistory, language);
      } catch (error) {
        if (!isGeminiUnavailable(error)) throw error;
        answer = formatWeatherFallback(weather, city, language);
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
        answer = await generateGeneralResponse(query, {
          application: "Smart City Complaint & Service Tracker",
          availableFeatures: [
            "Register and login",
            "Report public service complaints",
            "Track complaint status",
            "View submitted complaints",
            "Check weather",
          ],
        }, safeHistory, language);
      } catch (error) {
        if (!isGeminiUnavailable(error)) throw error;
        answer = formatGeneralFallback(query, language);
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