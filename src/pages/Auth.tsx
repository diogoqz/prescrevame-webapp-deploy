
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCards } from 'swiper/modules';
import { Stethoscope, Brain, Clock } from 'lucide-react';
import AuthCard from '@/components/auth/AuthCard';
import InfoCard from '@/components/auth/InfoCard';

import 'swiper/css';
import 'swiper/css/effect-cards';

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
    <div className="min-h-[100dvh] w-screen flex items-center justify-center bg-whatsapp-bg overflow-x-hidden py-8">
      <div className="w-full max-w-6xl px-4 flex flex-col lg:flex-row items-center gap-8 relative z-10">
        <div className="w-full lg:w-1/2 space-y-6">
          <div className="text-center lg:text-left mb-8">
            <div className="mb-8 flex flex-col items-center lg:items-start animate-scale-up">
              <div className="h-24 w-24 mb-4 rounded-full overflow-hidden border-4 border-prescrevame">
                <img
                  src="https://i.ibb.co/7JbHrmdT/pm3.jpg"
                  alt="PrescrevaMe Logo"
                  className="h-full w-full object-cover"
                />
              </div>
              <h1 className="text-3xl font-bold text-white">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-prescrevame to-prescrevame-light">
                  Prescreva
                </span>.me
              </h1>
              <p className="text-gray-300 mt-2">
                Sua plataforma de assistência médica inteligente
              </p>
            </div>

            <h2 className="text-3xl font-bold text-white mb-4">
              Por que escolher o PrescrevaMe?
            </h2>
            <p className="text-gray-300">
              Transformando a maneira como os médicos prescrevem medicamentos
            </p>
          </div>

          <InfoCard
            icon={Stethoscope}
            title="Prescrições Inteligentes"
            description="Sistema avançado de prescrição que ajuda a evitar erros e otimizar o tempo de consulta."
          />

          <InfoCard
            icon={Brain}
            title="IA Especializada"
            description="Inteligência artificial treinada com milhares de prescrições médicas para sugerir as melhores opções."
          />

          <InfoCard
            icon={Clock}
            title="Economia de Tempo"
            description="Reduza o tempo gasto em prescrições e foque mais no atendimento ao paciente."
          />
        </div>

        <div className="w-full lg:w-1/2 max-w-md">
          <Swiper
            effect={'cards'}
            grabCursor={true}
            modules={[EffectCards]}
            className="w-full"
          >
            <SwiperSlide>
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
            </SwiperSlide>
          </Swiper>
        </div>
      </div>

      <footer className="fixed bottom-4 text-gray-400 text-xs text-center w-full">
        © {new Date().getFullYear()} PrescrevaMe. Todos os direitos reservados.
      </footer>
    </div>
  );
};

export default Auth;
