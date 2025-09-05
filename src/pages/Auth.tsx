
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AuthCard from '@/components/auth/AuthCard';
import { Stethoscope, Clock, Chrome, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { webhookService } from '@/services/webhookService';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const { signIn, signUp, signInWithGoogle, signInWithGoogleTrial, user, validateInviteCode } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Verificar se há código de convite na URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const inviteFromUrl = urlParams.get('invite');
    if (inviteFromUrl) {
      setInviteCode(inviteFromUrl);
      setAuthMode('signup');
    }
  }, []);

  // Processar retorno do Google OAuth para trial
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const oauthType = urlParams.get('oauth');
    
    if (oauthType === 'trial' && user) {
      const completeGoogleTrial = async () => {
        try {
          // Verifica se já existe registro em users
          const { data: existing, error: fetchErr } = await supabase
            .from('users')
            .select('id')
            .eq('id', user.id)
            .maybeSingle();

          if (fetchErr) throw fetchErr;

          if (!existing) {
            const trialStartsAt = new Date();
            const trialExpiresAt = new Date(trialStartsAt.getTime() + 24 * 60 * 60 * 1000);

            const nomeFromGoogle = (user.user_metadata?.full_name as string) || (user.user_metadata?.name as string) || 'Usuário Google';

            const { error: insertErr } = await supabase
              .from('users')
              .insert({
                id: user.id,
                email: user.email,
                nome: nomeFromGoogle,
                status: 'ativo',
                is_trial: true,
                trial_started_at: trialStartsAt.toISOString(),
                trial_expires_at: trialExpiresAt.toISOString(),
                invite_type: 'trial',
                days_valid: 1,
                activated_at: trialStartsAt.toISOString(),
                expires_at: trialExpiresAt.toISOString(),
              });

            if (insertErr) throw insertErr;

            // Disparar webhook (via Google OAuth)
            await webhookService.sendTrialCreated({
              type: 'trial_created',
              user: {
                id: user.id,
                email: user.email || '',
                nome: nomeFromGoogle,
              },
              trial: {
                started_at: trialStartsAt.toISOString(),
                expires_at: trialExpiresAt.toISOString(),
                days_valid: 1,
                invite_type: 'trial',
              },
              source: 'google',
            });
          }

          toast({
            title: 'Trial iniciado com Google!',
            description: 'Você tem 24 horas de acesso grátis.',
          });

          // Limpa o parâmetro da URL e redireciona para o app
          setTimeout(() => {
            navigate('/', { replace: true });
          }, 2000);
        } catch (err: any) {
          toast({
            title: 'Erro ao concluir trial com Google',
            description: err.message || 'Tente novamente.',
            variant: 'destructive',
          });
        }
      };

      void completeGoogleTrial();
    }
  }, [user, navigate, toast]);

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
        // Remover validação dupla - deixar apenas a validação dentro do signUp
        await signUp(email, password, inviteCode);
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

  const handleModeChange = () => {
    setAuthMode(prevMode => prevMode === 'login' ? 'signup' : 'login');
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      toast({
        title: "Redirecionando...",
        description: "Você será redirecionado para o Google.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao fazer login com Google",
        variant: "destructive",
      });
    }
  };

  const handleGoogleTrial = async () => {
    try {
      await signInWithGoogleTrial();
      toast({
        title: "Redirecionando...",
        description: "Você será redirecionado para o Google.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao fazer trial com Google",
        variant: "destructive",
      });
    }
  };

  const handleQuickTrial = () => {
    navigate('/trial');
  };

  return (
    <div className="min-h-[100dvh] w-screen flex items-center justify-center bg-whatsapp-bg relative overflow-hidden">
      {/* Enhanced Animated background elements */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-prescrevame/5 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute top-[20%] right-[20%] w-[400px] h-[400px] bg-prescrevame-light/10 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-prescrevame/10 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
        
        {/* Additional animated elements */}
        <div className="absolute top-[40%] left-[30%] w-[200px] h-[200px] bg-prescrevame-accent/5 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-[20%] left-[10%] w-[300px] h-[300px] bg-prescrevame-highlight/5 rounded-full blur-2xl animate-pulse animation-delay-3000"></div>
        
        {/* Animated dots background */}
        <div className="absolute inset-0 bg-[radial-gradient(#57D789_1px,transparent_1px)] opacity-10 [background-size:20px_20px]"></div>
      </div>

      <div className="w-full max-w-md px-4 py-8 z-10">
        <motion.div 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-8"
        >
          <div className="relative h-24 w-24 mx-auto mb-4 group">
            <motion.div 
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0.7, 1, 0.7] 
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut" 
              }}
              className="absolute inset-0 rounded-full bg-prescrevame/20 group-hover:animate-none transition-all duration-500"
            ></motion.div>
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="relative h-24 w-24 rounded-full overflow-hidden border-4 border-prescrevame shadow-lg"
            >
              <img
                src="https://i.ibb.co/7JbHrmdT/pm3.jpg"
                alt="PrescrevaMe Logo"
                className="h-full w-full object-cover"
              />
            </motion.div>
          </div>
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-4xl font-bold"
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-prescrevame to-prescrevame-light">
              Prescreva
            </span>
            <span className="text-white">.me</span>
          </motion.h1>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-gray-400 mt-2"
          >
            <p className="text-lg font-semibold text-white mb-1">
              Inteligência Artificial feita para médicos
            </p>
            <p className="text-sm">
              Seu colega de plantão 24/7 com guias confiáveis, discussão de casos e suporte clínico inteligente
            </p>
          </motion.div>
        </motion.div>

        {/* Box de Teste Grátis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mb-6"
        >
          <Card className="bg-whatsapp-bubbleReceived/95 border-none shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              {/* Badge de Destaque */}
              <div className="flex items-center justify-center mb-4">
                <div className="bg-prescrevame text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                  🎉 OFERTA ESPECIAL
                </div>
              </div>

              {/* Título Persuasivo */}
              <h2 className="text-2xl font-bold text-white text-center mb-2">
                Teste Grátis por 24 Horas!
              </h2>
              
              <p className="text-gray-300 text-center mb-6 text-sm">
                Experimente nossa IA médica sem compromisso. 
                <br />
                <span className="text-prescrevame font-semibold">Sem cartão de crédito necessário!</span>
              </p>

              {/* Benefícios */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="flex items-center gap-2 text-gray-300 text-sm">
                  <div className="w-2 h-2 bg-prescrevame rounded-full"></div>
                  <span>Acesso completo</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300 text-sm">
                  <div className="w-2 h-2 bg-prescrevame rounded-full"></div>
                  <span>IA médica avançada</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300 text-sm">
                  <div className="w-2 h-2 bg-prescrevame rounded-full"></div>
                  <span>Suporte 24/7</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300 text-sm">
                  <div className="w-2 h-2 bg-prescrevame rounded-full"></div>
                  <span>Cancele quando quiser</span>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="space-y-3">
                {/* Botão Google OAuth */}
                <Button
                  onClick={handleGoogleTrial}
                  variant="outline"
                  className="w-full bg-white hover:bg-gray-50 text-gray-900 border-gray-300 hover:border-gray-400 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold"
                >
                  <Chrome className="h-5 w-5 mr-3 text-blue-500" />
                  Cadastrar com Google
                </Button>

                {/* Botão Cadastro com Email */}
                <Button
                  onClick={handleQuickTrial}
                  className="w-full bg-gradient-to-r from-prescrevame to-prescrevame-light hover:from-prescrevame-dark hover:to-prescrevame text-white border-none transition-all duration-200 shadow-lg hover:shadow-xl font-semibold"
                >
                  <Zap className="h-5 w-5 mr-3" />
                  Cadastrar com Email
                </Button>
              </div>

              {/* Texto de Segurança */}
              <p className="text-gray-400 text-xs text-center mt-4">
                🔒 Exclusivo para médicos ou estudantes de medicina.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Divisor */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="relative my-6"
        >
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-600"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-3 bg-whatsapp-bg text-gray-400">ou se você já é cliente, faça login</span>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={authMode}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.4 }}
            className="transform transition-all duration-500"
          >
            <Card className="bg-whatsapp-bubbleReceived border-none shadow-lg hover:shadow-xl transition-all duration-300">
              <AuthCard
                authMode={authMode}
                email={email}
                password={password}
                inviteCode={inviteCode}
                showPassword={showPassword}
                onEmailChange={(e) => setEmail(e.target.value)}
                onPasswordChange={(e) => setPassword(e.target.value)}
                onInviteCodeChange={(e) => setInviteCode(e.target.value)}
                onTogglePassword={() => setShowPassword(!showPassword)}
                onSubmit={handleSubmit}
                onModeChange={handleModeChange}
                onSupport={handleSupport}
                onGoogleSignIn={handleGoogleSignIn}
              />
            </Card>
          </motion.div>
        </AnimatePresence>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
          className="mt-8 text-center"
        >
          <div className="flex items-center justify-center gap-2 text-gray-400">
            <Stethoscope className="h-5 w-5" />
            <span className="text-sm">Tecnologia a serviço da medicina</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
