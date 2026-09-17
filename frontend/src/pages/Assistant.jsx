import { useState } from "react";
import assistantService from "../services/assistantService";
function Assistant() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      sender: "assistant",
      text: "Hello! I'm your Smart City Assistant. How can I help you?",
    },
  ]);

const handleSend = async () => {
  if (!message.trim()) return;

  const userMessage = {
    sender: "user",
    text: message,
  };

  setMessages((prev) => [...prev, userMessage]);

  const currentMessage = message;
  setMessage("");

  try {
    const data = await assistantService.query(currentMessage);

    const assistantMessage = {
      sender: "assistant",
      text: data.answer,
    };

    setMessages((prev) => [
      ...prev,
      assistantMessage,
    ]);
  } catch (error) {
    console.error("Assistant error:", error);

    const assistantMessage = {
      sender: "assistant",
      text:
        error.response?.data?.message ||
        "Sorry, something went wrong.",
    };

    setMessages((prev) => [
      ...prev,
      assistantMessage,
    ]);
  }
};

  return (
    <div className="container py-4">
      <div className="card shadow">

        {/* Header */}
        <div className="card-header">
          <h4 className="mb-0">🤖 Smart City Assistant</h4>
          <small>
            Ask me about complaints, weather, and city services.
          </small>
        </div>

        {/* Chat messages */}
        <div
          className="card-body"
          style={{
            height: "450px",
            overflowY: "auto",
          }}
        >
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`d-flex mb-3 ${
                msg.sender === "user"
                  ? "justify-content-end"
                  : "justify-content-start"
              }`}
            >
              <div
                className={`p-3 rounded ${
                  msg.sender === "user"
                    ? "bg-primary text-white"
                    : "bg-light"
                }`}
                style={{ maxWidth: "70%" }}
              >
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="card-footer">
          <div className="input-group">

            <input
              type="text"
              className="form-control"
              placeholder="Ask something..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSend();
                }
              }}
            />

            <button
              className="btn btn-primary"
              onClick={handleSend}
            >
              Send
            </button>

          </div>
        </div>

      </div>
    </div>
  );
}

export default Assistant;