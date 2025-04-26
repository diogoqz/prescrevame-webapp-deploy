
import React from 'react';
import { LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LoginPromptProps {
  onLogin: () => void;
}

export const LoginPrompt = ({ onLogin }: LoginPromptProps) => {
  return (
    <div className="flex-1 text-center">
      <Button
        onClick={onLogin}
        className="py-2 px-4 bg-prescrevame text-black rounded-md text-sm font-medium transition-colors hover:bg-prescrevame-dark flex items-center justify-center gap-2 w-full animate-fade-in"
      >
        <LogIn size={20} />
        Faça login para enviar mensagens
      </Button>
    </div>
  );
};
