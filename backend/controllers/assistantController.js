export const handleAssistantQuery = async (req, res) => {
  try {
    const { query } = req.body;

    if (!query || !query.trim()) {
      return res.status(400).json({
        message: "Query is required",
      });
    }

    console.log("Assistant query:", query);
    console.log("User:", req.user);

    res.status(200).json({
      answer: "Assistant backend is working.",
    });
  } catch (error) {
    console.error("Assistant error:", error);

    res.status(500).json({
      message: "Failed to process assistant query",
    });
  }
};