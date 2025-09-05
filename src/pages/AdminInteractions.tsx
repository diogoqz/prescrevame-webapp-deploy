import React, { useEffect, useState } from 'react';
import { userInteractionService, UserInteractionStats, InteractionSummary } from '@/services/userInteractionService';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MessageCircle, Users, Activity, Clock, RefreshCw, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAdminAuth } from '@/hooks/useAdminAuth';

const AdminInteractions: React.FC = () => {
  const [stats, setStats] = useState<UserInteractionStats[]>([]);
  const [summary, setSummary] = useState<InteractionSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [userDetails, setUserDetails] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const { toast } = useToast();
  const { logout } = useAdminAuth();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsData, summaryData] = await Promise.all([
        userInteractionService.getUserInteractionStats(),
        userInteractionService.getInteractionSummary()
      ]);
      
      setStats(statsData);
      setSummary(summaryData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as estatísticas.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadUserDetails = async (userId: string) => {
    setLoadingDetails(true);
    try {
      const details = await userInteractionService.getUserDetailedInteraction(userId);
      setUserDetails(details);
      setSelectedUser(userId);
    } catch (error) {
      console.error('Erro ao carregar detalhes:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os detalhes do usuário.',
        variant: 'destructive'
      });
    } finally {
      setLoadingDetails(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="flex items-center gap-2 text-white">
          <RefreshCw className="animate-spin w-6 h-6" />
          <span>Carregando estatísticas...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => window.location.href = '/admin'}
              className="flex items-center gap-2 px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </button>
            <h1 className="text-3xl font-bold text-white">Interações dos Usuários</h1>
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={loadData}
              variant="outline"
              className="border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
            <Button
              onClick={logout}
              variant="outline"
              className="border-gray-500 text-gray-500 hover:bg-gray-500 hover:text-white"
            >
              Sair
            </Button>
          </div>
        </div>

        {/* Resumo */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-300 text-sm">Total de Usuários</p>
                  <p className="text-2xl font-bold text-white">{summary.total_users}</p>
                </div>
                <Users className="w-8 h-8 text-blue-400" />
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-300 text-sm">Mensagens Totais</p>
                  <p className="text-2xl font-bold text-white">{summary.total_messages}</p>
                </div>
                <MessageCircle className="w-8 h-8 text-green-400" />
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-300 text-sm">Ativos (24h)</p>
                  <p className="text-2xl font-bold text-white">{summary.active_users_24h}</p>
                </div>
                <Activity className="w-8 h-8 text-yellow-400" />
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-300 text-sm">Nunca Interagiram</p>
                  <p className="text-2xl font-bold text-white">{summary.users_never_interacted}</p>
                </div>
                <Clock className="w-8 h-8 text-red-400" />
              </div>
            </div>
          </div>
        )}

        {/* Tabela de Usuários */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-4 py-3 text-left text-white font-semibold">Usuário</th>
                  <th className="px-4 py-3 text-left text-white font-semibold">Status</th>
                  <th className="px-4 py-3 text-left text-white font-semibold">Mensagens</th>
                  <th className="px-4 py-3 text-left text-white font-semibold">Sessões</th>
                  <th className="px-4 py-3 text-left text-white font-semibold">Última Interação</th>
                  <th className="px-4 py-3 text-left text-white font-semibold">Cadastro</th>
                  <th className="px-4 py-3 text-left text-white font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {stats.map((user) => (
                  <tr key={user.user_id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <div className="text-white font-medium">
                          {user.nome || 'Sem nome'}
                        </div>
                        <div className="text-slate-300 text-sm">{user.email}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.status === 'ativo' 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-white">
                        <div>{user.total_messages} total</div>
                        <div className="text-slate-300 text-sm">
                          {user.user_messages} enviadas
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-white">{user.total_sessions}</td>
                    <td className="px-4 py-3">
                      <div className="text-white">
                        {user.last_interaction 
                          ? userInteractionService.formatTimeAgo(user.last_interaction)
                          : 'Nunca'
                        }
                      </div>
                      <div className="text-slate-300 text-sm">
                        {user.last_interaction_relative}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-white text-sm">
                        {formatDate(user.created_at)}
                      </div>
                      {user.activated_at && (
                        <div className="text-slate-300 text-xs">
                          Ativo: {formatDate(user.activated_at)}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => loadUserDetails(user.user_id)}
                        disabled={loadingDetails}
                        className="border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Detalhes
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal de Detalhes do Usuário */}
        {selectedUser && userDetails && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Detalhes de Interação
                  </h3>
                  <button
                    onClick={() => {
                      setSelectedUser(null);
                      setUserDetails(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Sessões ({userDetails.sessions.length})
                    </h4>
                    {userDetails.sessions.length > 0 ? (
                      <div className="space-y-2">
                        {userDetails.sessions.map((session: any) => (
                          <div key={session.id} className="bg-gray-50 p-3 rounded">
                            <div className="text-sm text-gray-600">
                              Criada: {formatDate(session.created_at)}
                            </div>
                            <div className="text-sm text-gray-600">
                              Atualizada: {formatDate(session.updated_at)}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">Nenhuma sessão encontrada</p>
                    )}
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Mensagens ({userDetails.messages.length})
                    </h4>
                    {userDetails.messages.length > 0 ? (
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {userDetails.messages.map((message: any) => (
                          <div key={message.id} className="bg-gray-50 p-3 rounded">
                            <div className="flex justify-between items-start mb-2">
                              <span className={`px-2 py-1 rounded text-xs ${
                                message.sender === 'user' 
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-green-100 text-green-800'
                              }`}>
                                {message.sender === 'user' ? 'Usuário' : 'Bot'}
                              </span>
                              <span className="text-xs text-gray-500">
                                {formatDate(message.timestamp)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700">{message.content}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">Nenhuma mensagem encontrada</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminInteractions;

