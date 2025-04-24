
export const AppConfig = {
  // Company Info
  company: {
    name: "PrescrevaMe",
    fullName: "PrescrevaMe - Assistente Médico",
    description: "Sua plataforma de assistência médica inteligente",
    copyright: "© PrescrevaMe. Todos os direitos reservados.",
    supportWhatsapp: "556392437559",
  },

  // PWA Configuration
  pwa: {
    name: "PrescrevaMe - Assistente Médico",
    shortName: "PrescrevaMe",
    description: "Sua plataforma de assistência médica inteligente",
    backgroundColor: "#0D1418",
    themeColor: "#57D789",
    installPrompt: {
      title: "💫 Instale o PrescrevaMe",
      description: "Tenha acesso rápido ao seu assistente médico!",
      buttonText: "Instalar App",
      successTitle: "✨ Instalação concluída!",
      successMessage: "O PrescrevaMe agora está disponível no seu dispositivo.",
    }
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

  // SEO Configuration
  seo: {
    title: "PrescrevaMe - Assistente Médico",
    description: "Sua plataforma de assistência médica inteligente",
    author: "PrescrevaMe",
    keywords: ["medical", "healthcare", "productivity", "ai", "assistant"],
    ogImage: "/lovable-uploads/f9d8ee9c-efab-4f5c-98b5-b08a1a131d86.png",
    twitterHandle: "@prescrevame",
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
} as const;

