# 🚀 Instruções de Deploy - PrescrevaMe

## 📋 Variáveis de Ambiente Configuradas

### **Supabase (Banco de Dados)**
```
VITE_SUPABASE_URL=https://soaonapntsktpqoqptyz.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvYW9uYXBudHNrdHBxb3FwdHl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE4MzgzNDAsImV4cCI6MjA1NzQxNDM0MH0.hN2AeKcjJd94-O_egMln3VlBgpDmpv8gasLNhrnH4w4
```

### **Webhooks**
```
VITE_WEBHOOK_URL=https://srv-n8n.rtp53d.easypanel.host/webhook/bdb16435-5b9b-4d29-bd1f-50e2c5280217
VITE_CHAT_WEBHOOK_URL=https://app-n8n.3gbyjx.easypanel.host/webhook/web-pme
```

### **Configurações do Servidor**
```
NODE_ENV=production
PORT=3000
```

## 🎯 Deploy no Easypanel

### **Passo 1: Criar Projeto**
1. Acesse [Easypanel](https://easypanel.io)
2. Clique em "New Project"
3. Nome: `prescrevame-webapp`

### **Passo 2: Conectar Repositório**
1. Selecione "Git Repository"
2. URL: `https://github.com/diogoqz/prescrevame-webapp-deploy`
3. Branch: `main`

### **Passo 3: Configurar Build**
- **Deployment Script**:
  ```
  cd /code
  npm install
  npm run build
  npm start
  ```
- **Port**: `3000`

### **Passo 4: Adicionar Variáveis de Ambiente**
Copie e cole todas as variáveis acima na seção "Environment Variables"

### **Passo 5: Deploy**
1. Clique em "Deploy"
2. Aguarde o build (2-3 minutos)
3. Acesse a URL fornecida

## ✅ Verificação Pós-Deploy

### **Testes Básicos:**
1. ✅ Página inicial carrega
2. ✅ Login funciona
3. ✅ Trial funciona
4. ✅ Chat responde
5. ✅ Webhooks funcionam

### **URLs de Teste:**
- `/` - Página principal
- `/auth` - Login/Cadastro
- `/trial` - Trial gratuito
- `/admin` - Painel admin

## 🔧 Troubleshooting

### **Build Falha:**
- Verifique se todas as variáveis estão configuradas
- Confirme se o Node.js 18+ está sendo usado

### **App Não Carrega:**
- Verifique logs do container
- Confirme se a porta 3000 está exposta

### **Webhooks Não Funcionam:**
- Teste as URLs dos webhooks manualmente
- Verifique se as variáveis estão corretas

## 📞 Suporte
- **WhatsApp**: (63) 92437-559
- **Email**: suporte@prescrevame.com
