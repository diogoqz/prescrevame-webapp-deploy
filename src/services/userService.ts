import { supabase } from '@/integrations/supabase/client';

export interface User {
  id: string;
  email: string;
  nome?: string;
  status: 'ativo' | 'bloqueado';
  created_at: string;
  updated_at: string;
  activated_at: string | null;
  expires_at: string | null;
  invite_type: string | null;
  days_valid: number | null;
}

class UserService {
  async getAllUsers(): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      return [];
    }
    return data || [];
  }

  async setUserStatus(id: string, status: 'ativo' | 'bloqueado'): Promise<boolean> {
    const { error } = await supabase
      .from('users')
      .update({ status })
      .eq('id', id);
    if (error) {
      return false;
    }
    return true;
  }

  async addDaysToUser(id: string, daysToAdd: number): Promise<boolean> {
    try {
      // Buscar usuário atual
      const { data: user, error: fetchError } = await supabase
        .from('users')
        .select('expires_at, days_valid')
        .eq('id', id)
        .single();

      if (fetchError || !user) {
        return false;
      }

      // Calcular nova data de expiração
      let newExpiresAt: Date;
      if (user.expires_at) {
        newExpiresAt = new Date(user.expires_at);
      } else {
        newExpiresAt = new Date();
      }
      
      newExpiresAt.setDate(newExpiresAt.getDate() + daysToAdd);

      // Atualizar usuário
      const { error: updateError } = await supabase
        .from('users')
        .update({
          expires_at: newExpiresAt.toISOString(),
          days_valid: (user.days_valid || 0) + daysToAdd,
          status: 'ativo' // Reativar se estava bloqueado por expiração
        })
        .eq('id', id);

      if (updateError) {
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  async checkAndBlockExpiredUsers(): Promise<number> {
    try {
      const { data, error } = await supabase.functions.invoke('check-expired-users');
      
      if (error) {
        return 0;
      }

      return data?.blockedCount || 0;
    } catch (error) {
      return 0;
    }
  }

  async getUserStatus(email: string): Promise<'ativo' | 'bloqueado' | null> {
    const { data, error } = await supabase
      .from('users')
      .select('status')
      .eq('email', email)
      .single();
    
    if (error || !data) {
      return null;
    }
    
    return data.status;
  }

  async getUserIsTrial(email: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('users')
      .select('is_trial')
      .eq('email', email)
      .single();
    if (error || !data) {
      return false;
    }
    return Boolean((data as any).is_trial);
  }

  async deleteUser(id: string, email: string): Promise<boolean> {
    try {
      // 1. Deletar da tabela customizada
      const { error: tableError } = await supabase
        .from('users')
        .delete()
        .eq('id', id);

      if (tableError) {
        return false;
      }

      // 2. Deletar do Supabase Auth via Edge Function
      try {
        const { error: functionError } = await supabase.functions.invoke('delete-user', {
          body: { userId: id }
        });

        if (functionError) {
          // Se não conseguir deletar do Auth, pelo menos removeu da tabela
          // O usuário pode se recadastrar
          return true;
        }
      } catch (functionError) {
        // Continua mesmo se a Edge Function falhar
        return true;
      }

      return true;
    } catch (error) {
      return false;
    }
  }
}

export const userService = new UserService();