
import { LogIn, LogOut, UserPlus, HeadphonesIcon } from 'lucide-react';
import { User } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface ChatHeaderProps {
  user: User | null;
  onSignOut: () => void;
}

export const ChatHeader = ({ user, onSignOut }: ChatHeaderProps) => {
  const [supportDialogOpen, setSupportDialogOpen] = useState(false);

  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-whatsapp-header">
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-whatsapp-accent flex items-center justify-center overflow-hidden animate-fade-in">
        <img
          src="/lovable-uploads/f9d8ee9c-efab-4f5c-98b5-b08a1a131d86.png"
          alt="Logo"
          className="w-full h-full object-cover rounded-full"
        />
      </div>

      <div className="flex-1">
        <h3 className="font-bold text-whatsapp-text">PrescrevaMe</h3>
        <p className="text-xs text-whatsapp-textSecondary">
          {user ? `Conectado - ${user.email}` : 'Faça login para continuar'}
        </p>
      </div>
      
      <Button 
        variant="ghost" 
        size="icon"
        onClick={() => setSupportDialogOpen(true)}
        className="rounded-full text-prescrevame hover:bg-prescrevame/10 hover:text-prescrevame-light tech-glow"
        title="Suporte"
      >
        <HeadphonesIcon size={22} />
      </Button>
      
      {user && (
        <button
          onClick={onSignOut}
          className="text-whatsapp-textSecondary hover:text-whatsapp-accent transition-colors flex items-center gap-2"
          title="Sair"
        >
          <LogOut size={24} />
        </button>
      )}
      
      {/* Support Dialog */}
      <Dialog open={supportDialogOpen} onOpenChange={setSupportDialogOpen}>
        <DialogContent className="tech-card border-prescrevame/30">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <HeadphonesIcon className="h-5 w-5 text-prescrevame" />
              Suporte PrescrevaMe
            </DialogTitle>
            <DialogDescription>
              Como podemos ajudar você?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-whatsapp-bubbleReceived rounded-lg">
              <h4 className="text-white font-medium mb-2">Contato</h4>
              <p className="text-sm text-gray-300">
                Entre em contato com nossa equipe de suporte técnico através do email: 
                <a href="mailto:suporte@prescreva.me" className="text-prescrevame ml-1 hover:underline">
                  suporte@prescreva.me
                </a>
              </p>
            </div>
            <div className="p-4 bg-whatsapp-bubbleReceived rounded-lg">
              <h4 className="text-white font-medium mb-2">Horário de Atendimento</h4>
              <p className="text-sm text-gray-300">
                Segunda a Sexta: 8h às 18h <br />
                Sábado: 9h às 13h
              </p>
            </div>
            <div className="p-4 bg-whatsapp-bubbleReceived rounded-lg">
              <h4 className="text-white font-medium mb-2">Ajuda Rápida</h4>
              <p className="text-sm text-gray-300 mb-2">
                Utilize os comandos abaixo no chat para acessar funções comuns:
              </p>
              <ul className="text-sm text-gray-300 space-y-1">
                <li><span className="text-prescrevame font-medium">LISTA</span> - Ver prescrições disponíveis</li>
                <li><span className="text-prescrevame font-medium">DOSES</span> - Consultar medicações</li>
                <li><span className="text-prescrevame font-medium">IMC</span> - Calcular o IMC</li>
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
