export const AppConfig = {
  // Company Info
  company: {
    name: "PrescrevaMe",
    fullName: "PrescrevaMe - Assistente Médico",
    description: "Sua plataforma de assistência médica inteligente",
    copyright: "© PrescrevaMe. Todos os direitos reservados.",
    supportWhatsapp: "556392437559",
  },

  // Chat Configuration
  chat: {
    desktop: {
      maxWidth: "lg", // Tailwind max-w classes: sm, md, lg, xl
      padding: "4", // Tailwind p classes: 0-16
    },
    welcome: {
      authenticated: "Olá! Eu sou o PrescrevaMe. Como posso te ajudar hoje?",
      unauthenticated: "Bem-vindo ao PrescrevaMe! Por favor, faça login ou cadastre-se para continuar.",
    },
    buttons: {
      login: "Login",
      signup: "Cadastro",
      moreInfo: "Mais Informações",
    },
  },

  // Auth Configuration
  auth: {
    login: {
      title: "Entrar",
      description: "Faça login para acessar sua conta",
      emailLabel: "Email",
      emailPlaceholder: "seuemail@exemplo.com",
      passwordLabel: "Senha",
      passwordPlaceholder: "********",
      submitButton: "Entrar",
      noAccountText: "Não tem uma conta?",
      signupLink: "Cadastre-se",
    },
    signup: {
      title: "Cadastrar",
      description: "Crie uma conta para começar",
      emailLabel: "Email",
      emailPlaceholder: "seuemail@exemplo.com",
      passwordLabel: "Senha",
      passwordPlaceholder: "********",
      submitButton: "Cadastrar",
      hasAccountText: "Já tem uma conta?",
      loginLink: "Faça login",
    },
    support: {
      buttonText: "Suporte",
    },
  },

  // Error Messages
  errors: {
    auth: {
      generic: "Ocorreu um erro durante a autenticação.",
      unauthorized: "Por favor, faça login para enviar mensagens.",
    },
    upload: {
      invalidType: "Por favor, selecione apenas arquivos de imagem.",
      sizeLimit: "A imagem deve ter menos de 5MB.",
    },
  },

  // Feature Flags
  features: {
    voiceRecording: {
      enabled: false,
      developmentMessage: "Funcionalidade em desenvolvimento.",
    },
  },

  // Webhooks
  webhooks: {
    // Defina a URL do webhook de trial (ex.: Zapier, Make, seu backend)
    trial: "https://srv-n8n.rtp53d.easypanel.host/webhook/bdb16435-5b9b-4d29-bd1f-50e2c5280217",
  },
} as const;
