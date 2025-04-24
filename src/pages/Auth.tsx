import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCards } from 'swiper/modules';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, LogIn, UserPlus, Info, MessageCircle, Stethoscope, Brain, Clock } from 'lucide-react';

import 'swiper/css';
import 'swiper/css/effect-cards';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [activeStep, setActiveStep] = useState(0);
  const [logoError, setLogoError] = useState(false);
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
            <h2 className="text-3xl font-bold text-white mb-4">
              Por que escolher o PrescrevaMe?
            </h2>
            <p className="text-gray-300">
              Transformando a maneira como os médicos prescrevem medicamentos
            </p>
          </div>
          
          <Card className="bg-whatsapp-bubbleReceived/95 border-none">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Stethoscope className="h-5 w-5 text-prescrevame" />
                Prescrições Inteligentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">
                Sistema avançado de prescrição que ajuda a evitar erros e otimizar o tempo de consulta.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-whatsapp-bubbleReceived/95 border-none">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Brain className="h-5 w-5 text-prescrevame" />
                IA Especializada
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">
                Inteligência artificial treinada com milhares de prescrições médicas para sugerir as melhores opções.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-whatsapp-bubbleReceived/95 border-none">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Clock className="h-5 w-5 text-prescrevame" />
                Economia de Tempo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">
                Reduza o tempo gasto em prescrições e foque mais no atendimento ao paciente.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="w-full lg:w-1/2 max-w-md">
          <div className="mb-8 flex flex-col items-center animate-scale-up">
            <div className="h-24 w-24 mb-4 rounded-full overflow-hidden border-4 border-prescrevame">
              <img
                src="https://i.ibb.co/7JbHrmdT/pm3.jpg"
                alt="PrescrevaMe Logo"
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='16' fill='white'%3EPM%3C/text%3E%3C/svg%3E";
                }}
              />
            </div>
            <h1 className="text-3xl font-bold text-white text-center">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-prescrevame to-prescrevame-light">Prescreva</span>.me
            </h1>
            <p className="text-gray-300 text-center mt-2">
              Sua plataforma de assistência médica inteligente
            </p>
          </div>

          <Swiper
            effect={'cards'}
            grabCursor={true}
            modules={[EffectCards]}
            className="w-full"
          >
            <SwiperSlide>
              <Card className="bg-whatsapp-bubbleReceived/95 border-none">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    {authMode === 'login' ? (
                      <>
                        <LogIn className="h-5 w-5 text-prescrevame" />
                        Entrar
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-5 w-5 text-prescrevame" />
                        Cadastrar
                      </>
                    )}
                  </CardTitle>
                  <CardDescription className="text-gray-300">
                    {authMode === 'login'
                      ? "Faça login para acessar sua conta"
                      : "Crie uma conta para começar"
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-gray-300">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="bg-whatsapp-inputBg border-none text-white placeholder:text-gray-400"
                        placeholder="seuemail@exemplo.com"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-gray-300">Senha</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          className="bg-whatsapp-inputBg border-none text-white placeholder:text-gray-400 pr-10"
                          placeholder="********"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full bg-prescrevame hover:bg-prescrevame-dark text-white font-medium transition-all duration-300"
                    >
                      {authMode === 'login' ? 'Entrar' : 'Cadastrar'}
                    </Button>
                  </form>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4 pt-2">
                  <div className="text-sm text-center text-gray-300">
                    {authMode === 'login' ? (
                      <>
                        Não tem uma conta?{' '}
                        <button
                          onClick={() => setAuthMode('signup')}
                          className="text-prescrevame hover:text-prescrevame-light font-medium transition-colors"
                        >
                          Cadastre-se
                        </button>
                      </>
                    ) : (
                      <>
                        Já tem uma conta?{' '}
                        <button
                          onClick={() => setAuthMode('login')}
                          className="text-prescrevame hover:text-prescrevame-light font-medium transition-colors"
                        >
                          Faça login
                        </button>
                      </>
                    )}
                  </div>
                  <Button 
                    variant="ghost"
                    onClick={handleSupport}
                    className="w-full text-gray-300 hover:text-white hover:bg-whatsapp-inputBg"
                  >
                    Suporte <MessageCircle className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
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
