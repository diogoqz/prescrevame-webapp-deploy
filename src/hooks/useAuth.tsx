
import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { inviteService } from '@/services/inviteService';
import { userService } from '@/services/userService';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, inviteCode: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  sendPasswordResetEmail: (email: string) => Promise<void>;
  validateInviteCode: (code: string) => Promise<boolean>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;

    // Verificar status do usuário após login bem-sucedido
    const userStatus = await userService.getUserStatus(email);
    if (userStatus === 'bloqueado') {
      // Fazer logout do usuário bloqueado
      await supabase.auth.signOut();
      throw new Error('Sua conta foi bloqueada. Entre em contato com o suporte.');
    }
  };

  const signUp = async (email: string, password: string, inviteCode: string) => {
    try {
      // Validar código de convite
      const invite = await inviteService.validateInviteCode(inviteCode);
      if (!invite) {
        throw new Error('Código de convite inválido ou já utilizado');
      }

      // Registrar usuário no Supabase Auth
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            invite_code: inviteCode,
          },
        },
      });
      
      if (signUpError) throw signUpError;

      // Marcar convite como usado e criar/atualizar usuário na tabela customizada
      const useInviteSuccess = await inviteService.useInvite(inviteCode, email);
      if (!useInviteSuccess) {
        throw new Error('Erro ao processar convite. Tente novamente.');
      }
    } catch (error) {
      // Se houver erro, tentar reverter o cadastro no Auth se foi criado
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/auth?oauth=google'
      }
    });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const sendPasswordResetEmail = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/auth?reset=true',
    });
    if (error) throw error;
  };

  const validateInviteCode = async (code: string): Promise<boolean> => {
    try {
      const invite = await inviteService.validateInviteCode(code);
      return invite !== null;
    } catch (error) {
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      signIn, 
      signUp, 
      signInWithGoogle,
      signOut,
      sendPasswordResetEmail,
      validateInviteCode,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
