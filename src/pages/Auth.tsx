
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';
import AuthCard from '@/components/auth/AuthCard';
import { Stethoscope } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

  const handleModeChange = () => {
    setAuthMode(prevMode => prevMode === 'login' ? 'signup' : 'login');
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
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-gray-400 mt-2"
          >
            Sua plataforma de assistência médica inteligente
          </motion.p>
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
                showPassword={showPassword}
                onEmailChange={(e) => setEmail(e.target.value)}
                onPasswordChange={(e) => setPassword(e.target.value)}
                onTogglePassword={() => setShowPassword(!showPassword)}
                onSubmit={handleSubmit}
                onModeChange={handleModeChange}
                onSupport={handleSupport}
              />
            </Card>
          </motion.div>
        </AnimatePresence>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
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
