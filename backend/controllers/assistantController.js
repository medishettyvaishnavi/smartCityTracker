import Complaint from "../models/Complaint.js";
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

const isGeminiUnavailable = (error) =>
  error?.status === 429 || error?.status === 503 || error?.code === 503;

export const handleAssistantQuery = async (req, res) => {
  try {
    const { query } = req.body;

    if (!query || !query.trim()) {
      return res.status(400).json({
        message: "Query is required",
      });
    }

    const intent = await detectIntent(query);

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
        answer = await generateNaturalResponse(query, complaintContext);
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
        answer = await generateNaturalResponse(query, statusContext);
      } catch (error) {
        if (!isGeminiUnavailable(error)) throw error;
        answer = formatComplaintFallback(statusContext);
      }

      return res.status(200).json({
        intent,
        answer,
      });
    }

    // --------------------------------
    // GENERAL QUESTIONS
    // --------------------------------
    if (intent === "GENERAL_QUESTION") {
      const answer = await generateNaturalResponse(query, {
        application: "Smart City Complaint & Service Tracker",
        availableFeatures: [
          "Register and login",
          "Report public service complaints",
          "Track complaint status",
          "View submitted complaints",
          "Check weather",
        ],
      });

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