import React, { useState, useRef, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useChatAuth } from '@/hooks/useChatAuth';
import { useWebhookMessages } from '@/hooks/useWebhookMessages';
import { ChatHeader } from './chat/ChatHeader';
import { ChatInput } from './chat/ChatInput';
import { useIsMobile } from '@/hooks/use-mobile';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  buttons?: MessageButton[];
  image?: string;
}

interface MessageButton {
  id: string;
  label: string;
}

const WhatsAppChat: React.FC = () => {
  const isMobile = useIsMobile();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const {
    user,
    signOut,
    loginStep,
    showPassword,
    setShowPassword,
    handleAuthButton,
    handleAuthMessage
  } = useChatAuth();

  const { isTyping, sendMessageToWebhook } = useWebhookMessages();

  useEffect(() => {
    setMessages([
      {
        id: '1',
        text: user 
          ? 'Olá! Eu sou o PrescrevaMe. Como posso te ajudar hoje?' 
          : 'Bem-vindo ao PrescrevaMe! Por favor, faça login ou cadastre-se para continuar.',
        sender: 'bot',
        timestamp: new Date(),
        buttons: !user ? [
          { id: 'login', label: 'Login' },
          { id: 'signup', label: 'Cadastro' },
          { id: 'info', label: 'Mais Informações' }
        ] : undefined
      }
    ]);
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleButtonClick = async (buttonId: string, buttonLabel: string) => {
    const newMessages = await handleAuthButton(buttonId, buttonLabel);
    setMessages(prev => [...prev, ...newMessages]);
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() && !selectedImage) return;
    
    const messageText = inputMessage.trim();
    setInputMessage('');

    const newUserMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      sender: 'user',
      timestamp: new Date(),
      image: imagePreview || undefined
    };
    setMessages(prev => [...prev, newUserMessage]);
    
    if (loginStep !== 'idle') {
      const [handled, newMessages] = await handleAuthMessage(messageText);
      if (handled) {
        setMessages(prev => [...prev, ...newMessages]);
        return;
      }
    }

    if (!user) {
      toast({
        title: "Não autorizado",
        description: "Por favor, faça login para enviar mensagens.",
        variant: "destructive"
      });
      return;
    }

    const formData = new FormData();
    formData.append('message', messageText);
    if (selectedImage) {
      formData.append('image', selectedImage);
    }
    
    const botMessages = await sendMessageToWebhook(formData);
    botMessages.forEach((message, index) => {
      setTimeout(() => {
        setMessages(prev => [...prev, message]);
      }, 800 * (index + 1));
    });

    setSelectedImage(null);
    setImagePreview(null);
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
    
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Erro",
        description: "A imagem deve ter menos de 5MB.",
        variant: "destructive"
      });
      return;
    }
    
    setSelectedImage(file);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
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

  return (
    <div className={`flex justify-center items-center ${isMobile ? 'h-[100dvh] w-screen p-0' : 'p-4'}`}>
      <div className={`flex flex-col ${isMobile ? 'w-full h-full' : 'w-full max-w-md h-[600px]'} rounded-lg overflow-hidden shadow-xl bg-whatsapp-bg`}>
        <ChatHeader user={user} onSignOut={signOut} />
        
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

        <ChatInput
          inputMessage={inputMessage}
          setInputMessage={setInputMessage}
          onSendMessage={sendMessage}
          onKeyDown={handleKeyDown}
          isTyping={isTyping}
          loginStep={loginStep}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          imagePreview={imagePreview}
          onImageUpload={handleImageUpload}
          onToggleRecording={toggleRecording}
          isRecording={isRecording}
          user={user}
          handleButtonClick={handleButtonClick}
        />
      </div>
    </div>
  );
};

export default WhatsAppChat;
