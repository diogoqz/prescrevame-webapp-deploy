import React, { useState, useEffect } from 'react';
import { useUserStatus } from '@/hooks/useUserStatus';
import { userService } from '@/services/userService';

interface TrialExpirationCounterProps {
  userEmail: string | null;
}

export const TrialExpirationCounter: React.FC<TrialExpirationCounterProps> = ({ userEmail }) => {
  const { expiresAt, isExpired, daysRemaining, loading } = useUserStatus();
  const [isTrial, setIsTrial] = useState<boolean>(false);
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  // Verificar se o usuário é trial
  useEffect(() => {
    const checkTrialStatus = async () => {
      if (userEmail) {
        const trialStatus = await userService.getUserIsTrial(userEmail);
        setIsTrial(trialStatus);
      }
    };

    checkTrialStatus();
  }, [userEmail]);

  // Calcular tempo restante em tempo real
  useEffect(() => {
    if (!expiresAt || isExpired || !isTrial) {
      setTimeRemaining('');
      return;
    }

    const updateTimeRemaining = () => {
      const now = new Date();
      const expirationDate = new Date(expiresAt);
      const diffMs = expirationDate.getTime() - now.getTime();

      if (diffMs <= 0) {
        setTimeRemaining('');
        return;
      }

      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

      if (hours > 24) {
        const days = Math.floor(hours / 24);
        const remainingHours = hours % 24;
        setTimeRemaining(`${days}d ${remainingHours}h`);
      } else if (hours > 0) {
        setTimeRemaining(`${hours}h ${minutes}m`);
      } else {
        setTimeRemaining(`${minutes}m`);
      }
    };

    // Atualizar imediatamente
    updateTimeRemaining();

    // Atualizar a cada minuto
    const interval = setInterval(updateTimeRemaining, 60000);

    return () => clearInterval(interval);
  }, [expiresAt, isExpired, isTrial]);

  // Não exibir se não for trial, estiver expirado ou carregando
  if (loading || !isTrial || isExpired || !timeRemaining) {
    return null;
  }

  return (
    <div className="flex items-center justify-center py-2 px-3 bg-whatsapp-bubbleReceived/20 border-t border-whatsapp-bubbleReceived/30">
      <div className="flex items-center gap-2 text-xs text-whatsapp-textSecondary">
        <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
        <span>
          Seu teste grátis expira em <span className="font-semibold text-yellow-400">{timeRemaining}</span>
        </span>
      </div>
    </div>
  );
};
