import React from 'react';
import { Message } from '@/types/Message';
import { InitialSuggestions } from './InitialSuggestions';
import { AppConfig } from '@/config/app.config';

interface MessageListProps {
  messages: Message[];
  isTyping: boolean;
  handleButtonClick: (buttonId: string, buttonLabel: string) => void;
}

const MessageList = ({ messages, isTyping, handleButtonClick }: MessageListProps) => {
  const showInitialSuggestions = messages.length === 1 && messages[0].sender === 'bot';

  return (
    <div className="flex-1 overflow-y-auto bg-whatsapp-bg px-4 py-4">
      {messages.map((message) => (
        <div key={message.id} className={`mb-2 flex flex-col ${message.sender === 'user' ? 'items-end' : 'items-start'}`}>
          <div className={`max-w-[75%] rounded-xl px-4 py-2 ${message.sender === 'user' ? 'bg-whatsapp-userMessage text-white' : 'bg-whatsapp-message text-whatsapp-text'}`}>
            {message.text}
            {message.image && (
              <img src={message.image} alt="Mensagem" className="mt-2 max-h-48 rounded-md" />
            )}
            {message.buttons && (
              <div className="mt-2 flex flex-wrap gap-2">
                {message.buttons.map(button => (
                  <button
                    key={button.id}
                    onClick={() => handleButtonClick(button.id, button.label)}
                    className="bg-whatsapp-button text-white px-4 py-2 rounded-md text-sm"
                  >
                    {button.label}
                  </button>
                ))}
              </div>
            )}
            <div className="text-xs mt-1 text-gray-400">{message.timestamp.toLocaleTimeString()}</div>
          </div>
        </div>
      ))}
      
      {showInitialSuggestions && (
        <InitialSuggestions
          suggestions={AppConfig.chat.initialSuggestions}
          onSuggestionClick={(suggestion) => {
            const buttonId = suggestion.toLowerCase().replace(/\s+/g, '-');
            handleButtonClick(buttonId, suggestion);
          }}
        />
      )}
      
      {isTyping && (
        <div className="mb-2 flex items-start">
          <div className="max-w-[75%] rounded-xl px-4 py-2 bg-whatsapp-message text-whatsapp-text">
            <div className="typing">
              <div className="dot"></div>
              <div className="dot"></div>
              <div className="dot"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageList;
