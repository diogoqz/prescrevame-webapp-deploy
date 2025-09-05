import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export type LoginStep = 'idle' | 'email' | 'password' | 'invite';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  buttons?: MessageButton[];
}

interface MessageButton {
  id: string;
  label: string;
}

export const useChatAuth = () => {
  const { user, signIn, signUp, signOut, validateInviteCode } = useAuth();
  const { toast } = useToast();
  const [loginStep, setLoginStep] = useState<LoginStep>('idle');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginInviteCode, setLoginInviteCode] = useState('');
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [showPassword, setShowPassword] = useState(false);

  const handleAuthButton = async (buttonId: string, buttonLabel: string): Promise<Message[]> => {
    const messages: Message[] = [{
      id: Date.now().toString(),
      text: buttonLabel,
      sender: 'user',
      timestamp: new Date()
    }];

    if (buttonId === 'login') {
      setAuthMode('login');
      setLoginStep('email');
      
      messages.push({
        id: (Date.now() + 1).toString(),
        text: 'Por favor, digite seu email para fazer login:',
        sender: 'bot',
        timestamp: new Date()
      });
    }

    if (buttonId === 'signup') {
      setAuthMode('signup');
      setLoginStep('invite');
      
      messages.push({
        id: (Date.now() + 1).toString(),
        text: 'Para se cadastrar, você precisa de um código de convite. Por favor, digite o código que você recebeu:',
        sender: 'bot',
        timestamp: new Date()
      });
    }

    if (buttonId === 'info') {
      messages.push({
        id: (Date.now() + 1).toString(),
        text: 'O PrescrevaMe é um assistente virtual especializado em auxiliar profissionais de saúde. Para utilizar nossos serviços, é necessário fazer login ou se cadastrar com um código de convite.',
        sender: 'bot',
        timestamp: new Date(),
        buttons: [
          { id: 'login', label: 'Login' },
          { id: 'signup', label: 'Cadastro com Convite' }
        ]
      });
    }

    return messages;
  };

  const handleAuthMessage = async (message: string): Promise<[boolean, Message[]]> => {
    const messages: Message[] = [];
    
    if (loginStep === 'email') {
      setLoginEmail(message);
      setLoginStep('password');
      
      messages.push({
        id: Date.now().toString(),
        text: 'Agora, digite sua senha:',
        sender: 'bot',
        timestamp: new Date()
      });
      return [true, messages];
    }
    
    if (loginStep === 'invite') {
      try {
        const isValid = await validateInviteCode(message);
        if (!isValid) {
          messages.push({
            id: Date.now().toString(),
            text: 'Código de convite inválido ou já utilizado. Por favor, tente novamente:',
            sender: 'bot',
            timestamp: new Date(),
            buttons: [
              { id: 'signup', label: 'Cadastro com Convite' }
            ]
          });
          return [true, messages];
        }
        
        setLoginInviteCode(message);
        setLoginStep('email');
        
        messages.push({
          id: Date.now().toString(),
          text: 'Código de convite válido! Agora, digite seu email:',
          sender: 'bot',
          timestamp: new Date()
        });
        return [true, messages];
      } catch (error) {
        messages.push({
          id: Date.now().toString(),
          text: 'Erro ao validar código. Por favor, tente novamente:',
          sender: 'bot',
          timestamp: new Date(),
          buttons: [
            { id: 'signup', label: 'Cadastro com Convite' }
          ]
        });
        return [true, messages];
      }
    }
    
    if (loginStep === 'password') {
      setLoginPassword(message);
      try {
        if (authMode === 'login') {
          await signIn(loginEmail, message);
          toast({
            title: "Sucesso!",
            description: "Login realizado com sucesso.",
            duration: 500
          });
        } else {
          await signUp(loginEmail, message, loginInviteCode);
          toast({
            title: "Sucesso!",
            description: "Cadastro realizado com sucesso. Verifique seu email.",
          });
        }
        setLoginStep('idle');
        setLoginEmail('');
        setLoginPassword('');
        setLoginInviteCode('');
        return [true, messages];
      } catch (error) {
        toast({
          title: "Erro",
          description: error instanceof Error ? error.message : "Ocorreu um erro durante a autenticação.",
          variant: "destructive"
        });
        setLoginStep('idle');
        setLoginEmail('');
        setLoginPassword('');
        setLoginInviteCode('');
        
        messages.push({
          id: Date.now().toString(),
          text: 'Ocorreu um erro. Por favor, tente novamente:',
          sender: 'bot',
          timestamp: new Date(),
          buttons: [
            { id: 'login', label: 'Login' },
            { id: 'signup', label: 'Cadastro com Convite' }
          ]
        });
        return [true, messages];
      }
    }
    return [false, messages];
  };

  return {
    user,
    signOut,
    loginStep,
    showPassword,
    setShowPassword,
    handleAuthButton,
    handleAuthMessage
  };
};
