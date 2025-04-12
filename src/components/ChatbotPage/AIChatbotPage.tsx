import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Maximize2, Minimize2, Paperclip, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface QuickSuggestion {
  id: string;
  text: string;
}

interface AIChatbotProps {
  patientId?: number;
  onClose?: () => void;
}

const AIChatbot: React.FC<AIChatbotProps> = ({ patientId, onClose }) => {
  const navigate = useNavigate();

  // State for popup toggle (homepage only)
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Existing state
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: `Hello${patientId ? `, Patient #${patientId}` : ''}! I\'m your hospital virtual assistant. How can I help you today? You can describe any symptoms you\'re experiencing, ask about our services, or request a human representative.`,
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [quickSuggestions, setQuickSuggestions] = useState<QuickSuggestion[]>([
    { id: '1', text: 'I have a headache' },
    { id: '2', text: 'Stomach pain and nausea' },
    { id: '3', text: 'Book an appointment' },
    { id: '4', text: 'Speak to a human representative' },
  ]);
  const [reportedSymptoms, setReportedSymptoms] = useState<string[]>([]);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  useEffect(() => scrollToBottom(), [messages]);

  // Send message
  const handleSendMessage = () => {
    if (!message.trim()) return;
    const userMessage: Message = { id: Date.now().toString(), content: message, sender: 'user', timestamp: new Date() };
    setMessages((prev) => [...prev, userMessage]);
    setMessage('');
    setIsTyping(true);
    analyzeForSymptoms(message);
    simulateBotResponse(message);
  };

  // Symptom analysis
  const analyzeForSymptoms = (userMessage: string) => {
    const lowercaseMessage = userMessage.toLowerCase();
    const symptoms = [
      'headache', 'migraine', 'dizziness', 'cough', 'shortness of breath', 'nausea', 'vomiting', 'diarrhea', 
      'stomach pain', 'chest pain', 'fever', 'rash', 'itching',
    ];
    const foundSymptoms = symptoms.filter((symptom) => lowercaseMessage.includes(symptom));
    if (foundSymptoms.length) {
      setReportedSymptoms((prev) => [...new Set([...prev, ...foundSymptoms])]);
    }
  };

  // Redirect to human
  const handleRedirectToHuman = () => {
    const redirectMessage: Message = {
      id: Date.now().toString(),
      content: 'Connecting you with a healthcare professional. Please wait...',
      sender: 'bot',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, redirectMessage]);
    setTimeout(() => {
      const followUp: Message = {
        id: Date.now().toString(),
        content: 'You’re being redirected to Dr. Johnson’s virtual consultation room. Estimated wait: 2-3 minutes.',
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, followUp]);
    }, 2000);
  };

  // Bot response simulation
  const simulateBotResponse = (userMessage: string) => {
    setTimeout(() => {
      const lowercaseMessage = userMessage.toLowerCase();
      let botResponse = '';
      if (lowercaseMessage.includes('human') || lowercaseMessage.includes('representative')) {
        botResponse = 'Would you like me to connect you with a human representative now?';
        setQuickSuggestions([
          { id: '1', text: 'Yes, connect me please' },
          { id: '2', text: 'No, continue with chatbot' },
          { id: '3', text: 'Schedule a call later' },
          { id: '4', text: 'Urgent assistance' },
        ]);
      } else if (lowercaseMessage.includes('yes, connect') || (lowercaseMessage.includes('yes') && messages[messages.length - 1].content.includes('human representative'))) {
        handleRedirectToHuman();
        return;
      } else if (lowercaseMessage.includes('severe chest pain') || lowercaseMessage.includes('difficulty breathing')) {
        botResponse = '⚠️ EMERGENCY: Call 911 or visit the nearest ER immediately.';
      } else if (lowercaseMessage.includes('headache')) {
        botResponse = 'For your headache, try rest, hydration, and OTC pain relievers. Seek medical attention if severe or persistent. More details?';
        setQuickSuggestions([
          { id: '1', text: 'My headache is severe' },
          { id: '2', text: 'I also have fever' },
          { id: '3', text: 'What medications help?' },
          { id: '4', text: 'Connect me with a doctor' },
        ]);
      } else if (lowercaseMessage.includes('appointment')) {
        botResponse = 'To book an appointment, go to the Appointments section or I can help now. Proceed?';
      } else if (reportedSymptoms.length >= 2) {
        botResponse = `You’ve mentioned: ${reportedSymptoms.join(', ')}. A doctor might help evaluate this. Connect now?`;
        setQuickSuggestions([
          { id: '1', text: 'Yes, connect me with a doctor' },
          { id: '2', text: 'More about these symptoms' },
          { id: '3', text: 'Possible causes?' },
          { id: '4', text: 'Just general advice' },
        ]);
      } else {
        botResponse = 'Please describe your symptoms or ask about hospital services.';
      }
      setMessages((prev) => [...prev, { id: Date.now().toString(), content: botResponse, sender: 'bot', timestamp: new Date() }]);
      setIsTyping(false);
    }, 1500);
  };

  // Suggestion click
  const handleSuggestionClick = (text: string) => {
    setMessage(text);
    setTimeout(() => document.getElementById('send-button')?.click(), 100);
  };

  // File handling
  const handleAttachFile = () => fileInputRef.current?.click();
  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const userMessage: Message = { id: Date.now().toString(), content: `Uploading: ${file.name}`, sender: 'user', timestamp: new Date() };
      setMessages((prev) => [...prev, userMessage]);
      setTimeout(() => {
        setMessages((prev) => [...prev, {
          id: Date.now().toString(),
          content: `Received "${file.name}". A professional will review it. Discuss with a doctor now?`,
          sender: 'bot',
          timestamp: new Date(),
        }]);
        setQuickSuggestions([
          { id: '1', text: 'Yes, connect me with a doctor' },
          { id: '2', text: 'No, I’ll wait' },
          { id: '3', text: 'Is this format okay?' },
          { id: '4', text: 'Send another file' },
        ]);
      }, 1000);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Time formatting
  const formatTime = (date: Date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Toggle popup (homepage only)
  const toggleChat = () => setIsChatOpen(!isChatOpen);

  // Chat interface JSX
  const chatInterface = (
    <div className={`flex flex-col h-full w-full bg-white rounded-lg shadow-xl ${isMinimized ? 'h-16' : ''}`}>
      <div className="flex justify-between items-center p-3 bg-blue-600 text-white rounded-t-lg">
        <div className="flex items-center">
          <MessageSquare size={20} className="mr-2" />
          <h3 className="font-medium">Health Assistant</h3>
        </div>
        <div className="flex items-center space-x-2">
          <button onClick={() => handleSuggestionClick('Speak to a human representative')} className="text-white hover:bg-blue-700 p-1 rounded" title="Speak to a human">
            <UserPlus size={16} />
          </button>
          <button onClick={() => setIsMinimized(!isMinimized)} className="text-white hover:bg-blue-700 p-1 rounded">
            {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
          </button>
          <button onClick={onClose || toggleChat} className="text-white hover:bg-blue-700 p-1 rounded">
            <X size={16} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          <div className="flex-1 p-4 overflow-y-auto">
            {messages.map((msg) => (
              <div key={msg.id} className={`mb-4 flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-lg ${msg.sender === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-gray-100 text-gray-800 rounded-tl-none'}`}>
                  <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                  <span className={`text-xs mt-1 block text-right ${msg.sender === 'user' ? 'text-blue-200' : 'text-gray-500'}`}>
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start mb-4">
                <div className="bg-gray-100 p-3 rounded-lg rounded-tl-none">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="px-4 pb-2">
            <div className="flex flex-wrap gap-2">
              {quickSuggestions.map((suggestion) => (
                <button key={suggestion.id} onClick={() => handleSuggestionClick(suggestion.text)} className="text-xs px-3 py-1 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 whitespace-nowrap">
                  {suggestion.text}
                </button>
              ))}
            </div>
          </div>

          <div className="p-3 border-t">
            <div className="flex items-center">
              <button onClick={handleAttachFile} className="p-2 text-gray-500 hover:text-blue-600" title="Attach files">
                <Paperclip size={18} />
              </button>
              <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileSelected} accept="image/*,.pdf,.doc,.docx" />
              <input
                type="text"
                placeholder="Describe your symptoms or ask a question..."
                className="flex-1 py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <button id="send-button" onClick={handleSendMessage} className="ml-2 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700" disabled={!message.trim()}>
                <Send size={18} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );

  return (
    <div>
      {/* Homepage: Floating Button and Popup */}
      {!onClose && (
        <>
          {!isChatOpen && (
            <button
              onClick={toggleChat}
              className="fixed bottom-4 right-4 bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 transition-all z-50"
              aria-label="Open chatbot"
            >
              <MessageSquare size={24} />
            </button>
          )}
          {isChatOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl sm:max-w-3xl md:max-w-4xl h-[80vh] sm:h-[85vh] flex flex-col">
                {chatInterface}
              </div>
            </div>
          )}
        </>
      )}

      {/* Dashboard: Direct Interface (only render when explicitly opened) */}
      {onClose && chatInterface}
    </div>
  );
};

export default AIChatbot;