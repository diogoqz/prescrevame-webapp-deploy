import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UserPlus, Clock, CheckCircle, Stethoscope, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { webhookService } from '@/services/webhookService';

// Schema de validação com Zod
const trialSignupSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  senha: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  cpf: z.string()
    .regex(/^\d{11}$/, 'CPF deve conter exatamente 11 números')
    .refine((cpf) => {
      // Validação básica de CPF
      if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
      
      let sum = 0;
      for (let i = 0; i < 9; i++) {
        sum += parseInt(cpf[i]) * (10 - i);
      }
      let digit1 = 11 - (sum % 11);
      if (digit1 > 9) digit1 = 0;
      
      sum = 0;
      for (let i = 0; i < 10; i++) {
        sum += parseInt(cpf[i]) * (11 - i);
      }
      let digit2 = 11 - (sum % 11);
      if (digit2 > 9) digit2 = 0;
      
      return digit1 === parseInt(cpf[9]) && digit2 === parseInt(cpf[10]);
    }, 'CPF inválido'),
  whatsapp: z.string()
    .regex(/^\d{10,11}$/, 'WhatsApp deve conter 10 ou 11 números (sem código do país)'),
  profissao: z.enum(['estudante_medicina', 'medico'], {
    errorMap: () => ({ message: 'Apenas médicos e estudantes de medicina podem se cadastrar' })
  })
});

type TrialSignupForm = z.infer<typeof trialSignupSchema>;

