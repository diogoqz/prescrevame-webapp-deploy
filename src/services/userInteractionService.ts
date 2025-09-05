import { supabase } from '@/integrations/supabase/client';

export interface UserInteractionStats {
  user_id: string;
  email: string;
  nome?: string;
  status: string;
  total_messages: number;
  user_messages: number;
  bot_responses: number;
  total_sessions: number;
  first_interaction?: string;
  last_interaction?: string;
  last_session_update?: string;
  last_interaction_relative: string;
  hours_since_last_interaction?: number;
  created_at: string;
  activated_at?: string;
  expires_at?: string;
}

export interface InteractionSummary {
  total_users: number;
  active_users_24h: number;
  active_users_7d: number;
  active_users_30d: number;
  total_messages: number;
  avg_messages_per_user: number;
  users_never_interacted: number;
}

class UserInteractionService {
  async getUserInteractionStats(): Promise<UserInteractionStats[]> {
    try {
      // Query complexa que junta dados de usuários com estatísticas de chat
      const { data, error } = await supabase.rpc('get_user_interaction_stats');
      
      if (error) {
        console.error('Erro ao buscar estatísticas:', error);
        // Fallback: buscar apenas dados básicos dos usuários
        return await this.getUserBasicStats();
      }

      return data || [];
    } catch (error) {
      console.error('Erro no serviço de interação:', error);
      return await this.getUserBasicStats();
    }
  }

  private async getUserBasicStats(): Promise<UserInteractionStats[]> {
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar usuários:', error);
      return [];
    }

    return users.map(user => ({
      user_id: user.id,
      email: user.email,
      nome: user.nome,
      status: user.status,
      total_messages: 0,
      user_messages: 0,
      bot_responses: 0,
      total_sessions: 0,
      last_interaction_relative: 'Nunca interagiu',
      created_at: user.created_at,
      activated_at: user.activated_at,
      expires_at: user.expires_at
    }));
  }

  async getInteractionSummary(): Promise<InteractionSummary> {
    try {
      // Buscar dados básicos dos usuários
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, created_at, status');

      if (usersError) {
        throw usersError;
      }

      // Buscar estatísticas de chat se existirem
      const { data: sessions, error: sessionsError } = await supabase
        .from('chat_sessions')
        .select('user_id, created_at, updated_at');

      const { data: messages, error: messagesError } = await supabase
        .from('chat_messages')
        .select('session_id, sender, timestamp');

      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Calcular estatísticas
      const totalUsers = users?.length || 0;
      const totalMessages = messages?.length || 0;
      
      // Para agora, usar dados básicos já que não há interações ainda
      return {
        total_users: totalUsers,
        active_users_24h: 0,
        active_users_7d: 0,
        active_users_30d: 0,
        total_messages: totalMessages,
        avg_messages_per_user: totalUsers > 0 ? totalMessages / totalUsers : 0,
        users_never_interacted: totalUsers
      };
    } catch (error) {
      console.error('Erro ao calcular resumo:', error);
      return {
        total_users: 0,
        active_users_24h: 0,
        active_users_7d: 0,
        active_users_30d: 0,
        total_messages: 0,
        avg_messages_per_user: 0,
        users_never_interacted: 0
      };
    }
  }

  async getUserDetailedInteraction(userId: string) {
    try {
      // Buscar sessões do usuário
      const { data: sessions, error: sessionsError } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (sessionsError) {
        console.error('Erro ao buscar sessões:', sessionsError);
        return { sessions: [], messages: [] };
      }

      if (!sessions || sessions.length === 0) {
        return { sessions: [], messages: [] };
      }

      // Buscar mensagens das sessões
      const sessionIds = sessions.map(s => s.id);
      const { data: messages, error: messagesError } = await supabase
        .from('chat_messages')
        .select('*')
        .in('session_id', sessionIds)
        .order('timestamp', { ascending: false });

      if (messagesError) {
        console.error('Erro ao buscar mensagens:', messagesError);
        return { sessions, messages: [] };
      }

      return { sessions, messages: messages || [] };
    } catch (error) {
      console.error('Erro ao buscar detalhes de interação:', error);
      return { sessions: [], messages: [] };
    }
  }

  formatTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);
    const diffInDays = diffInHours / 24;

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      return `${diffInMinutes} minuto${diffInMinutes !== 1 ? 's' : ''} atrás`;
    } else if (diffInHours < 24) {
      const hours = Math.floor(diffInHours);
      return `${hours} hora${hours !== 1 ? 's' : ''} atrás`;
    } else if (diffInDays < 7) {
      const days = Math.floor(diffInDays);
      return `${days} dia${days !== 1 ? 's' : ''} atrás`;
    } else if (diffInDays < 30) {
      const weeks = Math.floor(diffInDays / 7);
      return `${weeks} semana${weeks !== 1 ? 's' : ''} atrás`;
    } else {
      const months = Math.floor(diffInDays / 30);
      return `${months} mês${months !== 1 ? 'es' : ''} atrás`;
    }
  }
}

export const userInteractionService = new UserInteractionService();

