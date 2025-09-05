# 🚀 PrescrevAme - Deploy para Produção

Este diretório contém tudo que você precisa para fazer deploy da aplicação PrescrevAme na sua VPS.

## 📁 Conteúdo

- `server.js` - Servidor Express para servir a aplicação
- `package.json` - Dependências do servidor
- `ecosystem.config.js` - Configuração do PM2
- `Dockerfile` - Para containerização (opcional)
- `index.html` + `assets/` - Build da aplicação React

## 🛠️ Instalação na VPS

### Método 1: Direto com Node.js

```bash
# 1. Copiar a pasta Easypanel para sua VPS
scp -r Easypanel/ usuario@sua-vps:/caminho/destino/

# 2. Conectar na VPS e navegar para o diretório
ssh usuario@sua-vps
cd /caminho/destino/Easypanel

# 3. Instalar dependências
npm install

# 4. Iniciar a aplicação
npm start

# Ou usar PM2 para produção (recomendado)
npm install -g pm2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Método 2: Com Docker

```bash
# 1. Copiar a pasta para a VPS
scp -r Easypanel/ usuario@sua-vps:/caminho/destino/

# 2. Conectar na VPS e navegar para o diretório
ssh usuario@sua-vps
cd /caminho/destino/Easypanel

# 3. Construir e executar o container
docker build -t prescrevame .
docker run -d -p 3000:3000 --name prescrevame-app prescrevame
```

### Método 3: Com Docker Compose

Crie um `docker-compose.yml`:

```yaml
version: '3.8'
services:
  prescrevame:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000"]
      interval: 30s
      timeout: 10s
      retries: 3
```

```bash
docker-compose up -d
```

## 🔧 Configuração do Nginx (Recomendado)

Para usar com proxy reverso do Nginx:

```nginx
server {
    listen 80;
    server_name seu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 📊 Monitoramento com PM2

```bash
# Ver status dos processos
pm2 status

# Ver logs
pm2 logs prescrevame-app

# Monitorar em tempo real
pm2 monit

# Reiniciar aplicação
pm2 restart prescrevame-app

# Parar aplicação
pm2 stop prescrevame-app
```

## 🔒 Configurações de Segurança

O servidor já inclui:
- ✅ Helmet.js para headers de segurança
- ✅ CORS configurado
- ✅ Compressão gzip
- ✅ Cache otimizado para assets
- ✅ Tratamento de erros

## 🌐 Variáveis de Ambiente

Você pode configurar:

```bash
export PORT=3000
export NODE_ENV=production
```

## 🚨 Troubleshooting

### Porta já em uso
```bash
# Verificar o que está usando a porta
sudo lsof -i :3000

# Matar processo se necessário
sudo kill -9 PID
```

### Permissões
```bash
# Dar permissões corretas
chmod +x server.js
chown -R $USER:$USER /caminho/para/Easypanel
```

### Logs
```bash
# Ver logs do PM2
pm2 logs

# Ver logs do sistema
journalctl -u sua-aplicacao

# Ver logs do Docker
docker logs prescrevame-app
```

## 📈 Performance

- ✅ Servidor cluster mode (usa todos os cores)
- ✅ Compressão gzip habilitada
- ✅ Cache otimizado para assets
- ✅ Health checks configurados

## 🔄 Atualizações

Para atualizar a aplicação:

1. Gere um novo build localmente
2. Substitua os arquivos na VPS
3. Reinicie o servidor:

```bash
pm2 restart prescrevame-app
# ou
docker restart prescrevame-app
```

---

**A aplicação estará disponível em `http://sua-vps:3000`** 🚀
