
import { LogIn, LogOut, UserPlus } from 'lucide-react';
import { User } from '@supabase/supabase-js';

interface ChatHeaderProps {
  user: User | null;
  onSignOut: () => void;
}

export const ChatHeader = ({ user, onSignOut }: ChatHeaderProps) => {
  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-whatsapp-header">
    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-whatsapp-accent flex items-center justify-center overflow-hidden">
  <img
    src="https://i.ibb.co/Fqqf1YF6/pme-logo-round.png"
    alt="Logo"
    className="w-full h-full object-cover rounded-full"
  />
</div>

      <div className="flex-1">
        <h3 className="font-bold text-whatsapp-text">PrescrevaMe</h3>
       <p className="text-xs text-whatsapp-textSecondary">
  {user ? `Conectado - ${user.name || user.email}` : 'Faça login para continuar'}
</p>

      </div>
      {user && (
        <button
          onClick={onSignOut}
          className="text-whatsapp-textSecondary hover:text-whatsapp-accent transition-colors flex items-center gap-2"
          title="Sair"
        >
          <LogOut size={24} />
        </button>
      )}
    </div>
  );
};
