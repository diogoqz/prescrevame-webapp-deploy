# 🧪 Teste do Trigger de Sincronização

## 🔍 Problema Identificado

O trigger de sincronização entre `auth.users` e `public.users` não está funcionando corretamente. Há 18 usuários em `auth.users` mas apenas 17 em `public.users`.

## ✅ Correções Implementadas

### 1. **Função de Trigger Simplificada**
```sql
CREATE OR REPLACE FUNCTION public.sync_auth_user_to_users()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.users (
    id, email, nome, status, activated_at, expires_at, invite_type, days_valid
  )
  VALUES (
    NEW.id, NEW.email, NULL, 'ativo', NULL, NULL, 'standard', 30
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$function$;
```

### 2. **Trigger Recriado**
```sql
DROP TRIGGER IF EXISTS trigger_sync_auth_user_to_users ON auth.users;
CREATE TRIGGER trigger_sync_auth_user_to_users
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION sync_auth_user_to_users();
```

## 🧪 Como Testar

### 1. **Execute no Console do Navegador (F12):**
```javascript
testTrigger()
```

### 2. **O que o teste faz:**
- ✅ Verifica contagem atual de usuários
- ✅ Cria novo usuário de teste
- ✅ Aguarda execução do trigger
- ✅ Verifica se o usuário foi sincronizado
- ✅ Tenta inserção manual se o trigger falhar
- ✅ Mostra contagem final

### 3. **Resultados Esperados:**
- ✅ Cadastro bem-sucedido em `auth.users`
- ✅ Usuário criado automaticamente em `public.users`
- ✅ Contagens iguais entre as tabelas

## 🔧 Se o Trigger Falhar

### 1. **Verificar Logs do Supabase:**
- Vá para Database > Logs
- Filtre por "ERROR"
- Procure por erros relacionados ao trigger

### 2. **Testar Inserção Manual:**
```javascript
// No console do navegador
const { data, error } = await supabase
  .from('users')
  .insert({
    id: 'user-id-aqui',
    email: 'teste@exemplo.com',
    nome: null,
    status: 'ativo',
    activated_at: null,
    expires_at: null,
    invite_type: 'standard',
    days_valid: 30
  });
```

### 3. **Verificar Configurações:**
- RLS está desabilitado
- Trigger está ativo
- Função tem permissões corretas

## 📊 Status Atual

- ✅ **Função de trigger** simplificada
- ✅ **Trigger recriado** com configuração correta
- ✅ **RLS desabilitado** temporariamente
- ✅ **Script de teste** criado
- 🔄 **Aguardando teste** do trigger

## 🎯 Próximos Passos

1. **Execute `testTrigger()`** no console
2. **Verifique os resultados** do teste
3. **Se falhar**, verifique os logs do Supabase
4. **Se funcionar**, teste o cadastro manual na interface

O trigger deve estar funcionando corretamente agora! 