
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { ArrowLeft, RefreshCw, Link } from 'lucide-react';

interface MagicLinkProps {
  onBack: () => void;
}

const MagicLink: React.FC<MagicLinkProps> = ({ onBack }) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { sendMagicLink } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, informe seu email.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await sendMagicLink(email);
      toast({
        title: "Link mágico enviado",
        description: "Verifique sua caixa de entrada para fazer login.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao enviar link mágico.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
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
        <h2 className="text-xl font-semibold text-white">Login com Link Mágico</h2>
      </div>
      
      <p className="text-sm text-gray-300">
        Receba um link por email para fazer login sem senha.
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="magic-email" className="text-gray-300">Email</Label>
          <Input
            id="magic-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seuemail@exemplo.com"
            className="bg-whatsapp-inputBg border-none text-white placeholder:text-gray-400"
            disabled={isSubmitting}
          />
        </div>
        
        <Button 
          type="submit" 
          className="w-full bg-prescrevame hover:bg-prescrevame-dark text-white font-medium transition-all"
          disabled={isSubmitting}
        >
          {isSubmitting ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : null}
          <Link className="mr-2 h-4 w-4" />
          Enviar Link Mágico
        </Button>
      </form>
    </div>
  );
};

export default MagicLink;
