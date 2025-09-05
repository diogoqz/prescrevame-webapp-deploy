import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

// Senha admin deve estar em variável de ambiente
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || '517417';

export const useAdminAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Verificar se já está autenticado no localStorage
    const adminAuth = localStorage.getItem('admin-auth');
    if (adminAuth) {
      try {
        const { timestamp, hash } = JSON.parse(adminAuth);
        const now = Date.now();
        const sessionDuration = 8 * 60 * 60 * 1000; // 8 horas
        
        // Verificar se a sessão ainda é válida
        if (now - timestamp < sessionDuration) {
          setIsAuthenticated(true);
        } else {
          // Sessão expirada, limpar
          localStorage.removeItem('admin-auth');
        }
      } catch (error) {
        localStorage.removeItem('admin-auth');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (password: string): Promise<boolean> => {
    // Simular delay para prevenir brute force
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (password === ADMIN_PASSWORD) {
      // Criar hash simples para sessão
      const timestamp = Date.now();
      const sessionData = {
        timestamp,
        hash: btoa(`admin-${timestamp}`) // Base64 simples
      };
      
      localStorage.setItem('admin-auth', JSON.stringify(sessionData));
      setIsAuthenticated(true);
      
      toast({
        title: "Login realizado",
        description: "Bem-vindo ao painel administrativo.",
      });
      
      return true;
    } else {
      toast({
        title: "Senha incorreta",
        description: "Verifique a senha e tente novamente.",
        variant: "destructive"
      });
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('admin-auth');
    setIsAuthenticated(false);
    
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado do painel administrativo.",
    });
  };

  return {
    isAuthenticated,
    isLoading,
    login,
    logout
  };
}; 