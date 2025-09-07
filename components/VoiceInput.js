"use client";

import { useState, useRef } from 'react';
import { Mic, MicOff, Volume2 } from 'lucide-react';

export default function VoiceInput({ onResult, isActive, onToggle }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef(null);

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('🚫 Voice recognition इस browser में supported नहीं है। कृपया Chrome का इस्तेमाल करें।');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'hi-IN'; // Hindi by default
    
    recognition.onstart = () => {
      setIsListening(true);
      onToggle(true);
    };

    recognition.onresult = (event) => {
      const result = event.results[0][0].transcript;
      setTranscript(result);
      onResult(result);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      onToggle(false);
      
      // User-friendly error messages
      if (event.error === 'no-speech') {
        alert('🔇 कोई आवाज़ नहीं सुनाई दी। कृपया दोबारा कोशिश करें।');
      } else if (event.error === 'network') {
        alert('🌐 Network की समस्या है। Internet connection check करें।');
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      onToggle(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  return (
    <button
      type="button"
      onClick={isListening ? stopListening : startListening}
      className={`btn-voice ${isListening ? 'active' : 'inactive'} relative`}
      title={isListening ? 'Recording बंद करें' : 'Voice input शुरू करें'}
    >
      {isListening ? (
        <>
          <MicOff size={20} />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-bounce-gentle"></div>
        </>
      ) : (
        <Mic size={20} />
      )}
      
      {/* Tooltip */}
      <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
        {isListening ? 'Stop Recording' : 'Start Voice Input'}
      </div>
    </button>
  );
}