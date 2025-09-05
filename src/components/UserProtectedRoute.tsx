import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserStatus } from '@/hooks/useUserStatus';

interface UserProtectedRouteProps {
  children: React.ReactNode;
}

const UserProtectedRoute: React.FC<UserProtectedRouteProps> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const { status, isExpired, loading: statusLoading } = useUserStatus();

  // Aguardar carregamento
  if (authLoading || statusLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-prescrevame mx-auto mb-4"></div>
          <p className="text-white">Verificando status da conta...</p>
        </div>
      </div>
    );
  }

  // Se não há usuário, redirecionar para login
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Se usuário está bloqueado, redirecionar para página de bloqueio
  if (status === 'bloqueado') {
    return <Navigate to="/blocked" replace />;
  }

  // Se usuário está expirado, redirecionar para página de expiração
  if (isExpired) {
    return <Navigate to="/expired" replace />;
  }

  // Se tudo está ok, renderizar o conteúdo
  return <>{children}</>;
};

export default UserProtectedRoute; 