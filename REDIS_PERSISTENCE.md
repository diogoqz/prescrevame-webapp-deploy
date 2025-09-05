# Persistência de Conversas com localStorage

## Visão Geral

Este sistema implementa persistência de conversas do chat usando localStorage do navegador, permitindo que os usuários mantenham suas conversas mesmo após fechar e reabrir o aplicativo.

## Configuração

### Armazenamento Local
- **Tecnologia**: localStorage do navegador
- **Chave**: `chat:{userEmail}`
- **Formato**: JSON serializado

## Arquivos Implementados

### 1. `src/services/chatPersistenceService.ts`
Serviço principal para gerenciar a persistência das mensagens no localStorage.

**Funcionalidades:**
- Inicialização automática do serviço
- Serialização/deserialização de mensagens
- Salvamento de mensagens individuais e em lote
- Carregamento de histórico de conversas
- Limpeza de conversas
- Armazenamento local por usuário

### 2. `src/hooks/useChatPersistence.ts`
Hook personalizado para gerenciar a persistência no React.

**Funcionalidades:**
- Estado de carregamento
- Status de disponibilidade do serviço
- Funções para carregar, salvar e limpar mensagens
- Verificação automática de disponibilidade

### 3. Modificações no `src/components/WhatsAppChat.tsx`
Integração da persistência no componente principal do chat.

**Funcionalidades:**
- Carregamento automático de mensagens ao fazer login
- Salvamento automático de todas as mensagens (usuário e bot)
- Persistência de mensagens de autenticação
- Indicador visual de status da conexão

### 4. Modificações no `src/components/chat/ChatHeader.tsx`
Indicador visual do status da persistência.

**Indicadores:**
- 🟢 Verde: Sincronizado (localStorage disponível)
- 🔴 Vermelho: Offline (localStorage indisponível)
- 🟡 Amarelo: Carregando mensagens

## Como Funciona

### 1. Inicialização
- Quando o usuário faz login, o sistema verifica se há mensagens salvas no localStorage
- Se houver mensagens, elas são carregadas e exibidas
- Se não houver mensagens, uma mensagem de boas-vindas é criada

### 2. Salvamento de Mensagens
- Todas as mensagens (usuário e bot) são salvas automaticamente no localStorage
- Cada mensagem é serializada com timestamp
- As mensagens são armazenadas como JSON no localStorage por usuário

### 3. Estrutura de Dados
```json
{
  "id": "string",
  "text": "string",
  "sender": "user" | "bot",
  "timestamp": "ISO string",
  "image": "string (opcional)",
  "buttons": "array (opcional)"
}
```

### 4. Chaves localStorage
- Formato: `chat:{userEmail}`
- Exemplo: `chat:usuario@exemplo.com`
- Persistência: Até limpeza manual do navegador

## Tratamento de Erros

### localStorage Indisponível
- Se o localStorage estiver indisponível, as mensagens são exibidas normalmente
- O sistema continua funcionando sem persistência
- Indicador visual mostra status "Offline"

### Falhas de Salvamento
- Erros são logados no console
- O chat continua funcionando normalmente
- Usuário não é notificado de falhas silenciosas

## Benefícios

1. **Persistência**: Conversas são mantidas entre sessões
2. **Performance**: localStorage oferece acesso rápido aos dados
3. **Simplicidade**: Não requer servidor externo
4. **Confiabilidade**: Sistema funciona mesmo com localStorage indisponível
5. **Transparência**: Usuário vê status da sincronização

## Monitoramento

### Logs do Console
- Inicialização do serviço de persistência
- Erros de salvamento/carregamento
- Status de sincronização

### Interface do Usuário
- Indicador visual no header do chat
- Status em tempo real da disponibilidade
- Feedback visual durante carregamento

## Configuração de Desenvolvimento

### Vite Config
```typescript
resolve: {
  alias: {
    "@": path.resolve(__dirname, "./src"),
  },
}
```

### Dependências
- Não requer dependências externas
- Usa APIs nativas do navegador (localStorage)

## Limitações

1. **Browser Compatibility**: localStorage pode ter limitações em modo privado
2. **Storage Limit**: Limitado pela capacidade do localStorage (~5-10MB)
3. **Device Specific**: Dados ficam apenas no dispositivo atual
4. **Manual Cleanup**: Dados persistem até limpeza manual do navegador

## Próximos Passos

1. Implementar sincronização com servidor backend
2. Adicionar compressão de mensagens antigas
3. Implementar backup automático
4. Adicionar métricas de uso
5. Implementar limpeza automática de mensagens antigas
6. Migrar para Redis via API backend
