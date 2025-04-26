
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { ArrowLeft, Eye, EyeOff, RefreshCw } from 'lucide-react';
import PhoneInput from './PhoneInput';

interface PhoneAuthProps {
  authMode: 'login' | 'signup';
  onBack: () => void;
}

const PhoneAuth: React.FC<PhoneAuthProps> = ({ authMode, onBack }) => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { toast } = useToast();
  const { signInWithPhone, signUpWithPhone } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phone) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, informe seu telefone.",
        variant: "destructive",
      });
      return;
    }
    
    if (!password) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, informe sua senha.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (authMode === 'login') {
        await signInWithPhone(phone, password);
        toast({
          title: "Sucesso!",
          description: "Login realizado com sucesso.",
        });
      } else {
        await signUpWithPhone(phone, password);
        toast({
          title: "Conta criada!",
          description: "Seu cadastro foi realizado com sucesso.",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro durante a autenticação.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onBack} 
          className="text-gray-400 hover:text-white"
        >
          <ArrowLeft size={20} />
        </Button>
        <h2 className="text-xl font-semibold text-white">
          {authMode === 'login' ? 'Login com Telefone' : 'Cadastro com Telefone'}
        </h2>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <PhoneInput
          value={phone}
          onChange={setPhone}
          disabled={isSubmitting}
        />
        
        <div className="space-y-2">
          <Label htmlFor="phone-password" className="text-gray-300">Senha</Label>
          <div className="relative">
            <Input
              id="phone-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-whatsapp-inputBg border-none text-white placeholder:text-gray-400 pr-10"
              placeholder="********"
              disabled={isSubmitting}
            />
            <button
              type="button"
              onClick={togglePassword}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
        
        <Button 
          type="submit" 
          className="w-full bg-prescrevame hover:bg-prescrevame-dark text-white font-medium transition-all"
          disabled={isSubmitting}
        >
          {isSubmitting ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : null}
          {authMode === 'login' ? 'Entrar com Telefone' : 'Cadastrar com Telefone'}
        </Button>
      </form>
    </div>
  );
};

export default PhoneAuth;
