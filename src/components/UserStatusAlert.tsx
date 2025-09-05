import React from 'react';
import { useUserStatus } from '@/hooks/useUserStatus';
import { useAuth } from '@/hooks/useAuth';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Clock, CheckCircle, XCircle } from 'lucide-react';

export const UserStatusAlert: React.FC = () => {
  const { user } = useAuth();
  const { status, isExpired, daysRemaining, loading } = useUserStatus();

  if (!user || loading) {
    return null;
  }

  // Usuário bloqueado
  if (status === 'bloqueado') {
    return (
      <Alert variant="destructive" className="mb-4">
        <XCircle className="h-4 w-4" />
        <AlertTitle>Conta Bloqueada</AlertTitle>
        <AlertDescription>
          Sua conta foi bloqueada. Entre em contato com o suporte para mais informações.
        </AlertDescription>
      </Alert>
    );
  }

  // Usuário expirado
  if (isExpired) {
    return (
      <Alert variant="destructive" className="mb-4">
        <Clock className="h-4 w-4" />
        <AlertTitle>Sua Assinatura Expirou</AlertTitle>
        <AlertDescription>
          Sua assinatura expirou. Entre em contato para renovar seu acesso.
        </AlertDescription>
      </Alert>
    );
  }

  // Usuário ativo com dias restantes
  if (status === 'ativo' && daysRemaining !== null) {
    if (daysRemaining <= 7) {
      return (
        <Alert variant="default" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Assinatura Expirando</AlertTitle>
          <AlertDescription>
            Sua assinatura expira em {daysRemaining} {daysRemaining === 1 ? 'dia' : 'dias'}.
            Entre em contato para renovar.
          </AlertDescription>
        </Alert>
      );
    }

    if (daysRemaining <= 30) {
      return (
        <Alert variant="default" className="mb-4">
          <Clock className="h-4 w-4" />
          <AlertTitle>Assinatura Ativa</AlertTitle>
          <AlertDescription>
            Sua assinatura expira em {daysRemaining} {daysRemaining === 1 ? 'dia' : 'dias'}.
          </AlertDescription>
        </Alert>
      );
    }
  }

  // Usuário ativo sem expiração ou com muitos dias restantes
  if (status === 'ativo') {
    return (
      <Alert variant="default" className="mb-4">
        <CheckCircle className="h-4 w-4" />
        <AlertTitle>Conta Ativa</AlertTitle>
        <AlertDescription>
          Sua conta está ativa e funcionando normalmente.
          {daysRemaining && daysRemaining > 30 && (
            <span> Expira em {daysRemaining} dias.</span>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}; 