const Trial = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<TrialSignupForm>({
    resolver: zodResolver(trialSignupSchema)
  });

  const profissao = watch('profissao');

  const formatCPF = (value: string) => {
    return value.replace(/\D/g, '').slice(0, 11);
  };

  const formatWhatsApp = (value: string) => {
    return value.replace(/\D/g, '').slice(0, 11);
  };

  const handleGoogleSignIn = async () => {
    try {
      if (user) {
        toast({
          title: 'Você já está logado',
          description: 'Redirecionando para o app...',
        });
        navigate('/', { replace: true });
        return;
      }
      const redirectTo = `${window.location.origin}/trial?oauth=google`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      if (error) throw error;
    } catch (error: any) {
      toast({
        title: 'Erro no Google Sign-In',
        description: error.message || 'Não foi possível autenticar com Google.',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    if (user) {
      toast({
        title: 'Você já está logado',
        description: 'Trial é apenas para novos usuários. Redirecionando...',
      });
      navigate('/', { replace: true });
      return;
    }

    const completeGoogleTrial = async () => {
      const params = new URLSearchParams(window.location.search);
      const isGoogle = params.get('oauth') === 'google';
      if (!isGoogle) return;

      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;
      if (!user) return;

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

        setIsSuccess(true);
        toast({
          title: 'Trial iniciado com Google! ',
          description: 'Você tem 24 horas de acesso grátis.',
        });

        // limpa o parâmetro da URL e redireciona para login
        setTimeout(() => {
          navigate('/auth', { replace: true });
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
  }, [navigate, toast, user]);

  const onSubmit = async (data: TrialSignupForm) => {
    setIsLoading(true);
    
    try {
      // 1. Registrar usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.senha,
        options: {
          data: {
            nome: data.nome,
            cpf: data.cpf,
            whatsapp: data.whatsapp,
            profissao: data.profissao,
            is_trial: true
          }
        }
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error('Erro ao criar usuário');
      }

      // 2. Criar registro na tabela users com dados de trial
      const trialStartsAt = new Date();
      const trialExpiresAt = new Date(trialStartsAt.getTime() + 24 * 60 * 60 * 1000); // 1 dia

      const { error: userError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: data.email,
          nome: data.nome,
          cpf: data.cpf,
          whatsapp: data.whatsapp,
          profissao: data.profissao,
          status: 'ativo',
          is_trial: true,
          trial_started_at: trialStartsAt.toISOString(),
          trial_expires_at: trialExpiresAt.toISOString(),
          invite_type: 'trial',
          days_valid: 1,
          activated_at: trialStartsAt.toISOString(),
          expires_at: trialExpiresAt.toISOString()
        });

      if (userError) throw userError;

      // 3. Disparar webhook de trial criado (via formulário)
      await webhookService.sendTrialCreated({
        type: 'trial_created',
        user: {
          id: authData.user.id,
          email: data.email,
          nome: data.nome,
          cpf: data.cpf,
          whatsapp: data.whatsapp,
          profissao: data.profissao,
        },
        trial: {
          started_at: trialStartsAt.toISOString(),
          expires_at: trialExpiresAt.toISOString(),
          days_valid: 1,
          invite_type: 'trial',
        },
        source: 'form',
      });

      setIsSuccess(true);
      
      toast({
        title: "Trial iniciado com sucesso!",
        description: "Você tem 24 horas de acesso grátis. Verifique seu email para confirmar a conta.",
      });

      // Redirecionar após 3 segundos
      setTimeout(() => {
        navigate('/auth');
      }, 3000);

    } catch (error: any) {
      console.error('Erro no cadastro de trial:', error);
      toast({
        title: "Erro no cadastro",
        description: error.message || "Ocorreu um erro. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-[100dvh] w-screen flex items-center justify-center bg-whatsapp-bg relative overflow-hidden">
        {/* Background elements igual ao login */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-prescrevame/5 rounded-full blur-3xl animate-blob"></div>
          <div className="absolute top-[20%] right-[20%] w-[400px] h-[400px] bg-prescrevame-light/10 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-prescrevame/10 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
          <div className="absolute top-[40%] left-[30%] w-[200px] h-[200px] bg-prescrevame-accent/5 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute bottom-[20%] left-[10%] w-[300px] h-[300px] bg-prescrevame-highlight/5 rounded-full blur-2xl animate-pulse animation-delay-3000"></div>
          <div className="absolute inset-0 bg-[radial-gradient(#57D789_1px,transparent_1px)] opacity-10 [background-size:20px_20px]"></div>
        </div>

        <div className="w-full max-w-md px-4 py-8 z-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <Card className="bg-whatsapp-bubbleReceived border-none shadow-lg">
              <CardContent className="pt-6 text-center">
                <CheckCircle className="h-16 w-16 text-prescrevame mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">Trial Ativado!</h2>
                <p className="text-gray-400 mb-4">
                  Seu período de teste de 24 horas foi iniciado com sucesso.
                </p>
                <p className="text-sm text-gray-500">
                  Redirecionando para o login...
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] w-screen flex items-center justify-center bg-whatsapp-bg relative overflow-hidden">
      {/* Background elements igual ao login */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-prescrevame/5 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute top-[20%] right-[20%] w-[400px] h-[400px] bg-prescrevame-light/10 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-prescrevame/10 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
        <div className="absolute top-[40%] left-[30%] w-[200px] h-[200px] bg-prescrevame-accent/5 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-[20%] left-[10%] w-[300px] h-[300px] bg-prescrevame-highlight/5 rounded-full blur-2xl animate-pulse animation-delay-3000"></div>
        <div className="absolute inset-0 bg-[radial-gradient(#57D789_1px,transparent_1px)] opacity-10 [background-size:20px_20px]"></div>
      </div>

      <div className="w-full max-w-md px-4 py-8 z-10">
        {/* Header igual ao login */}
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
            O guia oficial do médico atualizado.
          </motion.p>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-gray-400 mt-2"
          >
            Teste grátis de 24 horas.
          </motion.p>
        </motion.div>

        {/* Card do formulário */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="transform transition-all duration-500"
        >
          <Card className="bg-whatsapp-bubbleReceived border-none shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="text-center pb-4">
              {/* Banner de informação */}
              <div className="bg-prescrevame/10 border border-prescrevame/20 rounded-lg p-3 mb-4">
                <div className="flex items-center justify-center gap-2 text-prescrevame">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    Apenas médicos e estudantes de medicina
                  </span>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {/* Google Sign-In em destaque */}
              <div className="space-y-3 mb-6">
                <Button
                  type="button"
                  onClick={handleGoogleSignIn}
                  className="w-full bg-white text-gray-900 hover:bg-gray-100 font-semibold py-3 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Continuar com Google (recomendado)
                </Button>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-whatsapp-inputBg"></span>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-whatsapp-bubbleReceived px-2 text-whatsapp-textSecondary">ou preencha o formulário</span>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Nome Completo */}
                <div>
                  <Label htmlFor="nome" className="text-whatsapp-text">Nome Completo</Label>
                  <Input
                    id="nome"
                    type="text"
                    placeholder="Seu nome completo"
                    {...register('nome')}
                    className={`bg-whatsapp-inputBg border-whatsapp-inputBg text-whatsapp-text placeholder:text-whatsapp-textSecondary ${
                      errors.nome ? 'border-red-500' : 'focus:border-prescrevame'
                    }`}
                  />
                  {errors.nome && (
                    <p className="text-red-400 text-sm mt-1">{errors.nome.message}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <Label htmlFor="email" className="text-whatsapp-text">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seuemail@exemplo.com"
                    {...register('email')}
                    className={`bg-whatsapp-inputBg border-whatsapp-inputBg text-whatsapp-text placeholder:text-whatsapp-textSecondary ${
                      errors.email ? 'border-red-500' : 'focus:border-prescrevame'
                    }`}
                  />
                  {errors.email && (
                    <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>
                  )}
                </div>

                {/* Senha */}
                <div>
                  <Label htmlFor="senha" className="text-whatsapp-text">Senha</Label>
                  <div className="relative">
                    <Input
                      id="senha"
                      type={showPassword ? "text" : "password"}
                      placeholder="Mínimo 6 caracteres"
                      {...register('senha')}
                      className={`bg-whatsapp-inputBg border-whatsapp-inputBg text-whatsapp-text placeholder:text-whatsapp-textSecondary pr-10 ${
                        errors.senha ? 'border-red-500' : 'focus:border-prescrevame'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-whatsapp-textSecondary hover:text-whatsapp-text"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.senha && (
                    <p className="text-red-400 text-sm mt-1">{errors.senha.message}</p>
                  )}
                </div>

                {/* CPF */}
                <div>
                  <Label htmlFor="cpf" className="text-whatsapp-text">CPF</Label>
                  <Input
                    id="cpf"
                    type="text"
                    placeholder="Apenas números (11 dígitos)"
                    {...register('cpf')}
                    onChange={(e) => {
                      const formatted = formatCPF(e.target.value);
                      setValue('cpf', formatted);
                    }}
                    className={`bg-whatsapp-inputBg border-whatsapp-inputBg text-whatsapp-text placeholder:text-whatsapp-textSecondary ${
                      errors.cpf ? 'border-red-500' : 'focus:border-prescrevame'
                    }`}
                  />
                  {errors.cpf && (
                    <p className="text-red-400 text-sm mt-1">{errors.cpf.message}</p>
                  )}
                </div>

                {/* WhatsApp */}
                <div>
                  <Label htmlFor="whatsapp" className="text-whatsapp-text">WhatsApp</Label>
                  <Input
                    id="whatsapp"
                    type="text"
                    placeholder="DDD + número (ex: 11987654321)"
                    {...register('whatsapp')}
                    onChange={(e) => {
                      const formatted = formatWhatsApp(e.target.value);
                      setValue('whatsapp', formatted);
                    }}
                    className={`bg-whatsapp-inputBg border-whatsapp-inputBg text-whatsapp-text placeholder:text-whatsapp-textSecondary ${
                      errors.whatsapp ? 'border-red-500' : 'focus:border-prescrevame'
                    }`}
                  />
                  {errors.whatsapp && (
                    <p className="text-red-400 text-sm mt-1">{errors.whatsapp.message}</p>
                  )}
                </div>

                {/* Profissão */}
                <div>
                  <Label htmlFor="profissao" className="text-whatsapp-text">Profissão</Label>
                  <Select onValueChange={(value) => setValue('profissao', value as any)}>
                    <SelectTrigger className={`bg-whatsapp-inputBg border-whatsapp-inputBg text-whatsapp-text ${
                      errors.profissao ? 'border-red-500' : 'focus:border-prescrevame'
                    }`}>
                      <SelectValue placeholder="Selecione sua profissão" />
                    </SelectTrigger>
                    <SelectContent className="bg-whatsapp-bubbleReceived border-whatsapp-inputBg">
                      <SelectItem value="estudante_medicina" className="text-whatsapp-text hover:bg-whatsapp-inputBg">
                        Estudante de Medicina
                      </SelectItem>
                      <SelectItem value="medico" className="text-whatsapp-text hover:bg-whatsapp-inputBg">
                        Médico
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.profissao && (
                    <p className="text-red-400 text-sm mt-1">{errors.profissao.message}</p>
                  )}
                </div>

                {/* Botão de Submit */}
                <Button 
                  type="submit" 
                  className="w-full bg-prescrevame hover:bg-prescrevame-dark text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Criando sua conta trial...
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Iniciar Trial Gratuito
                    </>
                  )}
                </Button>

                

                {/* Link para login */}
                <div className="text-center pt-4">
                  <p className="text-sm text-whatsapp-textSecondary">
                    Já tem uma conta?{' '}
                    <button
                      type="button"
                      onClick={() => navigate('/auth')}
                      className="text-prescrevame hover:text-prescrevame-light transition-colors"
                    >
                      Fazer login
                    </button>
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Footer igual ao login */}
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

export default Trial;
