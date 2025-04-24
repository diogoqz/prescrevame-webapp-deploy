
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useChatAuth } from '@/hooks/useChatAuth';
import { useWebhookMessages } from '@/hooks/useWebhookMessages';
import { ChatHeader } from './chat/ChatHeader';
import { ChatInput } from './chat/ChatInput';
import MessageList from './chat/MessageList';
import { useIsMobile } from '@/hooks/use-mobile';
import { Message } from '@/types/Message';

const WhatsAppChat: React.FC = () => {
  const isMobile = useIsMobile();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
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

  return (
    <div className={`flex justify-center items-center ${isMobile ? 'h-[100dvh] w-screen p-0' : 'h-screen p-4'}`}>
      <div className={`flex flex-col ${isMobile ? 'w-full h-full' : 'w-full max-w-md h-full'} rounded-lg overflow-hidden shadow-xl bg-whatsapp-bg`}>
        <ChatHeader user={user} onSignOut={signOut} />
        
        <MessageList 
          messages={messages} 
          isTyping={isTyping} 
          handleButtonClick={handleButtonClick} 
        />

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
