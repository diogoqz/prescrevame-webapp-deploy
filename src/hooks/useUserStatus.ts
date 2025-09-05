import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

interface UserStatus {
  status: 'ativo' | 'bloqueado' | null;
  expiresAt: string | null;
  daysValid: number | null;
  isExpired: boolean;
  daysRemaining: number | null;
}

export const useUserStatus = () => {
  const { user } = useAuth();
  const [userStatus, setUserStatus] = useState<UserStatus>({
    status: null,
    expiresAt: null,
    daysValid: null,
    isExpired: false,
    daysRemaining: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserStatus = async () => {
      if (!user?.email) {
        setUserStatus({
          status: null,
          expiresAt: null,
          daysValid: null,
          isExpired: false,
          daysRemaining: null
        });
        setLoading(false);
        return;
      }

      try {
        // Buscar dados completos do usuário
        const { data: userData, error } = await supabase
          .from('users')
          .select('status, expires_at, days_valid')
          .eq('email', user.email)
          .single();

        if (error || !userData) {
          setLoading(false);
          return;
        }

        const now = new Date();
        const expiresAt = userData.expires_at ? new Date(userData.expires_at) : null;
        const isExpired = expiresAt ? now > expiresAt : false;
        const daysRemaining = expiresAt ? Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null;

        setUserStatus({
          status: userData.status as 'ativo' | 'bloqueado',
          expiresAt: userData.expires_at,
          daysValid: userData.days_valid,
          isExpired,
          daysRemaining
        });
      } catch (error) {
        // Silenciar erros
      } finally {
        setLoading(false);
      }
    };

    checkUserStatus();

    // Verificar status a cada 5 minutos
    const interval = setInterval(checkUserStatus, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [user?.email]);

  return {
    ...userStatus,
    loading
  };
}; 