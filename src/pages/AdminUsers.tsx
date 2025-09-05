import React, { useEffect, useState } from 'react';
import { userService, User } from '@/services/userService';
import { Button } from '@/components/ui/button';
import { Check, Ban, Loader2, LogOut, ArrowLeft, Trash2, Calendar, Plus, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAdminAuth } from '@/hooks/useAdminAuth';

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [addingDaysId, setAddingDaysId] = useState<string | null>(null);
  const [showAddDaysModal, setShowAddDaysModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [daysToAdd, setDaysToAdd] = useState(7);
  const { toast } = useToast();
  const { logout } = useAdminAuth();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    const data = await userService.getAllUsers();
    setUsers(data);
    setLoading(false);
  };

  const handleStatus = async (id: string, status: 'ativo' | 'bloqueado') => {
    setUpdatingId(id);
    const ok = await userService.setUserStatus(id, status);
    if (ok) {
      toast({
        title: status === 'ativo' ? 'Usuário ativado' : 'Usuário bloqueado',
        description: status === 'ativo' ? 'O usuário agora está ativo.' : 'O usuário foi bloqueado.',
      });
      await loadUsers();
    } else {
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o status.',
        variant: 'destructive',
      });
    }
    setUpdatingId(null);
  };

  const handleDeleteUser = async (id: string, email: string) => {
    if (!confirm(`Tem certeza que deseja deletar o usuário ${email}?\n\nEsta ação não pode ser desfeita e o usuário precisará se recadastrar.`)) {
      return;
    }

    setDeletingId(id);
    const ok = await userService.deleteUser(id, email);
    if (ok) {
      toast({
        title: 'Usuário deletado',
        description: 'O usuário foi removido do sistema e pode se recadastrar.',
      });
      await loadUsers();
    } else {
      toast({
        title: 'Erro',
        description: 'Não foi possível deletar o usuário.',
        variant: 'destructive'
      });
    }
    setDeletingId(null);
  };

  const handleAddDays = async () => {
    if (!selectedUser) return;

    setAddingDaysId(selectedUser.id);
    const ok = await userService.addDaysToUser(selectedUser.id, daysToAdd);
    if (ok) {
      toast({
        title: 'Dias adicionados',
        description: `${daysToAdd} dias foram adicionados ao usuário ${selectedUser.email}.`,
      });
      await loadUsers();
      setShowAddDaysModal(false);
      setSelectedUser(null);
      setDaysToAdd(7);
    } else {
      toast({
        title: 'Erro',
        description: 'Não foi possível adicionar dias ao usuário.',
        variant: 'destructive'
      });
    }
    setAddingDaysId(null);
  };

  const openAddDaysModal = (user: User) => {
    setSelectedUser(user);
    setShowAddDaysModal(true);
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

  const getDaysRemaining = (expiresAt: string | null) => {
    if (!expiresAt) return null;
    const now = new Date();
    const expires = new Date(expiresAt);
    const diffTime = expires.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <Loader2 className="animate-spin w-10 h-10 text-prescrevame" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => window.location.href = '/admin'}
              className="flex items-center gap-2 px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </button>
            <h1 className="text-3xl font-bold text-white">Usuários</h1>
          </div>
          
          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>
        <div className="bg-white/10 rounded-lg shadow-lg overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                                  <th className="px-6 py-4 text-left text-slate-300 font-medium">Email</th>
                  <th className="px-6 py-4 text-left text-slate-300 font-medium">Nome</th>
                  <th className="px-6 py-4 text-left text-slate-300 font-medium">Status</th>
                  <th className="px-6 py-4 text-left text-slate-300 font-medium">Expira em</th>
                  <th className="px-6 py-4 text-left text-slate-300 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 text-white">{user.email}</td>
                  <td className="px-6 py-4 text-slate-200">{user.nome || '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.status === 'ativo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {user.status === 'ativo' ? 'Ativo' : 'Bloqueado'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-300">
                    {user.expires_at ? (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span className={getDaysRemaining(user.expires_at) <= 3 ? 'text-red-400' : 'text-slate-300'}>
                          {getDaysRemaining(user.expires_at)} dias
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </td>
                                      <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {user.status === 'ativo' ? (
                          <Button
                            variant="destructive"
                            size="sm"
                            disabled={updatingId === user.id}
                            onClick={() => handleStatus(user.id, 'bloqueado')}
                            className="flex items-center gap-2"
                          >
                            {updatingId === user.id ? <Loader2 className="animate-spin w-4 h-4" /> : <Ban className="w-4 h-4" />}
                            Bloquear
                          </Button>
                        ) : (
                          <Button
                            variant="default"
                            size="sm"
                            disabled={updatingId === user.id}
                            onClick={() => handleStatus(user.id, 'ativo')}
                            className="flex items-center gap-2"
                          >
                            {updatingId === user.id ? <Loader2 className="animate-spin w-4 h-4" /> : <Check className="w-4 h-4" />}
                            Ativar
                          </Button>
                        )}
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openAddDaysModal(user)}
                          className="flex items-center gap-2 border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white"
                        >
                          <Plus className="w-4 h-4" />
                          Adicionar Dias
                        </Button>
                        
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={deletingId === user.id}
                          onClick={() => handleDeleteUser(user.id, user.email)}
                          className="flex items-center gap-2 bg-red-600 hover:bg-red-700"
                        >
                          {deletingId === user.id ? <Loader2 className="animate-spin w-4 h-4" /> : <Trash2 className="w-4 h-4" />}
                          Deletar
                        </Button>
                      </div>
                    </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal de Adicionar Dias */}
        {showAddDaysModal && selectedUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Adicionar Dias</h3>
                <button
                  onClick={() => setShowAddDaysModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-2">
                    Usuário: <span className="font-medium">{selectedUser.email}</span>
                  </p>
                  {selectedUser.expires_at && (
                    <p className="text-sm text-gray-600 mb-2">
                      Expira em: <span className="font-medium">{getDaysRemaining(selectedUser.expires_at)} dias</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dias para adicionar
                  </label>
                  <input
                    type="number"
                    value={daysToAdd}
                    onChange={(e) => setDaysToAdd(parseInt(e.target.value) || 7)}
                    min="1"
                    max="365"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-prescrevame"
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <button
                    onClick={() => setShowAddDaysModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleAddDays}
                    disabled={addingDaysId === selectedUser.id}
                    className="flex-1 px-4 py-2 bg-prescrevame text-white rounded-md hover:bg-prescrevame/90 disabled:opacity-50"
                  >
                    {addingDaysId === selectedUser.id ? 'Adicionando...' : 'Adicionar Dias'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;