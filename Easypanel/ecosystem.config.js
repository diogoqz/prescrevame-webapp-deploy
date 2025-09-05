module.exports = {
  apps: [{
    name: 'prescrevame-app',
    script: 'server.js',
    instances: 'max', // Usar todos os cores disponíveis
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    // Configurações de monitoramento
    max_memory_restart: '500M',
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    // Configurações de restart
    restart_delay: 1000,
    max_restarts: 10,
    min_uptime: '10s',
    // Configurações de watch (desabilitado em produção)
    watch: false,
    ignore_watch: ['node_modules', 'logs'],
    // Configurações de cluster
    kill_timeout: 5000,
    listen_timeout: 3000,
    // Health check
    health_check_grace_period: 3000
  }]
};
