"use client";

import { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Sparkles, BarChart3 } from 'lucide-react';
import VoiceInput from './VoiceInput';
import MessageBubble from './MessageBubble';

export default function ChatInterface() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: '🙏 नमस्ते! मैं आपका AI Business Intelligence Assistant हूँ।\n\n📊 आप मुझसे पूछ सकते हैं:\n• Sales और Revenue की जानकारी\n• Inventory और Stock की स्थिति  \n• Customer Analysis\n• Product Performance\n\nकृपया अपना सवाल बताएं! 🎤',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const sendMessage = async (message) => {
    if (!message.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/claude', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: data.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);

    } catch (error) {
      console.error('Error:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: '😔 माफ़ करें, कुछ तकनीकी समस्या है। कृपया दोबारा कोशिश करें।',
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceResult = (transcript) => {
    setInputText(transcript);
    sendMessage(transcript);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(inputText);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-2 md:p-4">
      <div className="w-full max-w-4xl h-[95vh] flex flex-col glass animate-fade-in">
        
        {/* Beautiful Header */}
        <div className="header-gradient text-white p-6 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Sparkles size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                🎤 Voice BI Assistant
              </h1>
              <p className="text-white/80 text-sm">
                आपका स्मार्ट Business Intelligence सहायक
              </p>
            </div>
            <div className="ml-auto">
              <BarChart3 size={24} className="text-white/60" />
            </div>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-transparent to-white/5">
          {messages.map((message, index) => (
            <div key={message.id} className="animate-fade-in" style={{animationDelay: `${index * 0.1}s`}}>
              <MessageBubble message={message} />
            </div>
          ))}
          
          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex justify-start animate-fade-in">
              <div className="message-bot">
                <div className="typing-indicator">
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                </div>
                <div className="text-xs text-gray-500 mt-2">AI विश्लेषण कर रहा है...</div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-6 bg-white/10 backdrop-blur-sm border-t border-white/20 rounded-b-2xl">
          {/* Quick Action Buttons */}
          <div className="mb-4 flex flex-wrap gap-2">
            <button 
              onClick={() => sendMessage("इस महीने कितनी sales हुई?")}
              className="quick-action"
            >
              📈 Monthly Sales
            </button>
            <button 
              onClick={() => sendMessage("current stock कितना है?")}
              className="quick-action"
            >
              📦 Stock Status
            </button>
            <button 
              onClick={() => sendMessage("top customer कौन है?")}
              className="quick-action"
            >
              👑 Top Customer
            </button>
            <button 
              onClick={() => sendMessage("कम stock वाले products?")}
              className="quick-action"
            >
              ⚠️ Low Stock
            </button>
          </div>

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="flex gap-3 items-end">
            <div className="flex-1">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="यहाँ अपना सवाल टाइप करें या 🎤 दबाकर बोलें..."
                className="input-modern"
                disabled={isLoading}
              />
            </div>
            
            <VoiceInput 
              onResult={handleVoiceResult}
              isActive={isVoiceMode}
              onToggle={setIsVoiceMode}
            />
            
            <button
              type="submit"
              disabled={isLoading || !inputText.trim()}
              className="btn-primary flex items-center gap-2"
            >
              {isLoading ? (
                <div className="loading-spinner"></div>
              ) : (
                <Send size={18} />
              )}
              Send
            </button>
          </form>

          {/* Status Indicator */}
          <div className="mt-3 text-center">
            <div className="text-xs text-white/60">
              {isVoiceMode ? (
                <span className="flex items-center justify-center gap-2">
                  🎤 <span className="animate-pulse">सुन रहा है...</span>
                </span>
              ) : (
                <span>Voice Assistant Ready • Hindi & Marathi Supported</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}