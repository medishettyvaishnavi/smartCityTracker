import { useEffect, useRef, useState } from "react";
import { FiMessageSquare, FiMic, FiMicOff, FiSend, FiX } from "react-icons/fi";
import assistantService from "../services/assistantService";
import { cleanAssistantText } from "../services/assistantText";
import { getAssistantLanguage } from "../services/assistantLanguages";
import { useLanguage } from "../context/LanguageContext";
import "./AssistantWidget.css";

function AssistantWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const { language, t } = useLanguage();
  const [isSending, setIsSending] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState("");
  const recognitionRef = useRef(null);
  const [messages, setMessages] = useState([
    {
      sender: "assistant",
      text: "Hello! How can I help with your city services today?",
    },
  ]);

  useEffect(
    () => () => {
      recognitionRef.current?.stop();
      window.speechSynthesis?.cancel();
    },
    []
  );

  const speakText = (text) => {
    if (!("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = getAssistantLanguage(language).voice;
    utterance.rate = 1;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  };

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

  const handleSend = async (event) => {
    event.preventDefault();
    const currentMessage = message.trim();
    if (!currentMessage || isSending) return;

    const userMessage = { sender: "user", text: currentMessage };
    const history = messages.map((chatMessage) => ({
      role: chatMessage.sender === "user" ? "user" : "assistant",
      content: chatMessage.text,
    }));

    setMessages((previousMessages) => [...previousMessages, userMessage]);
    setMessage("");
    setIsSending(true);

    try {
      const data = await assistantService.query(currentMessage, history, language);
      const cleanAnswer = cleanAssistantText(data.answer);
      setMessages((previousMessages) => [
        ...previousMessages,
        { sender: "assistant", text: cleanAnswer },
      ]);
      speakText(cleanAnswer);
    } catch (error) {
      const errorMessage = cleanAssistantText(
        error.response?.data?.message || "Sorry, something went wrong."
      );
      setMessages((previousMessages) => [
        ...previousMessages,
        {
          sender: "assistant",
          text: errorMessage,
        },
      ]);
      speakText(errorMessage);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="assistant-widget">
      {isOpen && (
        <section className="assistant-widget-window" aria-label="AI assistant chat">
          <header className="assistant-widget-header">
            <div>
              <p className="assistant-widget-eyebrow">SMART CITY</p>
              <h2>{t("assistant")}</h2>
            </div>
            <button
              type="button"
              className="assistant-widget-close"
              onClick={() => setIsOpen(false)}
              aria-label="Close AI assistant"
              title="Close"
            >
              <FiX aria-hidden="true" />
            </button>
          </header>

          <div className="assistant-widget-messages" aria-live="polite">
            {messages.map((chatMessage, index) => (
              <div
                key={`${chatMessage.sender}-${index}`}
                className={`assistant-widget-message assistant-widget-message-${chatMessage.sender}`}
              >
                {chatMessage.text}
              </div>
            ))}
            {isSending && <div className="assistant-widget-typing">Thinking...</div>}
          </div>

          <form className="assistant-widget-form" onSubmit={handleSend}>
            <input
              type="text"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Ask about city services..."
              aria-label="Message for AI assistant"
              disabled={isSending}
            />
            <button
              type="button"
              className={`assistant-widget-mic ${isListening ? "is-listening" : ""}`}
              onClick={handleVoiceInput}
              aria-label={isListening ? "Stop voice input" : "Speak your message"}
              title={isListening ? "Stop voice input" : "Speak your message"}
              disabled={isSending}
            >
              {isListening ? <FiMicOff aria-hidden="true" /> : <FiMic aria-hidden="true" />}
            </button>
            <button
              type="submit"
              className="assistant-widget-send"
              aria-label="Send message"
              title="Send message"
              disabled={!message.trim() || isSending}
            >
              <FiSend aria-hidden="true" />
            </button>
          </form>
          {voiceError && <p className="assistant-widget-voice-error">{voiceError}</p>}
        </section>
      )}

      <button
        type="button"
        className={`assistant-widget-launcher ${isOpen ? "is-open" : ""}`}
        onClick={() => setIsOpen((open) => !open)}
        aria-label={isOpen ? "Close AI assistant" : "Open AI assistant"}
        aria-expanded={isOpen}
      >
        {isOpen ? <FiX aria-hidden="true" /> : <FiMessageSquare aria-hidden="true" />}
        <span>{isOpen ? t("close") : t("askAi")}</span>
      </button>
    </div>
  );
}

export default AssistantWidget;