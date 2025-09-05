import { supabase } from '@/integrations/supabase/client';

export interface Invite {
  id: string;
  code: string;
  email: string | null;
  used: boolean;
  used_at: string | null;
  created_at: string;
  updated_at: string;
  invite_type: string;
  days_valid: number;
  description: string | null;
}

class InviteService {
  // Obter todos os convites
  async getAllInvites(): Promise<Invite[]> {
    const { data, error } = await supabase
      .from('invites')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return [];
    }

    return data || [];
  }

  // Obter convites disponíveis
  async getAvailableInvites(): Promise<Invite[]> {
    const { data, error } = await supabase
      .from('invites')
      .select('*')
      .eq('used', false)
      .order('created_at', { ascending: false });

    if (error) {
      return [];
    }

    return data || [];
  }

  // Obter convites utilizados
  async getUsedInvites(): Promise<Invite[]> {
    const { data, error } = await supabase
      .from('invites')
      .select('*')
      .eq('used', true)
      .order('used_at', { ascending: false });

    if (error) {
      return [];
    }

    return data || [];
  }

  // Validar código de convite
  async validateInviteCode(code: string): Promise<Invite | null> {
    const { data, error } = await supabase
      .from('invites')
      .select('*')
      .eq('code', code)
      .eq('used', false)
      .single();

    if (error || !data) {
      return null;
    }

    return data;
  }

  // Usar convite - VERSÃO CORRIGIDA
  async useInvite(code: string, email: string): Promise<boolean> {
    try {
      // 1. Primeiro, buscar o convite para obter os dados
      const { data: invite, error: fetchError } = await supabase
        .from('invites')
        .select('*')
        .eq('code', code)
        .eq('used', false)
        .single();

      if (fetchError || !invite) {
        return false;
      }

      // 2. Calcular data de expiração
      const activatedAt = new Date();
      const expiresAt = new Date(activatedAt);
      expiresAt.setDate(expiresAt.getDate() + invite.days_valid);

      // 3. ATUALIZAR O CONVITE COMO USADO - VERSÃO SEGURA
      // Usar uma transação para garantir atomicidade
      const { data: updatedInvite, error: updateInviteError } = await supabase
        .from('invites')
        .update({
          used: true,
          email: email,
          used_at: activatedAt.toISOString()
        })
        .eq('code', code)
        .eq('used', false) // CRUCIAL: só atualiza se ainda não foi usado
        .select()
        .single();

      // 4. Verificar se a atualização foi bem-sucedida
      if (updateInviteError || !updatedInvite) {
        return false;
      }

      // 5. Verificar se o usuário existe na tabela public.users
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        return false;
      }

      // 6. Se o usuário não existe, criar
      if (!existingUser) {
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            email: email,
            status: 'ativo',
            activated_at: activatedAt.toISOString(),
            expires_at: expiresAt.toISOString(),
            invite_type: invite.invite_type,
            days_valid: invite.days_valid
          });

        if (insertError) {
          return false;
        }
      } else {
        // 7. Atualizar o usuário existente com dados do convite
        const { error: updateUserError } = await supabase
          .from('users')
          .update({
            activated_at: activatedAt.toISOString(),
            expires_at: expiresAt.toISOString(),
            invite_type: invite.invite_type,
            days_valid: invite.days_valid
          })
          .eq('email', email);

        if (updateUserError) {
          // Não falha se não conseguir atualizar o usuário
        }
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  // Resetar todos os convites
  async resetInvites(): Promise<void> {
    const { error } = await supabase
      .from('invites')
      .update({
        used: false,
        email: null,
        used_at: null
      });

    if (error) {
      throw error;
    }
  }

  // Obter estatísticas
  async getStats() {
    const [allInvites, usedInvites] = await Promise.all([
      this.getAllInvites(),
      this.getUsedInvites()
    ]);

    const total = allInvites.length;
    const used = usedInvites.length;
    const available = total - used;

    return {
      total,
      used,
      available,
      usedPercentage: total > 0 ? Math.round((used / total) * 100) : 0
    };
  }

  // Gerar código aleatório de 6 caracteres (letras maiúsculas e minúsculas)
  generateRandomCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // Criar novo convite
  async createInvite(inviteType: string = 'standard', daysValid: number = 30, description?: string): Promise<Invite | null> {
    const code = this.generateRandomCode();
    
    const { data, error } = await supabase
      .from('invites')
      .insert({
        code: code,
        used: false,
        email: null,
        used_at: null,
        invite_type: inviteType,
        days_valid: daysValid,
        description: description || null
      })
      .select()
      .single();

    if (error) {
      return null;
    }

    return data;
  }

  // Gerar link de convite
  generateInviteLink(code: string): string {
    return `${window.location.origin}/auth?invite=${code}`;
  }
}

export const inviteService = new InviteService(); 