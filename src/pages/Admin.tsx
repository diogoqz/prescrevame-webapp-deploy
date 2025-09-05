import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, RefreshCw, Users, UserCheck, UserX, LogOut, Plus, X, MessageCircle, Clock } from 'lucide-react';
import { inviteService, Invite } from '@/services/inviteService';
import { useToast } from '@/hooks/use-toast';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminTrials from './AdminTrials';

const Admin: React.FC = () => {
  const [invites, setInvites] = useState<Invite[]>([]);
  const [stats, setStats] = useState({ total: 0, used: 0, available: 0, usedPercentage: 0 });
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [creatingInvite, setCreatingInvite] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newInviteType, setNewInviteType] = useState('standard');
  const [newInviteDays, setNewInviteDays] = useState(30);
  const [newInviteDescription, setNewInviteDescription] = useState('');
  const { toast } = useToast();
  const { logout } = useAdminAuth();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [invitesData, statsData] = await Promise.all([
        inviteService.getAllInvites(),
        inviteService.getStats()
      ]);
      setInvites(invitesData);
      setStats(statsData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados dos convites.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const copyInviteLink = async (code: string) => {
    const inviteLink = inviteService.generateInviteLink(code);
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopiedCode(code);
      toast({
        title: "Link copiado!",
        description: "O link do convite foi copiado para a área de transferência.",
      });
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível copiar o link.",
        variant: "destructive"
      });
    }
  };

  const resetInvites = async () => {
    try {
      await inviteService.resetInvites();
      await loadData();
      toast({
        title: "Convites resetados!",
        description: "Todos os convites foram resetados para o estado inicial.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível resetar os convites.",
        variant: "destructive"
      });
    }
  };

  const createNewInvite = async () => {
    try {
      setCreatingInvite(true);
      const newInvite = await inviteService.createInvite(newInviteType, newInviteDays, newInviteDescription);
      
      if (newInvite) {
        await loadData();
        toast({
          title: "Convite criado!",
          description: `Novo convite criado: ${newInvite.code} (${newInvite.days_valid} dias)`,
        });
        setShowCreateModal(false);
        setNewInviteType('standard');
        setNewInviteDays(30);
        setNewInviteDescription('');
      } else {
        toast({
          title: "Erro",
          description: "Não foi possível criar o convite.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível criar o convite.",
        variant: "destructive"
      });
    } finally {
      setCreatingInvite(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-prescrevame mx-auto mb-4"></div>
          <p className="text-white">Carregando convites...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">Painel Administrativo</h1>
          <p className="text-slate-300">Gerencie convites e monitore trials do PrescrevaMe</p>
        </motion.div>

        {/* Logout Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex justify-end mb-6"
        >
          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs defaultValue="convites" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-white/10 backdrop-blur-sm border border-white/20">
              <TabsTrigger value="convites" className="data-[state=active]:bg-white/20">
                <Users className="w-4 h-4 mr-2" />
                Convites
              </TabsTrigger>
              <TabsTrigger value="trials" className="data-[state=active]:bg-white/20">
                <Clock className="w-4 h-4 mr-2" />
                Trials
              </TabsTrigger>
              <TabsTrigger value="usuarios" className="data-[state=active]:bg-white/20">
                <UserCheck className="w-4 h-4 mr-2" />
                Usuários
              </TabsTrigger>
            </TabsList>

            <TabsContent value="convites" className="mt-6">
              {/* Stats Cards */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
              >
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-300 text-sm">Total de Convites</p>
                      <p className="text-3xl font-bold text-white">{stats.total}</p>
                    </div>
                    <Users className="w-8 h-8 text-prescrevame" />
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-300 text-sm">Disponíveis</p>
                      <p className="text-3xl font-bold text-green-400">{stats.available}</p>
                    </div>
                    <UserX className="w-8 h-8 text-green-400" />
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-300 text-sm">Utilizados</p>
                      <p className="text-3xl font-bold text-orange-400">{stats.used}</p>
                    </div>
                    <UserCheck className="w-8 h-8 text-orange-400" />
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-300 text-sm">Taxa de Uso</p>
                      <p className="text-3xl font-bold text-blue-400">{stats.usedPercentage}%</p>
                    </div>
                    <div className="w-8 h-8 bg-blue-400 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">{stats.usedPercentage}%</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-between items-center mb-6"
              >
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Criar Convite
                  </button>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={resetInvites}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Resetar Todos os Convites
                  </button>
                </div>
              </motion.div>

        {/* Invites Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-4 text-left text-slate-300 font-medium">Código</th>
                  <th className="px-6 py-4 text-left text-slate-300 font-medium">Tipo</th>
                  <th className="px-6 py-4 text-left text-slate-300 font-medium">Dias</th>
                  <th className="px-6 py-4 text-left text-slate-300 font-medium">Status</th>
                  <th className="px-6 py-4 text-left text-slate-300 font-medium">Email</th>
                  <th className="px-6 py-4 text-left text-slate-300 font-medium">Data de Uso</th>
                  <th className="px-6 py-4 text-left text-slate-300 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {invites.map((invite, index) => (
                  <motion.tr
                    key={invite.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <code className="bg-white/10 px-2 py-1 rounded text-sm font-mono text-white">
                          {invite.code}
                        </code>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-300">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {invite.invite_type || 'standard'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-300">
                      {invite.days_valid || 30} dias
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        invite.used 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {invite.used ? 'Utilizado' : 'Disponível'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-300">
                      {invite.email || '-'}
                    </td>
                    <td className="px-6 py-4 text-slate-300">
                      {formatDate(invite.used_at)}
                    </td>
                    <td className="px-6 py-4">
                      {!invite.used && (
                        <button
                          onClick={() => copyInviteLink(invite.code)}
                          className="flex items-center gap-2 px-3 py-1 bg-prescrevame hover:bg-prescrevame/80 text-white rounded-md text-sm transition-colors"
                        >
                          {copiedCode === invite.code ? (
                            <>
                              <Check className="w-4 h-4" />
                              Link Copiado
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4" />
                              Copiar Link
                            </>
                          )}
                        </button>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
            </TabsContent>

            <TabsContent value="trials" className="mt-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6">
                <AdminTrials />
              </div>
            </TabsContent>

            <TabsContent value="usuarios" className="mt-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6">
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Gerenciar Usuários</h3>
                  <p className="text-slate-300 mb-4">
                    Acesse o painel completo de gerenciamento de usuários
                  </p>
                  <button
                    onClick={() => window.location.href = '/admin/usuarios'}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors mx-auto"
                  >
                    <Users className="w-5 h-5" />
                    Ir para Gerenciamento de Usuários
                  </button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Modal de Criação de Convite */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Criar Novo Convite</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Convite
                  </label>
                  <select
                    value={newInviteType}
                    onChange={(e) => setNewInviteType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-prescrevame"
                  >
                    <option value="standard">Padrão</option>
                    <option value="trial">Teste Gratuito</option>
                    <option value="premium">Premium</option>
                    <option value="enterprise">Empresarial</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dias de Validade
                  </label>
                  <input
                    type="number"
                    value={newInviteDays}
                    onChange={(e) => setNewInviteDays(parseInt(e.target.value) || 30)}
                    min="1"
                    max="365"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-prescrevame"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição (opcional)
                  </label>
                  <textarea
                    value={newInviteDescription}
                    onChange={(e) => setNewInviteDescription(e.target.value)}
                    placeholder="Ex: Convite para teste gratuito de 7 dias"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-prescrevame"
                    rows={3}
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={createNewInvite}
                    disabled={creatingInvite}
                    className="flex-1 px-4 py-2 bg-prescrevame text-white rounded-md hover:bg-prescrevame/90 disabled:opacity-50"
                  >
                    {creatingInvite ? 'Criando...' : 'Criar Convite'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin; 