# ⚡ Deploy Rápido - PrescrevAme

## 🚀 Método 1: Deploy Simples (Recomendado)

1. **Copie a pasta Easypanel para sua VPS:**
   ```bash
   scp -r Easypanel/ usuario@sua-vps:/caminho/destino/
   ```

2. **Na VPS, execute o deploy:**
   ```bash
   cd /caminho/destino/Easypanel
   ./deploy-simple.sh
   ```

3. **Pronto!** 🎉 Acesse `http://sua-vps:3000`

---

## 🛠️ Método 2: Deploy Manual

1. **Envie a pasta para sua VPS:**
   ```bash
   scp -r Easypanel/ usuario@sua-vps:/caminho/destino/
   ```

2. **Na VPS, instale e execute:**
   ```bash
   cd /caminho/destino/Easypanel
   npm install
   npm install -g pm2
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```

---

## 🐳 Método 3: Docker (Mais Simples)

1. **Com Docker Compose (Recomendado):**
   ```bash
   cd Easypanel
   docker-compose up -d
   ```

2. **Ou com Docker direto:**
   ```bash
   cd Easypanel
   docker build -t prescrevame .
   docker run -d -p 3000:3000 --name prescrevame-app prescrevame
   ```

---

## 📊 Monitoramento

```bash
# Ver status
pm2 status

# Ver logs
pm2 logs prescrevame-app

# Reiniciar
pm2 restart prescrevame-app
```

---

## 🌐 Configurar Nginx (Opcional)

```nginx
server {
    listen 80;
    server_name seu-dominio.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

**✅ Requisitos da VPS:**
- Node.js 18+
- NPM
- PM2 (será instalado automaticamente)
- Porta 3000 liberada

**🎯 Resultado:** Aplicação rodando em `http://sua-vps:3000`
