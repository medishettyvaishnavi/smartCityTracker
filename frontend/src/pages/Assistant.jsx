import { useEffect, useRef, useState } from "react";
import assistantService from "../services/assistantService";
import "./Assistant.css";

function Assistant() {
  const [message, setMessage] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState("");
  const recognitionRef = useRef(null);
  const [messages, setMessages] = useState([
    {
      sender: "assistant",
      text: "Hello! I'm your Smart City Assistant. How can I help you?",
    },
  ]);

  const speakText = (text) => {
    if (!("speechSynthesis" in window)) {
      alert("Text-to-speech is not supported in this browser.");
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-IN";
    utterance.rate = 1;
    utterance.pitch = 1;

    window.speechSynthesis.speak(utterance);
  };

  useEffect(
    () => () => {
      recognitionRef.current?.stop();
      window.speechSynthesis?.cancel();
    },
    []
  );

  const handleVoiceInput = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceError("Voice input is not supported in this browser.");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setVoiceError("");
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join(" ");
      setMessage((currentMessage) =>
        `${currentMessage}${currentMessage ? " " : ""}${transcript}`
      );
    };

    recognition.onerror = (event) => {
      setIsListening(false);
      setVoiceError(
        event.error === "not-allowed"
          ? "Microphone permission was denied."
          : "Voice input could not be started. Please try again."
      );
    };

    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

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
    const history = messages.map((chatMessage) => ({
      role: chatMessage.sender === "user" ? "user" : "assistant",
      content: chatMessage.text,
    }));
    const data = await assistantService.query(currentMessage, history);

    const assistantMessage = {
      sender: "assistant",
      text: data.answer,
    };

    setMessages((prev) => [
      ...prev,
      assistantMessage,
    ]);
    speakText(data.answer);
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
          {voiceError && <div className="assistant-voice-error">{voiceError}</div>}
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
              type="button"
              className={`btn assistant-mic-button ${isListening ? "is-listening" : ""}`}
              onClick={handleVoiceInput}
              aria-label={isListening ? "Stop voice input" : "Start voice input"}
              title={isListening ? "Stop voice input" : "Speak your message"}
            >
              {isListening ? "Stop" : "Mic"}
            </button>

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