"use client";

import { format } from 'date-fns';
import { User, Bot, CheckCircle, AlertCircle } from 'lucide-react';

export default function MessageBubble({ message }) {
  const isUser = message.type === 'user';
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-slide-up`}>
      <div className={`flex items-end gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        
        {/* Avatar */}
        <div className="flex-shrink-0 mb-1">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${
            isUser 
              ? 'bg-gradient-to-r from-blue-500 to-purple-600' 
              : 'bg-gradient-to-r from-gray-600 to-gray-700'
          }`}>
            {isUser ? (
              <User size={18} className="text-white" />
            ) : (
              <Bot size={18} className="text-white" />
            )}
          </div>
        </div>
        
        {/* Message Content */}
        <div className={`relative ${
          isUser ? 'message-user' : message.isError ? 'message-error' : 'message-bot'
        }`}>
          
          {/* Message Text */}
          <div className="whitespace-pre-wrap leading-relaxed">
            {message.content}
          </div>
          
          {/* Timestamp & Status */}
          <div className={`flex items-center gap-1 mt-2 text-xs ${
            isUser ? 'text-white/70' : 'text-gray-500'
          }`}>
            <span>{format(message.timestamp, 'HH:mm')}</span>
            {isUser && (
              <CheckCircle size={12} className="text-white/70" />
            )}
            {message.isError && (
              <AlertCircle size={12} className="text-red-600" />
            )}
          </div>
          
          {/* Message Type Badge */}
          {message.queryType && (
            <div className="absolute -top-2 -right-2">
              <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full shadow-lg">
                {message.queryType}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}