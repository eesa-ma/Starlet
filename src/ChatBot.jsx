import React, { useState, useEffect, useRef } from 'react';
import './ChatBot.css';

// --- KNOWLEDGE BASE FOR STELLA ---
const dataset = [
  {
    keywords: ["what is", "about", "starlet", "event"],
    response: "Starlet 5.0 is the ultimate innovation marathon for women where ideas meet execution! It's a safe place for girls to connect, code, co-create, and cultivate confidence."
  },
  {
    keywords: ["theme", "topic", "build", "create", "focus"],
    response: "The Starlet 5.0 Theme is building technology that empowers people with disabilities, improves accessibility, and creates a more inclusive world. You can focus on mobility, visual/auditory aids, neurodiversity, or inclusive education."
  },
  {
    keywords: ["who can", "participate", "eligibility", "join", "team", "solo"],
    response: "The event is open to all women and non-binary students and innovators. You can register as a solo participant (we'll team you up) or form a team of 3 to 4 members."
  },
  {
    keywords: ["fee", "cost", "pay", "register", "price"],
    response: "The registration fee is ₹150 per head. Please ensure you attach the fee payment screenshot during registration."
  },
  {
    keywords: ["prize", "win", "reward", "money"],
    response: "We have a total prize pool of over ₹40,000! This includes awards for the top 3 teams, a special 'Best Innovation' prize, 'Best Hardware', and 'Accessibility Prize'."
  },
  {
    keywords: ["when", "date", "time", "roadmap", "timeline", "schedule"],
    response: "Starlet 5.0 takes place on 11th July 2026 (Saturday) and 12th July 2026 (Sunday) from 8:00 AM to 5:00 PM."
  },
  {
    keywords: ["bring", "laptop", "require", "need"],
    response: "Please bring your own laptop and charger. We'll provide the internet, food, mentorship, and a great environment!"
  },
  {
    keywords: ["mentor", "help", "guide", "support"],
    response: "Yes! Industry experts and tech mentors will be available throughout the event to guide you and your team."
  },
  {
    keywords: ["hello", "hi", "hey", "greetings"],
    response: "Hi there! I'm Stella, your personalized Starlet assistant. How can I help you today?"
  },
  {
    keywords: ["bye", "goodbye", "see you"],
    response: "Goodbye! Can't wait to see you at Starlet 5.0!"
  }
];

const getBotResponse = (input) => {
  const lowerInput = input.toLowerCase();
  
  // Find the best match based on keyword overlap
  let bestMatch = null;
  let maxScore = 0;

  for (const item of dataset) {
    let score = 0;
    for (const keyword of item.keywords) {
      if (lowerInput.includes(keyword)) {
        score++;
      }
    }
    if (score > maxScore) {
      maxScore = score;
      bestMatch = item;
    }
  }

  if (bestMatch && maxScore > 0) {
    return bestMatch.response;
  }

  // Fallback
  return "I'm still learning! But I'd be happy to answer questions about Starlet's theme, rules, prizes, dates, or registration fee. Try asking 'What is the theme?'";
};

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: "Hi! I'm Stella, your personalized Starlet assistant. How can I help you?" }
  ]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userText = inputValue.trim();
    setMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setInputValue("");

    // Simulate thinking delay
    setTimeout(() => {
      const botResponse = getBotResponse(userText);
      setMessages(prev => [...prev, { sender: 'bot', text: botResponse }]);
    }, 600);
  };

  const handleSuggestionClick = (text) => {
    setMessages(prev => [...prev, { sender: 'user', text }]);
    setTimeout(() => {
      const botResponse = getBotResponse(text);
      setMessages(prev => [...prev, { sender: 'bot', text: botResponse }]);
    }, 600);
  };

  return (
    <div className="chatbot-container">
      {isOpen ? (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <div className="chatbot-header-title">
              <span>✨</span>
              <div>
                <span>Stella</span>
                <div className="chatbot-header-subtitle">Starlet Assistant</div>
              </div>
            </div>
            <button className="chatbot-close-btn" onClick={toggleChat}>&times;</button>
          </div>
          
          <div className="chatbot-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`chatbot-message ${msg.sender}`}>
                {msg.text}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {messages.length < 3 && (
            <div style={{ padding: '0 20px 10px' }}>
              <div className="chatbot-suggestions">
                <button onClick={() => handleSuggestionClick("What is Starlet?")} className="chatbot-suggestion-btn">What is Starlet?</button>
                <button onClick={() => handleSuggestionClick("Tell me about the prizes")} className="chatbot-suggestion-btn">Prizes 🏆</button>
                <button onClick={() => handleSuggestionClick("When is the event?")} className="chatbot-suggestion-btn">Dates 📅</button>
              </div>
            </div>
          )}

          <form className="chatbot-input-area" onSubmit={handleSend}>
            <input
              type="text"
              className="chatbot-input"
              placeholder="Ask Stella..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <button type="submit" className="chatbot-send-btn" disabled={!inputValue.trim()}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </form>
        </div>
      ) : (
        <button className="chatbot-toggle-btn" onClick={toggleChat} aria-label="Open Chat">
          💬
        </button>
      )}
    </div>
  );
};

export default ChatBot;
