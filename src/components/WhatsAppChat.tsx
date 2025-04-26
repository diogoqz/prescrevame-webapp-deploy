
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useChatAuth } from '@/hooks/useChatAuth';
import { useWebhookMessages } from '@/hooks/useWebhookMessages';
import { useAudioRecording } from '@/hooks/useAudioRecording';
import { ChatHeader } from './chat/ChatHeader';
import { ChatInput } from './chat/ChatInput';
import MessageList from './chat/MessageList';
import { useIsMobile } from '@/hooks/use-mobile';
import { Message } from '@/types/Message';
import { AppConfig } from '@/config/app.config';

const WhatsAppChat: React.FC = () => {
  const isMobile = useIsMobile();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
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
  const { isRecording, isProcessing, toggleRecording } = useAudioRecording();

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

  const sendMessage = async (messageText?: string) => {
    const textToSend = messageText || inputMessage.trim();
    
    if (!textToSend && !selectedImage) return;
    
    setInputMessage('');

    const newUserMessage: Message = {
      id: Date.now().toString(),
      text: textToSend,
      sender: 'user',
      timestamp: new Date(),
      image: imagePreview || undefined
    };
    setMessages(prev => [...prev, newUserMessage]);
    
    if (loginStep !== 'idle') {
      const [handled, newMessages] = await handleAuthMessage(textToSend);
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
    formData.append('message', textToSend);
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

  const handleMicClick = async () => {
    if (user) {
      const transcription = await toggleRecording();
      if (transcription) {
        await sendMessage(transcription);
      }
    } else {
      toast({
        title: "Não autorizado",
        description: "Por favor, faça login para gravar mensagens de voz.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className={`flex justify-center items-center ${isMobile ? 'h-[100dvh] w-screen p-0' : 'h-screen w-screen p-4'}`}>
      <div className={`flex flex-col ${isMobile ? 'w-full h-full' : `w-full max-w-${AppConfig.chat.desktop.maxWidth} h-full`} rounded-lg overflow-hidden shadow-xl bg-whatsapp-bg`}>
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
          onToggleRecording={handleMicClick}
          isRecording={isRecording}
          isProcessingAudio={isProcessing}
          user={user}
          handleButtonClick={handleButtonClick}
        />
      </div>
    </div>
  );
};

export default WhatsAppChat;
