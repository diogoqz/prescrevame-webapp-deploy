
import React, { useRef, useEffect } from 'react';
import { Message } from '@/types/Message';

interface MessageListProps {
  messages: Message[];
  isTyping: boolean;
  handleButtonClick: (buttonId: string, buttonLabel: string) => Promise<void>;
}

const MessageList: React.FC<MessageListProps> = ({ messages, isTyping, handleButtonClick }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  return (
    <div 
      className="flex-1 p-4 overflow-y-auto chat-scrollbar"
      style={{ 
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='64' height='64' viewBox='0 0 64 64' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M8 16c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8zm0-2c3.314 0 6-2.686 6-6s-2.686-6-6-6-6 2.686-6 6 2.686 6 6 6zm33.414-6l5.95-5.95L45.95.636 40 6.586 34.05.636 32.636 2.05 38.586 8l-5.95 5.95 1.414 1.414L40 9.414l5.95 5.95 1.414-1.414L41.414 8zM40 48c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8zm0-2c3.314 0 6-2.686 6-6s-2.686-6-6-6-6 2.686-6 6 2.686 6 6 6zM9.414 40l5.95-5.95-1.414-1.414L8 38.586l-5.95-5.95L.636 34.05 6.586 40l-5.95 5.95 1.414 1.414L8 41.414l5.95 5.95 1.414-1.414L9.414 40z' fill='%23111B21' fill-opacity='0.04' fill-rule='evenodd'/%3E%3C/svg%3E")`,
        backgroundSize: "200px 200px"
      }}
    >
      {messages.map((message) => (
        <div 
          key={message.id}
          className={`flex mb-4 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div 
            className={`max-w-[80%] rounded-lg px-3 py-2 animate-message-appear
              ${message.sender === 'user' 
                ? 'bg-whatsapp-bubbleSent chat-bubble-sent' 
                : 'bg-whatsapp-bubbleReceived chat-bubble-received'}`}
          >
            {message.image && (
              <div className="mb-2 rounded overflow-hidden">
                <img 
                  src={message.image} 
                  alt="Imagem enviada" 
                  className="w-full h-auto max-h-48 object-contain"
                />
              </div>
            )}
            
            <p className="text-whatsapp-text whitespace-pre-line">
              {message.text}
            </p>
            
            {message.buttons && message.buttons.length > 0 && (
              <div className="mt-3 space-y-2">
                {message.buttons.map(button => (
                  <button
                    key={button.id}
                    onClick={() => handleButtonClick(button.id, button.label)}
                    className="w-full py-2 px-4 bg-whatsapp-accent text-white rounded-md text-sm font-medium transition-colors hover:bg-opacity-90"
                  >
                    {button.label}
                  </button>
                ))}
              </div>
            )}
            
            <div className="text-right mt-1">
              <span className="text-xs text-whatsapp-textSecondary">
                {formatTime(message.timestamp)}
              </span>
            </div>
          </div>
        </div>
      ))}
      
      {isTyping && (
        <div className="flex mb-4 justify-start">
          <div className="bg-whatsapp-bubbleReceived rounded-lg px-4 py-3 chat-bubble-received">
            <div className="flex items-center space-x-1">
              <span className="w-2 h-2 bg-whatsapp-textSecondary rounded-full animate-typing-dot-1"></span>
              <span className="w-2 h-2 bg-whatsapp-textSecondary rounded-full animate-typing-dot-2"></span>
              <span className="w-2 h-2 bg-whatsapp-textSecondary rounded-full animate-typing-dot-3"></span>
            </div>
          </div>
        </div>
      )}
      
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
