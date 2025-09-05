#!/bin/bash

# 🚀 Script de Deploy Automático - PrescrevAme
# Este script automatiza o processo de deploy na VPS

set -e  # Parar em caso de erro

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configurações (edite conforme necessário)
VPS_USER="root"
VPS_HOST="sua-vps.com"
VPS_PATH="/var/www/prescrevame"
APP_NAME="prescrevame-app"

echo -e "${BLUE}🚀 Iniciando deploy do PrescrevAme...${NC}"

# Função para imprimir status
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Verificar se estamos no diretório correto
if [ ! -f "server.js" ]; then
    print_error "Erro: server.js não encontrado. Execute este script no diretório Easypanel."
    exit 1
fi

print_status "Verificações iniciais concluídas"

# Criar backup na VPS (opcional)
echo -e "${BLUE}📦 Criando backup na VPS...${NC}"
ssh $VPS_USER@$VPS_HOST "
    if [ -d '$VPS_PATH' ]; then
        cp -r $VPS_PATH ${VPS_PATH}_backup_\$(date +%Y%m%d_%H%M%S)
        echo 'Backup criado com sucesso'
    fi
" || print_warning "Não foi possível criar backup (primeira instalação?)"

# Enviar arquivos para VPS
echo -e "${BLUE}📤 Enviando arquivos para VPS...${NC}"
rsync -avz --delete \
    --exclude='node_modules' \
    --exclude='logs' \
    --exclude='.git' \
    ./ $VPS_USER@$VPS_HOST:$VPS_PATH/

print_status "Arquivos enviados com sucesso"

# Instalar dependências e reiniciar aplicação na VPS
echo -e "${BLUE}🔧 Instalando dependências na VPS...${NC}"
ssh $VPS_USER@$VPS_HOST "
    cd $VPS_PATH
    
    # Instalar dependências
    npm install --production --no-fund
    
    # Criar diretório de logs se não existir
    mkdir -p logs
    
    # Verificar se PM2 está instalado
    if ! command -v pm2 &> /dev/null; then
        echo 'Instalando PM2...'
        npm install -g pm2
    fi
    
    # Parar aplicação se estiver rodando
    pm2 stop $APP_NAME 2>/dev/null || echo 'Aplicação não estava rodando'
    
    # Iniciar/reiniciar aplicação
    pm2 start ecosystem.config.js
    
    # Salvar configuração do PM2
    pm2 save
    
    # Configurar PM2 para iniciar no boot (apenas na primeira vez)
    pm2 startup 2>/dev/null || echo 'PM2 startup já configurado'
    
    echo 'Deploy concluído com sucesso!'
"

print_status "Deploy concluído!"

# Verificar se a aplicação está rodando
echo -e "${BLUE}🔍 Verificando status da aplicação...${NC}"
ssh $VPS_USER@$VPS_HOST "pm2 status $APP_NAME"

# Testar se a aplicação está respondendo
echo -e "${BLUE}🌐 Testando conectividade...${NC}"
if ssh $VPS_USER@$VPS_HOST "curl -f http://localhost:3000 > /dev/null 2>&1"; then
    print_status "Aplicação está respondendo corretamente!"
    echo -e "${GREEN}🎉 Deploy realizado com sucesso!${NC}"
    echo -e "${BLUE}🌐 Acesse: http://$VPS_HOST:3000${NC}"
else
    print_warning "Aplicação pode estar iniciando... Verifique os logs:"
    echo -e "${YELLOW}ssh $VPS_USER@$VPS_HOST 'pm2 logs $APP_NAME'${NC}"
fi

echo -e "${BLUE}📊 Para monitorar a aplicação:${NC}"
echo -e "ssh $VPS_USER@$VPS_HOST 'pm2 monit'"
echo -e "ssh $VPS_USER@$VPS_HOST 'pm2 logs $APP_NAME'"
