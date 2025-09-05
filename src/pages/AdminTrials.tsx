import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Calendar,
  UserCheck,
  UserX,
  Loader2,
  RefreshCw,
  TrendingUp
} from 'lucide-react';
import { formatDistanceToNow, format, isAfter } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TrialUser {
  id: string;
  email: string;
  nome: string | null;
  cpf: string | null;
  whatsapp: string | null;
  profissao: string | null;
  status: string;
  is_trial: boolean;
  trial_started_at: string | null;
  trial_expires_at: string | null;
  created_at: string;
}

interface TrialStats {
  total: number;
  active: number;
  expired: number;
  converted: number;
  conversionRate: number;
}

const AdminTrials = () => {
  const [trialUsers, setTrialUsers] = useState<TrialUser[]>([]);
  const [stats, setStats] = useState<TrialStats>({
    total: 0,
    active: 0,
    expired: 0,
    converted: 0,
    conversionRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  const loadTrialData = async () => {
    try {
      // Buscar todos os usuários de trial
      const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .eq('is_trial', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setTrialUsers(users || []);

      // Calcular estatísticas
      const now = new Date();
      const active = users?.filter(user => 
        user.trial_expires_at && isAfter(new Date(user.trial_expires_at), now)
      ).length || 0;
      
      const expired = users?.filter(user => 
        user.trial_expires_at && !isAfter(new Date(user.trial_expires_at), now)
      ).length || 0;

      // Usuários convertidos (que compraram após o trial)
      // Por enquanto, consideramos convertidos os que têm invite_type diferente de 'trial'
      const converted = users?.filter(user => 
        user.invite_type !== 'trial' || user.days_valid && user.days_valid > 1
      ).length || 0;

      const total = users?.length || 0;
      const conversionRate = total > 0 ? (converted / total) * 100 : 0;

      setStats({
        total,
        active,
        expired,
        converted,
        conversionRate
      });

    } catch (error: any) {
      console.error('Erro ao carregar dados de trial:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados dos trials.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadTrialData();
  };

  const extendTrial = async (userId: string, days: number) => {
    try {
      const user = trialUsers.find(u => u.id === userId);
      if (!user || !user.trial_expires_at) return;

      const currentExpiry = new Date(user.trial_expires_at);
      const newExpiry = new Date(currentExpiry.getTime() + days * 24 * 60 * 60 * 1000);

      const { error } = await supabase
        .from('users')
        .update({
          trial_expires_at: newExpiry.toISOString(),
          expires_at: newExpiry.toISOString(),
          days_valid: (user.days_valid || 1) + days
        })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Trial estendido",
        description: `Trial estendido por ${days} dia(s).`
      });

      await loadTrialData();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao estender trial.",
        variant: "destructive"
      });
    }
  };

  const convertToFullUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          is_trial: false,
          invite_type: 'converted',
          days_valid: 30,
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Usuário convertido",
        description: "Usuário convertido para conta completa (30 dias)."
      });

      await loadTrialData();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao converter usuário.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    loadTrialData();
  }, []);

  const getTrialStatus = (user: TrialUser) => {
    if (!user.trial_expires_at) return 'unknown';
    
    const now = new Date();
    const expiry = new Date(user.trial_expires_at);
    
    if (isAfter(expiry, now)) {
      return 'active';
    } else {
      return 'expired';
    }
  };

  const getStatusBadge = (user: TrialUser) => {
    const status = getTrialStatus(user);
    
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Ativo</Badge>;
      case 'expired':
        return <Badge className="bg-red-100 text-red-800">Expirado</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Desconhecido</Badge>;
    }
  };

  const getProfissaoLabel = (profissao: string | null) => {
    switch (profissao) {
      case 'estudante_medicina':
        return 'Estudante de Medicina';
      case 'medico':
        return 'Médico';
      default:
        return 'Não informado';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Monitoramento de Trials</h1>
          <p className="text-gray-600 mt-1">
            Gerencie e monitore usuários em período de teste
          </p>
        </div>
        <Button onClick={handleRefresh} disabled={refreshing} variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Trials</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Trials Ativos</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <Clock className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Trials Expirados</p>
                <p className="text-2xl font-bold text-red-600">{stats.expired}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Convertidos</p>
                <p className="text-2xl font-bold text-blue-600">{stats.converted}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Taxa de Conversão</p>
                <p className="text-2xl font-bold text-purple-600">{stats.conversionRate.toFixed(1)}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de Usuários */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">Todos ({stats.total})</TabsTrigger>
          <TabsTrigger value="active">Ativos ({stats.active})</TabsTrigger>
          <TabsTrigger value="expired">Expirados ({stats.expired})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <TrialUsersList 
            users={trialUsers} 
            onExtendTrial={extendTrial}
            onConvertUser={convertToFullUser}
          />
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          <TrialUsersList 
            users={trialUsers.filter(user => getTrialStatus(user) === 'active')} 
            onExtendTrial={extendTrial}
            onConvertUser={convertToFullUser}
          />
        </TabsContent>

        <TabsContent value="expired" className="space-y-4">
          <TrialUsersList 
            users={trialUsers.filter(user => getTrialStatus(user) === 'expired')} 
            onExtendTrial={extendTrial}
            onConvertUser={convertToFullUser}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Componente para lista de usuários
interface TrialUsersListProps {
  users: TrialUser[];
  onExtendTrial: (userId: string, days: number) => void;
  onConvertUser: (userId: string) => void;
}

const TrialUsersList: React.FC<TrialUsersListProps> = ({ users, onExtendTrial, onConvertUser }) => {
  const getTrialStatus = (user: TrialUser) => {
    if (!user.trial_expires_at) return 'unknown';
    
    const now = new Date();
    const expiry = new Date(user.trial_expires_at);
    
    if (isAfter(expiry, now)) {
      return 'active';
    } else {
      return 'expired';
    }
  };

  const getStatusBadge = (user: TrialUser) => {
    const status = getTrialStatus(user);
    
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Ativo</Badge>;
      case 'expired':
        return <Badge className="bg-red-100 text-red-800">Expirado</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Desconhecido</Badge>;
    }
  };

  const getProfissaoLabel = (profissao: string | null) => {
    switch (profissao) {
      case 'estudante_medicina':
        return 'Estudante de Medicina';
      case 'medico':
        return 'Médico';
      default:
        return 'Não informado';
    }
  };

  if (users.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Nenhum usuário de trial encontrado</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {users.map((user) => (
        <Card key={user.id}>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold">{user.nome || 'Nome não informado'}</h3>
                  {getStatusBadge(user)}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Email:</span>
                    <p>{user.email}</p>
                  </div>
                  
                  <div>
                    <span className="font-medium">Profissão:</span>
                    <p>{getProfissaoLabel(user.profissao)}</p>
                  </div>
                  
                  <div>
                    <span className="font-medium">WhatsApp:</span>
                    <p>{user.whatsapp || 'Não informado'}</p>
                  </div>
                  
                  <div>
                    <span className="font-medium">CPF:</span>
                    <p>{user.cpf ? `***.***.***-${user.cpf.slice(-2)}` : 'Não informado'}</p>
                  </div>
                </div>

                {user.trial_started_at && (
                  <div className="mt-3 text-sm text-gray-600">
                    <div className="flex items-center gap-4">
                      <div>
                        <span className="font-medium">Iniciado:</span>
                        <span className="ml-1">
                          {format(new Date(user.trial_started_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                        </span>
                      </div>
                      
                      {user.trial_expires_at && (
                        <div>
                          <span className="font-medium">Expira:</span>
                          <span className="ml-1">
                            {format(new Date(user.trial_expires_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                            {' '}
                            <span className="text-gray-500">
                              ({formatDistanceToNow(new Date(user.trial_expires_at), { 
                                addSuffix: true, 
                                locale: ptBR 
                              })})
                            </span>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2 ml-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onExtendTrial(user.id, 1)}
                >
                  <Calendar className="h-4 w-4 mr-1" />
                  +1 dia
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onExtendTrial(user.id, 7)}
                >
                  <Calendar className="h-4 w-4 mr-1" />
                  +7 dias
                </Button>
                
                <Button
                  size="sm"
                  onClick={() => onConvertUser(user.id)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <UserCheck className="h-4 w-4 mr-1" />
                  Converter
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AdminTrials;
