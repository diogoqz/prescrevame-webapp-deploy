
import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Mic, MicOff, Image, X, Eye, EyeOff, LogIn, LogOut, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

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
  reply?: string;
  text?: string;
  buttons?: { id: string; label: string }[];
  image?: string;
  result?: string;
  replies?: string[];
}

const WhatsAppChat: React.FC = () => {
  const { user, signIn, signUp, signOut } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginStep, setLoginStep] = useState<'idle' | 'email' | 'password'>('idle');
  const [showPassword, setShowPassword] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

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
    const newUserMessage: Message = {
      id: Date.now().toString(),
      text: buttonLabel,
      sender: 'user',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newUserMessage]);

    if (buttonId === 'login' || buttonId === 'signup') {
      setAuthMode(buttonId as 'login' | 'signup');
      setLoginStep('email');
      const actionText = buttonId === 'login' ? 'fazer login' : 'se cadastrar';
      
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          text: `Por favor, digite seu email para ${actionText}:`,
          sender: 'bot',
          timestamp: new Date()
        }]);
      }, 500);
      return;
    }

    if (buttonId === 'info') {
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          text: 'O PrescrevaMe é um assistente virtual especializado em auxiliar profissionais de saúde. Para utilizar nossos serviços, é necessário fazer login ou se cadastrar.',
          sender: 'bot',
          timestamp: new Date(),
          buttons: [
            { id: 'login', label: 'Login' },
            { id: 'signup', label: 'Cadastro' }
          ]
        }]);
      }, 500);
    }
  };

  const handleAuthMessage = async (message: string) => {
    if (loginStep === 'email') {
      setLoginEmail(message);
      setLoginStep('password');
      
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          text: 'Agora, digite sua senha:',
          sender: 'bot',
          timestamp: new Date()
        }]);
      }, 500);
      return true;
    }
    
    if (loginStep === 'password') {
      setLoginPassword(message);
      try {
        if (authMode === 'login') {
          await signIn(loginEmail, message);
          toast({
            title: "Sucesso!",
            description: "Login realizado com sucesso.",
          });
        } else {
          await signUp(loginEmail, message);
          toast({
            title: "Sucesso!",
            description: "Cadastro realizado com sucesso. Verifique seu email.",
          });
        }
        setLoginStep('idle');
        setLoginEmail('');
        setLoginPassword('');
        return true;
      } catch (error) {
        toast({
          title: "Erro",
          description: error instanceof Error ? error.message : "Ocorreu um erro durante a autenticação.",
          variant: "destructive"
        });
        setLoginStep('idle');
        setLoginEmail('');
        setLoginPassword('');
        
        setTimeout(() => {
          setMessages(prev => [...prev, {
            id: Date.now().toString(),
            text: 'Ocorreu um erro. Por favor, tente novamente:',
            sender: 'bot',
            timestamp: new Date(),
            buttons: [
              { id: 'login', label: 'Login' },
              { id: 'signup', label: 'Cadastro' }
            ]
          }]);
        }, 500);
      }
      return true;
    }
    return false;
  };

  const processWebhookResponse = (responseData: any): string[] => {
    console.log('Processing webhook response:', responseData);
    const replies: string[] = [];

    // Check if response is an array
    if (Array.isArray(responseData)) {
      responseData.forEach(item => {
        if (item.result) {
          try {
            // Try to parse the result as JSON
            const parsedResult = JSON.parse(item.result);
            if (parsedResult.replies && Array.isArray(parsedResult.replies)) {
              // Add each reply to our replies array
              replies.push(...parsedResult.replies);
            } else if (parsedResult.reply) {
              replies.push(parsedResult.reply);
            }
          } catch (e) {
            // If JSON parsing fails, add the result as is
            replies.push(item.result);
          }
        } else if (item.reply) {
          replies.push(item.reply);
        }
      });
    } else if (responseData && responseData.result) {
      // Legacy handling for single response object
      try {
        const resultObj = JSON.parse(responseData.result);
        if (resultObj.replies && Array.isArray(resultObj.replies)) {
          replies.push(...resultObj.replies);
        } else if (resultObj.reply) {
          replies.push(resultObj.reply);
        }
      } catch (e) {
        // If JSON parsing fails, add the response as is
        if (typeof responseData.result === 'string') {
          replies.push(responseData.result);
        }
      }
    } else if (responseData && responseData.reply) {
      replies.push(responseData.reply);
    }

    // If no replies were extracted, add a fallback message
    if (replies.length === 0) {
      replies.push('Não foi possível processar a resposta.');
    }

    return replies;
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
      const handled = await handleAuthMessage(messageText);
      if (handled) return;
    }

    if (!user) {
      toast({
        title: "Não autorizado",
        description: "Por favor, faça login para enviar mensagens.",
        variant: "destructive"
      });
      return;
    }

    setIsTyping(true);
    setSelectedImage(null);
    setImagePreview(null);
    
    const formData = new FormData();
    formData.append('message', inputMessage.trim());
    if (selectedImage) {
      formData.append('image', selectedImage);
    }
    
    try {
      console.log('Sending message to webhook...');
      const response = await fetch('https://app-n8n.icogub.easypanel.host/webhook/f54cf431-4260-4e9f-ac60-c7d5feab9c35', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const responseData = await response.json();
      console.log('Webhook response:', responseData);
      
      const replies = processWebhookResponse(responseData);
      
      // Add each reply as a separate bot message with a small delay between them
      setIsTyping(false);
      
      replies.forEach((reply, index) => {
        setTimeout(() => {
          setMessages(prev => [...prev, {
            id: Date.now().toString() + '-' + index,
            text: reply,
            sender: 'bot',
            timestamp: new Date()
          }]);
        }, 800 * (index + 1));
      });
      
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
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
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
    <div className="flex justify-center items-center min-h-screen p-4">
      <div className="flex flex-col w-full max-w-md h-[600px] rounded-lg overflow-hidden shadow-xl bg-whatsapp-bg">
        <div className="flex items-center gap-3 px-4 py-3 bg-whatsapp-header">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-whatsapp-accent flex items-center justify-center">
            <span className="text-white font-bold">PM</span>
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-whatsapp-text">PrescrevaMe</h3>
            <p className="text-xs text-whatsapp-textSecondary">
              {user ? user.email : 'offline'}
            </p>
          </div>
          {user && (
            <button
              onClick={signOut}
              className="text-whatsapp-textSecondary hover:text-whatsapp-accent transition-colors flex items-center gap-2"
              title="Sair"
            >
              <LogOut size={24} />
            </button>
          )}
        </div>
        
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

        <div className="px-4 py-3 bg-whatsapp-header flex items-center gap-2">
          {!user && loginStep === 'idle' ? (
            <div className="flex-1 text-center">
              <button
                onClick={() => handleButtonClick('login', 'Login')}
                className="py-2 px-4 bg-whatsapp-accent text-white rounded-md text-sm font-medium transition-colors hover:bg-opacity-90 flex items-center justify-center gap-2 w-full"
              >
                <LogIn size={20} />
                Faça login para enviar mensagens
              </button>
            </div>
          ) : (
            <>
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
                  placeholder={loginStep === 'password' ? 'Digite sua senha' : 'Digite uma mensagem'}
                  className="w-full px-4 py-2 rounded-full bg-whatsapp-inputBg text-whatsapp-text placeholder-whatsapp-textSecondary focus:outline-none"
                  {...(loginStep === 'password' ? { type: showPassword ? 'text' : 'password' } : {})}
                />
                {loginStep === 'password' && (
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-whatsapp-textSecondary hover:text-whatsapp-accent transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                )}
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
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default WhatsAppChat;
