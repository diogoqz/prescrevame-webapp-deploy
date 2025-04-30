
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, LogIn, UserPlus } from 'lucide-react';
import { MessageCircle } from 'lucide-react';

interface AuthCardProps {
  authMode: 'login' | 'signup';
  email: string;
  password: string;
  showPassword: boolean;
  onEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTogglePassword: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onModeChange: () => void;
  onSupport: () => void;
}

const AuthCard: React.FC<AuthCardProps> = ({
  authMode,
  email,
  password,
  showPassword,
  onEmailChange,
  onPasswordChange,
  onTogglePassword,
  onSubmit,
  onModeChange,
  onSupport
}) => {
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
            : "Crie uma conta para começar"
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
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
        </form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4 pt-2">
        <div className="text-sm text-center text-gray-300">
          {authMode === 'login' ? (
            <>
              Não tem uma conta?{' '}
              <button
                onClick={onModeChange}
                className="text-prescrevame hover:text-prescrevame-light font-medium transition-colors"
              >
                Cadastre-se
              </button>
            </>
          ) : (
            <>
              Já tem uma conta?{' '}
              <button
                onClick={onModeChange}
                className="text-prescrevame hover:text-prescrevame-light font-medium transition-colors"
              >
                Faça login
              </button>
            </>
          )}
        </div>
        <Button 
          variant="ghost"
          onClick={onSupport}
          className="w-full text-gray-300 hover:text-white hover:bg-whatsapp-inputBg"
        >
          Suporte <MessageCircle className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AuthCard;
