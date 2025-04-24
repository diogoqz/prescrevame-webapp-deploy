
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
import { Eye, EyeOff, LogIn, UserPlus, Info, MessageCircle, Heart, ChevronRight } from 'lucide-react';

import 'swiper/css';
import 'swiper/css/effect-cards';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [activeStep, setActiveStep] = useState(0);
  const { signIn, signUp, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Redirect if already logged in
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

  return (
    <div className="h-[100dvh] w-screen flex flex-col justify-center items-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
      <div className="w-full max-w-md relative z-10">
        {/* Decorative orbs with new colors */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-purple-500/20 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full bg-blue-500/20 blur-3xl animate-pulse"></div>
        
        <div className="mb-8 flex flex-col items-center animate-scale-up">
          <img
            src="/lovable-uploads/f9d8ee9c-efab-4f5c-98b5-b08a1a131d86.png"
            alt="PrescrevaMe Logo"
            className="h-24 w-auto mb-4 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]"
          />
          <h1 className="text-3xl font-bold text-white text-center">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">Prescreva</span>.me
          </h1>
          <p className="text-gray-300 text-center mt-2 max-w-xs">
            Sua plataforma de assistência médica inteligente
          </p>
        </div>

        <Swiper
          effect={'cards'}
          grabCursor={true}
          modules={[EffectCards]}
          className="w-full"
          onSlideChange={(swiper) => setActiveStep(swiper.activeIndex)}
        >
          <SwiperSlide>
            <Card className="backdrop-blur-xl bg-white/10 border-purple-500/20 animate-rotate-in shadow-[0_8px_32px_rgba(31,38,135,0.37)]">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  {authMode === 'login' ? (
                    <>
                      <LogIn className="h-5 w-5 text-purple-400" /> 
                      Entrar
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-5 w-5 text-purple-400" /> 
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
                    <Label htmlFor="email" className="text-sm text-gray-300">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="bg-white/5 border-purple-500/20 text-white placeholder:text-gray-400 focus:border-purple-500/50"
                      placeholder="seuemail@exemplo.com"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm text-gray-300">Senha</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="bg-white/5 border-purple-500/20 text-white placeholder:text-gray-400 focus:border-purple-500/50 pr-10"
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
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium transition-all duration-300 transform hover:scale-[1.02]"
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
                        className="text-purple-400 hover:text-purple-300 hover:underline font-medium transition-colors"
                      >
                        Cadastre-se
                      </button>
                    </>
                  ) : (
                    <>
                      Já tem uma conta?{' '}
                      <button
                        onClick={() => setAuthMode('login')}
                        className="text-purple-400 hover:text-purple-300 hover:underline font-medium transition-colors"
                      >
                        Faça login
                      </button>
                    </>
                  )}
                </div>
                <div className="flex gap-2 w-full">
                  <Button 
                    variant="ghost" 
                    onClick={() => document.querySelectorAll('.swiper-slide')[1]?.classList.add('swiper-slide-active')}
                    className="flex-1 text-gray-300 hover:text-white hover:bg-white/5"
                  >
                    Mais Informações <Info className="ml-2 h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost"
                    onClick={() => window.open('https://api.whatsapp.com/send?phone=556392437559&text=SUPORTE', '_blank')}
                    className="flex-1 text-gray-300 hover:text-white hover:bg-white/5"
                  >
                    Suporte <MessageCircle className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </SwiperSlide>

          <SwiperSlide>
            <Card className="backdrop-blur-xl bg-white/10 border-purple-500/20 animate-slide-up">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Info className="h-5 w-5 text-purple-400" /> 
                  Sobre o PrescrevaMe
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Conheça nossa plataforma inovadora
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-gray-300">
                <div className="space-y-2">
                  <h3 className="font-medium text-white flex items-center">
                    <Heart className="h-4 w-4 text-prescrevame mr-2" /> Missão
                  </h3>
                  <p>
                    Facilitar o trabalho dos profissionais de saúde através de uma plataforma 
                    inteligente que auxilia na prescrição médica de forma precisa e eficiente.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-medium text-white flex items-center">
                    <ChevronRight className="h-4 w-4 text-prescrevame mr-2" /> Recursos
                  </h3>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>Prescrições médicas simplificadas</li>
                    <li>Consulta rápida de medicamentos e dosagens</li>
                    <li>Cálculos de dosagens automáticos</li>
                    <li>Interface intuitiva estilo WhatsApp</li>
                    <li>Suporte técnico especializado</li>
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-medium text-white flex items-center">
                    <ChevronRight className="h-4 w-4 text-prescrevame mr-2" /> Benefícios
                  </h3>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>Economia de tempo no atendimento</li>
                    <li>Redução de erros na prescrição</li>
                    <li>Acesso rápido a informações essenciais</li>
                    <li>Interface moderna e intuitiva</li>
                    <li>Atualização constante da base de dados</li>
                  </ul>
                </div>
              </CardContent>
              <CardFooter className="flex justify-center pt-2">
                <Button 
                  variant="ghost"
                  onClick={() => document.querySelectorAll('.swiper-slide')[0]?.classList.add('swiper-slide-active')}
                  className="text-gray-300 hover:text-white hover:bg-white/5"
                >
                  Voltar para login
                </Button>
              </CardFooter>
            </Card>
          </SwiperSlide>
        </Swiper>
      </div>

      <footer className="fixed bottom-4 text-gray-400 text-xs text-center w-full">
        © {new Date().getFullYear()} PrescrevaMe. Todos os direitos reservados.
      </footer>
      
      {/* Decorative background elements */}
      <div className="fixed top-20 left-10 w-40 h-40 rounded-full bg-purple-500/5 blur-3xl"></div>
      <div className="fixed bottom-20 right-10 w-60 h-60 rounded-full bg-blue-500/10 blur-3xl"></div>
    </div>
  );
};

export default Auth;
