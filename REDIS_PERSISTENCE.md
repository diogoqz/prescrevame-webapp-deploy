# Persistência de Conversas com Redis

## Visão Geral

Este sistema implementa persistência de conversas do chat usando Redis, permitindo que os usuários mantenham suas conversas mesmo após fechar e reabrir o aplicativo.

## Configuração

### Redis URL
```
redis://default:54421f870aab2466604b@3gbyjx.easypanel.host:9987
```

## Arquivos Implementados

### 1. `src/services/chatPersistenceService.ts`
Serviço principal para gerenciar a persistência das mensagens no Redis.

**Funcionalidades:**
- Conexão automática com Redis
- Serialização/deserialização de mensagens
- Salvamento de mensagens individuais e em lote
- Carregamento de histórico de conversas
- Limpeza de conversas
- Expiração automática (30 dias)

### 2. `src/hooks/useChatPersistence.ts`
Hook personalizado para gerenciar a persistência no React.

**Funcionalidades:**
- Estado de carregamento
- Status de conexão Redis
- Funções para carregar, salvar e limpar mensagens
- Verificação automática de conexão

### 3. Modificações no `src/components/WhatsAppChat.tsx`
Integração da persistência no componente principal do chat.

**Funcionalidades:**
- Carregamento automático de mensagens ao fazer login
- Salvamento automático de todas as mensagens (usuário e bot)
- Persistência de mensagens de autenticação
- Indicador visual de status da conexão

### 4. Modificações no `src/components/chat/ChatHeader.tsx`
Indicador visual do status da conexão Redis.

**Indicadores:**
- 🟢 Verde: Sincronizado (Redis conectado)
- 🔴 Vermelho: Offline (Redis desconectado)
- 🟡 Amarelo: Carregando mensagens

## Como Funciona

### 1. Inicialização
- Quando o usuário faz login, o sistema verifica se há mensagens salvas no Redis
- Se houver mensagens, elas são carregadas e exibidas
- Se não houver mensagens, uma mensagem de boas-vindas é criada

### 2. Salvamento de Mensagens
- Todas as mensagens (usuário e bot) são salvas automaticamente no Redis
- Cada mensagem é serializada com timestamp
- As mensagens são armazenadas em uma lista Redis por usuário

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

### 4. Chaves Redis
- Formato: `chat:{userEmail}`
- Exemplo: `chat:usuario@exemplo.com`
- Expiração: 30 dias

## Tratamento de Erros

### Conexão Redis
- Se o Redis estiver offline, as mensagens são exibidas normalmente
- O sistema continua funcionando sem persistência
- Indicador visual mostra status "Offline"

### Falhas de Salvamento
- Erros são logados no console
- O chat continua funcionando normalmente
- Usuário não é notificado de falhas silenciosas

## Benefícios

1. **Persistência**: Conversas são mantidas entre sessões
2. **Performance**: Redis oferece acesso rápido aos dados
3. **Escalabilidade**: Suporta múltiplos usuários simultâneos
4. **Confiabilidade**: Sistema funciona mesmo com Redis offline
5. **Transparência**: Usuário vê status da sincronização

## Monitoramento

### Logs do Console
- Conexão/desconexão do Redis
- Erros de salvamento/carregamento
- Status de sincronização

### Interface do Usuário
- Indicador visual no header do chat
- Status em tempo real da conexão
- Feedback visual durante carregamento

## Configuração de Desenvolvimento

### Vite Config
```typescript
define: {
  global: 'globalThis',
},
optimizeDeps: {
  exclude: ['redis']
}
```

### Dependências
```json
{
  "redis": "^4.6.0"
}
```

## Limitações

1. **Browser Compatibility**: Redis client pode ter limitações em alguns browsers
2. **Network Dependency**: Requer conexão com Redis para persistência
3. **Storage Limit**: Limitado pela capacidade do Redis
4. **Expiration**: Mensagens expiram após 30 dias

## Próximos Passos

1. Implementar fallback para localStorage
2. Adicionar compressão de mensagens antigas
3. Implementar backup automático
4. Adicionar métricas de uso
5. Implementar limpeza automática de mensagens antigas
