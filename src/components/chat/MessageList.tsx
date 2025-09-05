import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Message } from '@/types/Message';
import LoadingAnimation from './LoadingAnimation';
import SuggestionChips from './SuggestionChips';

interface MessageListProps {
  messages: Message[];
  isTyping: boolean;
  handleButtonClick: (buttonId: string, buttonLabel: string) => Promise<void>;
  onSuggestionClick?: (suggestion: string) => void;
  showSuggestions?: boolean;
}

const MessageList: React.FC<MessageListProps> = ({ 
  messages, 
  isTyping, 
  handleButtonClick, 
  onSuggestionClick,
  showSuggestions = false 
}) => {
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

  const formatMessage = (text: string) => {
    // Primeiro, processa as tags HTML existentes
    const parts = text.split(/(<strong>.*?<\/strong>)/).map((part, index) => {
      if (part.startsWith('<strong>') && part.endsWith('</strong>')) {
        const content = part.replace(/<\/?strong>/g, '');
        return <strong key={index} className="font-bold">{content}</strong>;
      }
      // Processa asteriscos para negrito
      return part.split(/(\*[^*]+\*)/).map((subPart, subIndex) => {
        if (subPart.startsWith('*') && subPart.endsWith('*')) {
          const content = subPart.slice(1, -1);
          return <strong key={`${index}-${subIndex}`} className="font-bold">{content}</strong>;
        }
        return <span key={`${index}-${subIndex}`}>{subPart}</span>;
      });
    });

    // Flatten o array resultante
    return parts.flat();
  };

  return (
    <div 
      className="flex-1 p-4 overflow-y-auto chat-scrollbar"
      style={{ 
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='64' height='64' viewBox='0 0 64 64' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M8 16c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8zm0-2c3.314 0 6-2.686 6-6s-2.686-6-6-6-6 2.686-6 6 2.686 6 6 6zm33.414-6l5.95-5.95L45.95.636 40 6.586 34.05.636 32.636 2.05 38.586 8l-5.95 5.95 1.414 1.414L40 9.414l5.95 5.95 1.414-1.414L41.414 8zM40 48c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8zm0-2c3.314 0 6-2.686 6-6s-2.686-6-6-6-6 2.686-6 6 2.686 6 6 6zM9.414 40l5.95-5.95-1.414-1.414L8 38.586l-5.95-5.95L.636 34.05 6.586 40l-5.95 5.95 1.414 1.414L8 41.414l5.95 5.95 1.414-1.414L9.414 40z' fill='%23111B21' fill-opacity='0.04' fill-rule='evenodd'/%3E%3C/svg%3E")`,
        backgroundSize: "200px 200px"
      }}
    >
      <AnimatePresence>
        {messages.map((message) => (
          <motion.div 
            key={message.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ 
              duration: 0.3,
              ease: "easeOut"
            }}
            className={`flex mb-4 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <motion.div 
              className={`max-w-[80%] rounded-lg px-3 py-2
                ${message.sender === 'user' 
                  ? 'bg-whatsapp-bubbleSent chat-bubble-sent' 
                  : 'bg-whatsapp-bubbleReceived chat-bubble-received'}`}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
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
            
            <div className="text-whatsapp-text whitespace-pre-line">
              {formatMessage(message.text)}
            </div>
            
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
            </motion.div>
          </motion.div>
        ))}
      </AnimatePresence>
      
      {isTyping && (
        <div className="flex mb-4 justify-start">
          <LoadingAnimation isTyping={isTyping} />
        </div>
      )}
      
      {showSuggestions && onSuggestionClick && (
        <SuggestionChips 
          onSuggestionClick={onSuggestionClick}
          disabled={isTyping}
        />
      )}
      
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
