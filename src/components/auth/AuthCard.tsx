
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, LogIn, UserPlus, MessageCircle, Mail, Chrome } from 'lucide-react';

interface AuthCardProps {
  authMode: 'login' | 'signup';
  email: string;
  password: string;
  inviteCode?: string;
  showPassword: boolean;
  onEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onInviteCodeChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTogglePassword: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onModeChange: () => void;
  onSupport: () => void;
  onGoogleSignIn?: () => void;
}

const AuthCard: React.FC<AuthCardProps> = ({
  authMode,
  email,
  password,
  inviteCode,
  showPassword,
  onEmailChange,
  onPasswordChange,
  onInviteCodeChange,
  onTogglePassword,
  onSubmit,
  onModeChange,
  onSupport,
  onGoogleSignIn
}) => {
  const [currentSupportPhrase, setCurrentSupportPhrase] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const supportPhrases = [
    "Precisa de ajuda? Fale com nosso atendente humano",
    "Dúvidas? Converse com um especialista do Prescrevame",
    "Time de suporte e vendas disponível 24/7 para você",
    "Fale diretamente com nossa equipe de suporte e vendas",
    "Dúvidas sobre o Prescrevame? Fale com um atendente humano",
    "Dúvidas? Converse com um de nossos atendentes de suporte e vendas",
    "Tire suas dúvidas com nosso time de suporte e vendas",
    "Nossa equipe está pronta para esclarecer suas dúvidas",
    "Atendimento humanizado, fale com nosso time de suporte e vendas",
    "Qualquer dúvida, fale com nosso time de suporte e vendas"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentSupportPhrase((prev) => (prev + 1) % supportPhrases.length);
        setIsTransitioning(false);
      }, 500);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
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
            : "Crie uma conta com código de convite"
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          {authMode === 'signup' && (
            <div className="space-y-2">
              <Label htmlFor="inviteCode" className="text-gray-300">Código de Convite</Label>
              <Input
                id="inviteCode"
                type="text"
                value={inviteCode || ''}
                onChange={onInviteCodeChange}
                required
                className="bg-whatsapp-inputBg border-none text-white placeholder:text-gray-400"
                placeholder="PRESCREVAME-2024-XXX"
              />
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-300">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={onEmailChange}
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
                onChange={onPasswordChange}
                required
                className="bg-whatsapp-inputBg border-none text-white placeholder:text-gray-400 pr-10"
                placeholder="********"
              />
              <button
                type="button"
                onClick={onTogglePassword}
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
          
          {/* Opções alternativas de login */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-whatsapp-bubbleReceived text-gray-400">ou</span>
            </div>
          </div>
          
          {/* Botão Google */}
          {onGoogleSignIn && (
            <Button
              type="button"
              onClick={onGoogleSignIn}
              variant="outline"
              className="w-full bg-white hover:bg-gray-50 text-gray-900 border-gray-300 hover:border-gray-400 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold"
            >
              <Chrome className="h-5 w-5 mr-3 text-blue-500" />
              {authMode === 'login' ? 'Entrar com Google' : 'Cadastrar com Google'}
            </Button>
          )}
          
        </form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4 pt-2">
        <div className="text-sm text-center text-gray-300">
          <div className="min-h-[2.5rem] flex items-center justify-center">
            <span className={`transition-all duration-500 ease-in-out ${
              isTransitioning ? 'opacity-0 transform translate-y-1' : 'opacity-100 transform translate-y-0'
            }`}>
              {supportPhrases[currentSupportPhrase]}
            </span>
          </div>
        </div>
        <Button 
          variant="ghost"
          onClick={onSupport}
          className="w-full text-gray-300 hover:text-white hover:bg-whatsapp-inputBg border border-gray-600/30 hover:border-gray-500/50 transition-all duration-300"
        >
          Suporte <MessageCircle className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AuthCard;
