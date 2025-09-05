# 📁 Estrutura da Pasta Easypanel

Esta pasta contém tudo que você precisa para fazer deploy da aplicação PrescrevAme na sua VPS.

## 📋 Arquivos e Diretórios

```
Easypanel/
├── 📄 server.js              # Servidor Express principal
├── 📄 package.json           # Dependências do Node.js
├── 📄 ecosystem.config.js    # Configuração do PM2
├── 📄 Dockerfile            # Para containerização
├── 🚀 deploy.sh             # Script de deploy automático
├── 📄 .gitignore            # Arquivos a ignorar no Git
├── 📚 README.md             # Documentação completa
├── ⚡ DEPLOY-RAPIDO.md      # Instruções rápidas
├── 📁 ESTRUTURA.md          # Este arquivo
├── 📄 index.html            # Página principal da SPA
├── 📄 favicon.ico           # Ícone do site
├── 📄 placeholder.svg       # Imagem placeholder
├── 📄 robots.txt            # Instruções para bots
├── 📁 assets/               # Assets otimizados
│   ├── index-B-YRXJu7.js   # JavaScript principal (625KB)
│   ├── index-Ch7bKx3m.css  # CSS principal (74KB)
│   └── browser-BYUnWgC0.js # Polyfills (0.3KB)
└── 📁 lovable-uploads/      # Uploads da aplicação
    └── f9d8ee9c-efab-4f5c-98b5-b08a1a131d86.png
```

## 🔧 Funcionalidades do Servidor

### ✅ **Segurança:**
- Helmet.js para headers de segurança
- CORS configurado
- Content Security Policy
- Proteção contra ataques comuns

### ✅ **Performance:**
- Compressão gzip
- Cache otimizado (1 ano para assets)
- Modo cluster (usa todos os cores)
- Arquivos estáticos servidos eficientemente

### ✅ **SPA Support:**
- Todas as rotas redirecionam para index.html
- History API funcionando corretamente
- Cache desabilitado para index.html

### ✅ **Produção:**
- PM2 configurado para alta disponibilidade
- Health checks
- Logs estruturados
- Restart automático em caso de falha

## 🚀 Como Usar

### **Deploy Automático:**
1. Edite `deploy.sh` com seus dados da VPS
2. Execute: `./deploy.sh`
3. Pronto!

### **Deploy Manual:**
1. Copie a pasta inteira para sua VPS
2. Execute: `npm install && npm start`

### **Com Docker:**
1. Execute: `docker build -t prescrevame .`
2. Execute: `docker run -d -p 3000:3000 prescrevame`

## 📊 Monitoramento

O servidor inclui:
- Logs detalhados
- Health checks automáticos
- Métricas de performance
- Restart automático

## 🌐 Acesso

Após o deploy, acesse:
- `http://sua-vps:3000` - Aplicação
- PM2: `pm2 monit` - Monitoramento
- Logs: `pm2 logs prescrevame-app`

## 💡 Dicas

- Use Nginx como proxy reverso para melhor performance
- Configure SSL/HTTPS para produção
- Monitore logs regularmente
- Mantenha backups regulares

---

**Esta estrutura garante um deploy profissional e confiável!** 🚀
