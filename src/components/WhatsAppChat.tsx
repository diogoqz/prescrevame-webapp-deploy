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
import { ImageDropzone } from './chat/input/ImageDropzone';
import { userService } from '@/services/userService';

const WhatsAppChat: React.FC = () => {
  const isMobile = useIsMobile();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [userStatus, setUserStatus] = useState<'ativo' | 'bloqueado' | null>(null);
  const [isTrial, setIsTrial] = useState<boolean>(false);
  const [hasUserMessages, setHasUserMessages] = useState<boolean>(false);
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

  // Verificar status e se é trial quando ele fizer login
  useEffect(() => {
    const checkUserStatus = async () => {
      if (user?.email) {
        const status = await userService.getUserStatus(user.email);
        setUserStatus(status);

        const trial = await userService.getUserIsTrial(user.email);
        setIsTrial(trial);
      }
    };

    checkUserStatus();
  }, [user]);

  const handleButtonClick = async (buttonId: string, buttonLabel: string) => {
    const newMessages = await handleAuthButton(buttonId, buttonLabel);
    setMessages(prev => [...prev, ...newMessages]);
  };

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion);
  };

  const clearImagePreview = () => {
    setSelectedImage(null);
    setImagePreview(null);
    // Limpar o input file também
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const sendMessage = async (messageText?: string) => {
    const textToSend = messageText?.trim() || inputMessage.trim();
    
    if (!textToSend && !selectedImage) {
      toast({
        title: "Erro",
        description: "Por favor, digite uma mensagem ou selecione uma imagem.",
        variant: "destructive"
      });
      return;
    }
    
    const formData = new FormData();
    formData.append('message', textToSend);
    
    if (selectedImage) {
        formData.append('image', selectedImage);
    }

    const currentImage = selectedImage;
    const currentPreview = imagePreview;
    clearImagePreview();
    setInputMessage('');

    const newUserMessage: Message = {
        id: Date.now().toString(),
        text: textToSend,
        sender: 'user',
        timestamp: new Date(),
        image: currentPreview || undefined
    };

    setMessages(prev => [...prev, newUserMessage]);
    setHasUserMessages(true);
    
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

    // Verificar se o usuário está bloqueado
    if (userStatus === 'bloqueado') {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        text: '🚫 **Acesso Bloqueado**\n\nSeu acesso ao PrescrevaMe foi temporariamente bloqueado. Para resolver esta situação, entre em contato com nosso suporte:\n\n📱 **WhatsApp**: (63) 92437-559\n📧 **Email**: suporte@prescrevame.com\n\nAgradecemos sua compreensão.',
        sender: 'bot',
        timestamp: new Date()
      }]);
      return;
    }

    try {
      const botMessages = await sendMessageToWebhook(formData);
      if (botMessages && botMessages.length > 0) {
        botMessages.forEach((message, index) => {
          if (message && typeof message.text === 'string' && message.text.trim()) {
            setTimeout(() => {
              setMessages(prev => [...prev, {
                ...message,
                text: message.text.trim()
              }]);
            }, 800 * (index + 1));
          }
        });
      } else {
        throw new Error('Resposta vazia do servidor');
      }
    } catch (error) {
      console.error('Error processing bot response:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao processar a resposta. Por favor, tente novamente.",
        variant: "destructive"
      });
      if (currentImage && currentPreview) {
        setSelectedImage(currentImage);
        setImagePreview(currentPreview);
      }
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
    if (!file) {
      clearImagePreview();
      return;
    }
    
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

  const handleDrop = (file: File) => {
    const event = { target: { files: [file] } } as unknown as React.ChangeEvent<HTMLInputElement>;
    handleImageUpload(event);
  };

  const handleMicClick = async () => {
    if (!user) {
      toast({
        title: "Não autorizado",
        description: "Por favor, faça login para gravar mensagens de voz.",
        variant: "destructive"
      });
      return;
    }

    // Verificar se o usuário está bloqueado
    if (userStatus === 'bloqueado') {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        text: '🚫 **Acesso Bloqueado**\n\nSeu acesso ao PrescrevaMe foi temporariamente bloqueado. Para resolver esta situação, entre em contato com nosso suporte:\n\n📱 **WhatsApp**: (63) 92437-559\n📧 **Email**: suporte@prescrevame.com\n\nAgradecemos sua compreensão.',
        sender: 'bot',
        timestamp: new Date()
      }]);
      return;
    }

    const result = await toggleRecording();
    
    if (result.success && result.text) {
      // Enviar o texto transcrito como uma mensagem
      await sendMessage(result.text);
    }
  };

  return (
    <ImageDropzone onDrop={handleDrop}>
      <div className={`flex justify-center items-center ${isMobile ? 'h-[100dvh] w-screen p-0' : 'h-screen w-screen p-4'}`}>
        <div className={`flex flex-col ${isMobile ? 'w-full h-full' : `w-full max-w-${AppConfig.chat.desktop.maxWidth} h-full`} rounded-lg overflow-hidden shadow-xl bg-whatsapp-bg`}>
          <ChatHeader user={user} onSignOut={signOut} />
          
          <MessageList 
            messages={messages} 
            isTyping={isTyping} 
            handleButtonClick={handleButtonClick}
            onSuggestionClick={handleSuggestionClick}
            showSuggestions={user && !hasUserMessages && !isTyping}
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
            userStatus={userStatus}
            isTrial={isTrial}
            handleButtonClick={handleButtonClick}
            onRemoveImage={clearImagePreview}
          />
        </div>
      </div>
    </ImageDropzone>
  );
};

export default WhatsAppChat;