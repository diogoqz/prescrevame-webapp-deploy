
import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Mic, MicOff, Image, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Define message types
interface MessageButton {
  id: string;
  label: string;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  buttons?: MessageButton[];
  image?: string;
}

interface ApiResponse {
  text: string;
  buttons?: { id: string; label: string }[];
  image?: string;
}

const WhatsAppChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Olá! Eu sou o PrescrevaMe. Como posso te ajudar hoje?',
      sender: 'bot',
      timestamp: new Date(),
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  // Scroll to the bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const sendMessage = async () => {
    if ((!inputMessage.trim() && !selectedImage) || isTyping) return;
    
    // Add user message to chat
    const newUserMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage.trim(),
      sender: 'user',
      timestamp: new Date(),
      image: imagePreview || undefined
    };
    
    setMessages(prev => [...prev, newUserMessage]);
    setInputMessage('');
    setIsTyping(true);
    setSelectedImage(null);
    setImagePreview(null);
    
    // Create form data for API request
    const formData = new FormData();
    formData.append('message', inputMessage.trim());
    if (selectedImage) {
      formData.append('image', selectedImage);
    }
    
    // API Request
    try {
      const response = await fetch('https://app-n8n.icogub.easypanel.host/webhook/f54cf431-4260-4e9f-ac60-c7d5feab9c35', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const data: ApiResponse = await response.json();
      
      // Add bot response to chat
      setTimeout(() => {
        setIsTyping(false);
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          text: data.text,
          sender: 'bot',
          timestamp: new Date(),
          buttons: data.buttons,
          image: data.image
        }]);
      }, 800);
    } catch (error) {
      console.error('Error sending message:', error);
      setIsTyping(false);
      toast({
        title: "Erro",
        description: "Não foi possível enviar sua mensagem. Tente novamente.",
        variant: "destructive"
      });
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendMessage();
    }
  };
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.includes('image/')) {
      toast({
        title: "Erro",
        description: "Por favor, selecione apenas arquivos de imagem.",
        variant: "destructive"
      });
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast({
        title: "Erro",
        description: "A imagem deve ter menos de 5MB.",
        variant: "destructive"
      });
      return;
    }
    
    setSelectedImage(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };
  
  const handleButtonClick = (buttonId: string, buttonLabel: string) => {
    // Add user selection to chat
    const newUserMessage: Message = {
      id: Date.now().toString(),
      text: buttonLabel,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, newUserMessage]);
    setIsTyping(true);
    
    // Send button selection to API
    fetch('https://app-n8n.icogub.easypanel.host/webhook/f54cf431-4260-4e9f-ac60-c7d5feab9c35', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        message: buttonLabel,
        buttonId: buttonId
      })
    })
    .then(response => response.json())
    .then((data: ApiResponse) => {
      setTimeout(() => {
        setIsTyping(false);
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          text: data.text,
          sender: 'bot',
          timestamp: new Date(),
          buttons: data.buttons,
          image: data.image
        }]);
      }, 800);
    })
    .catch(error => {
      console.error('Error sending button selection:', error);
      setIsTyping(false);
      toast({
        title: "Erro",
        description: "Não foi possível processar sua seleção. Tente novamente.",
        variant: "destructive"
      });
    });
  };
  
  const toggleRecording = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      toast({
        title: "Gravação de voz",
        description: "Funcionalidade em desenvolvimento.",
      });
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };
  
  const openImageUpload = () => {
    fileInputRef.current?.click();
  };
  
  const clearImagePreview = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };
  
  return (
    <div className="flex justify-center items-center min-h-screen p-4">
      <div className="flex flex-col w-full max-w-md h-[600px] rounded-lg overflow-hidden shadow-xl bg-whatsapp-bg">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 bg-whatsapp-header">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-whatsapp-accent flex items-center justify-center">
            <span className="text-white font-bold">PM</span>
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-whatsapp-text">PrescrevaMe</h3>
            <p className="text-xs text-whatsapp-textSecondary">online</p>
          </div>
        </div>
        
        {/* Chat area with WhatsApp background */}
        <div 
          className="flex-1 p-4 overflow-y-auto chat-scrollbar"
          style={{ 
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='64' height='64' viewBox='0 0 64 64' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M8 16c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8zm0-2c3.314 0 6-2.686 6-6s-2.686-6-6-6-6 2.686-6 6 2.686 6 6 6zm33.414-6l5.95-5.95L45.95.636 40 6.586 34.05.636 32.636 2.05 38.586 8l-5.95 5.95 1.414 1.414L40 9.414l5.95 5.95 1.414-1.414L41.414 8zM40 48c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8zm0-2c3.314 0 6-2.686 6-6s-2.686-6-6-6-6 2.686-6 6 2.686 6 6 6zM9.414 40l5.95-5.95-1.414-1.414L8 38.586l-5.95-5.95L.636 34.05 6.586 40l-5.95 5.95 1.414 1.414L8 41.414l5.95 5.95 1.414-1.414L9.414 40z' fill='%23111B21' fill-opacity='0.04' fill-rule='evenodd'/%3E%3C/svg%3E")`,
            backgroundSize: "200px 200px"
          }}
        >
          {messages.map((message, index) => (
            <div 
              key={message.id}
              className={`flex mb-4 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[80%] rounded-lg px-3 py-2 animate-message-appear
                  ${message.sender === 'user' 
                    ? 'bg-whatsapp-bubbleSent chat-bubble-sent' 
                    : 'bg-whatsapp-bubbleReceived chat-bubble-received'}`}
                style={{ animationDelay: `${index * 0.1}s` }}
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
                
                <p className="text-whatsapp-text">{message.text}</p>
                
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
        
        {/* Image preview area */}
        {imagePreview && (
          <div className="px-4 py-2 bg-whatsapp-inputBg">
            <div className="relative inline-block">
              <img 
                src={imagePreview} 
                alt="Preview" 
                className="h-16 w-auto rounded"
              />
              <button 
                onClick={clearImagePreview}
                className="absolute -top-2 -right-2 bg-whatsapp-bubbleReceived rounded-full p-1"
              >
                <X size={14} className="text-whatsapp-text" />
              </button>
            </div>
          </div>
        )}
        
        {/* Input area */}
        <div className="px-4 py-3 bg-whatsapp-header flex items-center gap-2">
          <button 
            onClick={openImageUpload}
            className="text-whatsapp-textSecondary hover:text-whatsapp-accent transition-colors"
          >
            <Image size={24} />
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
          </button>
          
          <button 
            className="text-whatsapp-textSecondary hover:text-whatsapp-accent transition-colors"
          >
            <Paperclip size={24} />
          </button>
          
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Digite uma mensagem"
              className="w-full px-4 py-2 rounded-full bg-whatsapp-inputBg text-whatsapp-text placeholder-whatsapp-textSecondary focus:outline-none"
            />
          </div>
          
          {inputMessage.trim() || imagePreview ? (
            <button 
              onClick={sendMessage}
              className="text-whatsapp-accent hover:text-whatsapp-text transition-colors"
            >
              <Send size={24} />
            </button>
          ) : (
            <button 
              onClick={toggleRecording}
              className="text-whatsapp-accent hover:text-whatsapp-text transition-colors"
            >
              {isRecording ? <MicOff size={24} /> : <Mic size={24} />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default WhatsAppChat;
