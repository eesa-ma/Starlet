import React, { useState, useEffect, useRef } from 'react';
import { FaCommentDots, FaEllipsisV } from 'react-icons/fa';
import './ChatBot.css';

// --- KNOWLEDGE BASE FOR STELLA ---
const dataset = [
  {
    keywords: ["what is", "about starlet", "purpose", "mission", "vision"],
    response: "Starlet 5.0 is the ultimate innovation marathon for women where ideas meet execution! It's a safe place for girls to connect, code, co-create, and cultivate confidence."
  },
  {
    keywords: ["prize", "prizes", "award", "awards", "win", "winning"],
    response: "We have a total prize pool of over ₹40,000, including awards for the top 3 teams and a special 'Best Innovation' prize."
  },
  {
    keywords: ["registration fee", "cost", "price", "pay", "ticket", "fee", "free"],
    response: "Registration for Starlet is completely free! We believe in making innovation accessible to everyone."
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
    keywords: ["hello", "hi", "hey", "greetings", "hii", "hii", "hii"],
    response: "Hi there! I'm Stella, your Starlet ssistant. How can I help you today?"
  },
  {
    keywords: ["bye", "goodbye", "see you"],
    response: "Goodbye! Can't wait to see you at Starlet 5.0!"
  },
  {
    keywords: ["starlet 6.0", "starlet 6", "next starlet", "upcoming starlet", "about starlet 6.0"],
    response: "Coming soon! Stay tuned for more updates about Starlet 6.0."
  },
  {
    keywords: ["submit idea", "idea submission", "pitch", "propose"],
    response: "To submit your idea, log into your profile and navigate to the 'Submissions' tab. You'll find a form to describe your idea, problem statement, and proposed solution."
  },
  {
    keywords: ["submit project", "project submission", "upload project", "github"],
    response: "When you're ready to submit your final project, go to the 'Submissions' dashboard. Make sure to include your GitHub repository link, a demo video, and a brief description of your hack!"
  },
  {
    keywords: ["certificate", "download certificate", "participation certificate", "winner certificate"],
    response: "Certificates will be available for download from your user profile after the hackathon concludes and evaluations are complete. We will notify you when they are ready!"
  },
  {
    keywords: ["blog", "blogs", "article", "post", "read"],
    response: "Our blog section is a community space where participants and mentors share tech insights, hackathon experiences, and tutorials. Feel free to read through them or publish your own tech journey!"
  },
  {
    keywords: ["create team", "form team", "make team"],
    response: "You can create a team from your dashboard. Click on 'Create Team', give your team an awesome name, and you will get a unique Team ID to share with your friends."
  },
  {
    keywords: ["add member", "join team", "team member", "invite"],
    response: "To join a team, get the Team ID from the creator and enter it in the 'Join Team' section. If you created a team, share your Team ID so others can join you (up to 4 members max)!"
  },
  {
    keywords: ["select theme", "choose theme", "pick track", "select track", "choose track"],
    response: "You can select your project theme/track in your team settings before the hacking begins. Choose the one that best fits your assistive technology solution!"
  },
  {
    keywords: ["change track", "change theme", "switch track", "switch theme", "update track", "update theme"],
    response: "If you want to change your track after selecting one, simply provide your new track as the idea submission title!"
  },
  {
    keywords: ["edit idea", "edit submission", "change idea", "update idea", "update project", "change project", "edit project", "modify project", "change submission"],
    response: "If you need to edit your idea submission, update your project details, or change any fields after submitting, please reach out to our mentors or admins using the 'Raise Hand' button for assistance!"
  },
  {
    keywords: ["judge", "criteria", "evaluation", "score", "judges"],
    response: "Projects are evaluated based on innovation, impact, technical complexity, and adherence to the theme. Check out our 'Judges & Prizes' section to learn more!"
  },
  {
    keywords: ["rules", "plagiarism", "code of conduct", "guidelines"],
    response: "Fair play is the heart of Starlet! All code must be written during the hackathon, and teams must follow our inclusive code of conduct. Check the 'Rules of the Galaxy' section for details."
  },
  {
    keywords: ["food", "meals", "sleep", "rest", "accommodation"],
    response: "Yes! We will provide meals, snacks, and a dedicated resting area so you can stay energized throughout the marathon."
  },
  {
    keywords: ["forgot password", "login", "cant access", "reset password"],
    response: "If you forgot your password, please contact the organizers directly with your registered email address for verification."
  },
  {
    keywords: ["events", "activities", "music", "fun", "highlights"],
    response: "We have amazing side events planned including music performances, a sharing circle, and even Kaleripayettu! Check 'Highlights & Special Events' on the timeline."
  },
  {
    keywords: ["swag", "goodies", "freebies", "stickers"],
    response: "Absolutely! All participants will receive exclusive Starlet 5.0 swag and goodies at the event."
  },
  {
    keywords: ["accessibility", "contrast", "font size", "dyslexia", "tools"],
    response: "Our website features a built-in accessibility widget! Click the accessibility icon to adjust contrast, font size, enable dyslexia-friendly fonts, or use the reading mask."
  },
  {
    keywords: ["report issue", "problem", "bug", "report", "issue", "broken", "help"],
    response: "If you encounter any technical issues or bugs, you can easily report them! Just head over to your participant profile and click the 'Report Issue' option."
  },
  {
    keywords: ["call mentor", "request mentor", "need mentor", "mentor help", "stuck"],
    response: "If your team is stuck or needs guidance, you can call a mentor! Look for the 'Request Mentor' option on your dashboard or ask an organizer during the hacking period."
  },
  {
    keywords: [
      "ok", "okay", "okayy", "oky", "okkk", "k", "kk", 
      "cool", "ahh", "aah", "ah", "oh", "wow", "got it", 
      "thanks", "thank you", "nice", "awesome", "great", "good", 
      "sure", "alright", "perfect", "amazing", "understood", 
      "makes sense", "sweet", "fantastic", "brilliant", "wonderful", 
      "yep", "yeah", "yes", "coolio", "thx", "ty", "cheers", "Aa", "Aah", "Ahh", "Haa","AHH", "Ahhh", "AHHH", "ahhh", "AH"
    ],
    response: "Glad I could help! Is there anything else you'd like to know about Starlet?"
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
      // Use word boundaries to avoid false positives (e.g. "ok" matching "book")
      // Escape special characters in keyword just in case
      const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b${escapedKeyword}\\b`, 'i');
      if (regex.test(lowerInput)) {
        // Give higher weight to multi-word/longer keywords
        score += keyword.split(' ').length;
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

const ChatBot = ({ onCallMentor, onContactUs }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: "Hi! I'm Stella, your Starlet assistant. How can I help you?" }
  ]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef(null);
  const menuRef = useRef(null);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
      if (isOpen && chatContainerRef.current && !chatContainerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        if (isOpen) setIsOpen(false);
      }
    };

    if (menuOpen || isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEsc);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [menuOpen, isOpen]);

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
    <div className="chatbot-container" ref={chatContainerRef}>
      {isOpen ? (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <div className="chatbot-header-title">
              <img src="brand/favicon.png" alt="favicon" width={25} height={25} />
              <div>
                <span>Stella</span>
                <div className="chatbot-header-subtitle">Starlet Assistant</div>
              </div>
            </div>
            <div className="chatbot-header-actions" style={{ position: 'relative' }} ref={menuRef}>
              <button className="chatbot-menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
                <FaEllipsisV />
              </button>
              {menuOpen && (
                <div className="chatbot-dropdown-menu">
                  <div className="chatbot-dropdown-item" onClick={() => { setMenuOpen(false); if (onCallMentor) onCallMentor(); }}>Call a mentor</div>
                  <div className="chatbot-dropdown-item" onClick={() => { setMenuOpen(false); if (onContactUs) onContactUs(); }}>Contact us</div>
                </div>
              )}
              <button className="chatbot-close-btn" onClick={toggleChat}>&times;</button>
            </div>
          </div>
          
          <div className="chatbot-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`chatbot-message ${msg.sender}`}>
                {msg.text}
              </div>
            ))}
            
            
            
            <div ref={messagesEndRef} />
          </div>

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
          <FaCommentDots size={28} />
        </button>
      )}
    </div>
  );
};

export default ChatBot;
