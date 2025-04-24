
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';
import AuthCard from '@/components/auth/AuthCard';
import { Stethoscope } from 'lucide-react';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const { signIn, signUp, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (authMode === 'login') {
        await signIn(email, password);
        toast({
          title: "Login bem-sucedido",
          description: "Bem-vindo de volta!",
        });
      } else {
        await signUp(email, password);
        toast({
          title: "Cadastro bem-sucedido",
          description: "Verifique seu email para confirmar seu cadastro.",
        });
      }
      navigate('/');
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro durante a autenticação",
        variant: "destructive",
      });
    }
  };

  const handleSupport = () => {
    window.open('https://api.whatsapp.com/send?phone=556392437559&text=SUPORTE', '_blank');
  };

  return (
    <div className="min-h-[100dvh] w-screen flex items-center justify-center bg-whatsapp-bg">
      <div className="w-full max-w-md px-4 py-8">
        <div className="text-center mb-8 animate-fade-in">
          <div className="h-24 w-24 mx-auto mb-4 rounded-full overflow-hidden border-4 border-prescrevame shadow-lg transform hover:scale-105 transition-transform duration-300">
            <img
              src="https://i.ibb.co/7JbHrmdT/pm3.jpg"
              alt="PrescrevaMe Logo"
              className="h-full w-full object-cover"
            />
          </div>
          <h1 className="text-3xl font-bold">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-prescrevame to-prescrevame-light">
              Prescreva
            </span>
            <span className="text-white">.me</span>
          </h1>
          <p className="text-gray-400 mt-2">
            Sua plataforma de assistência médica inteligente
          </p>
        </div>

        <Card className="bg-whatsapp-bubbleReceived border-none shadow-lg animate-scale-in hover:shadow-xl transition-all duration-300">
          <AuthCard
            authMode={authMode}
            email={email}
            password={password}
            showPassword={showPassword}
            onEmailChange={(e) => setEmail(e.target.value)}
            onPasswordChange={(e) => setPassword(e.target.value)}
            onTogglePassword={() => setShowPassword(!showPassword)}
            onSubmit={handleSubmit}
            onModeChange={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
            onSupport={handleSupport}
          />
        </Card>

        <div className="mt-8 text-center">
          <div className="flex items-center justify-center gap-2 text-gray-400">
            <Stethoscope className="h-5 w-5" />
            <span className="text-sm">Tecnologia a serviço da medicina</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
