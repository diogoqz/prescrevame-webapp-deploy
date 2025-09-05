#!/bin/bash

# 🚀 Script de Deploy Simples - PrescrevAme
# Para usar em containers ou VPS simples

set -e

echo "🚀 Iniciando PrescrevAme..."

# Verificar se estamos no diretório correto
if [ ! -f "server.js" ]; then
    echo "❌ Erro: server.js não encontrado. Execute no diretório correto."
    exit 1
fi

# Criar diretório de logs
mkdir -p logs

echo "✅ Estrutura verificada"

# Verificar se as dependências estão instaladas
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências..."
    npm install --production --no-fund --silent
    echo "✅ Dependências instaladas"
else
    echo "✅ Dependências já instaladas"
fi

# Verificar se PM2 está disponível
if command -v pm2 &> /dev/null; then
    echo "🔧 Usando PM2..."
    
    # Parar aplicação se estiver rodando
    pm2 stop prescrevame-app 2>/dev/null || echo "ℹ️  Aplicação não estava rodando"
    
    # Iniciar com PM2
    pm2 start ecosystem.config.js
    pm2 save 2>/dev/null || true
    
    echo "✅ Aplicação iniciada com PM2"
    pm2 status prescrevame-app
else
    echo "🔧 PM2 não encontrado, iniciando com Node.js..."
    
    # Matar processos existentes na porta 3000
    pkill -f "node.*server.js" 2>/dev/null || true
    sleep 2
    
    # Iniciar em background
    nohup node server.js > logs/app.log 2>&1 &
    
    echo "✅ Aplicação iniciada com Node.js"
    echo "📊 PID: $!"
fi

# Aguardar um pouco para a aplicação iniciar
sleep 3

# Testar se está funcionando
echo "🔍 Testando aplicação..."
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Aplicação está respondendo!"
    echo "🌐 Acesse: http://localhost:3000"
elif curl -f http://localhost:3000 -m 10 > /dev/null 2>&1; then
    echo "✅ Aplicação está respondendo (demorou um pouco)!"
    echo "🌐 Acesse: http://localhost:3000"
else
    echo "⚠️  Aplicação pode estar iniciando..."
    echo "📝 Verifique os logs:"
    if command -v pm2 &> /dev/null; then
        echo "   pm2 logs prescrevame-app"
    else
        echo "   tail -f logs/app.log"
    fi
fi

echo "🎉 Deploy concluído!"
