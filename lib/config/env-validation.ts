/**
 * Sistema de validação de variáveis de ambiente
 * Garante que todas as variáveis necessárias estão configuradas corretamente
 */

type EnvVarConfig = {
  key: string;
  required: boolean;
  default?: string;
  description: string;
  category: 'core' | 'ai' | 'messaging' | 'database' | 'security' | 'optional';
  condition?: () => boolean; // Função que determina se a variável é necessária
};

// Configuração de todas as variáveis de ambiente
const ENV_VARS: EnvVarConfig[] = [
  // Core - Azure Configuration (replacing Supabase)
  {
    key: 'AZURE_FUNCTIONS_BASE_URL',
    required: false,
    default: 'http://localhost:7071/api',
    description: 'URL base das Azure Functions',
    category: 'core'
  },
  
  // Database/Redis
  {
    key: 'REDIS_HOST',
    required: true,
    default: '52.188.186.112',
    description: 'Host do servidor Redis',
    category: 'database'
  },
  {
    key: 'REDIS_PORT',
    required: true,
    default: '6379',
    description: 'Porta do servidor Redis',
    category: 'database'
  },
  {
    key: 'REDIS_DB',
    required: true,
    default: '6',
    description: 'Banco de dados Redis',
    category: 'database'
  },
  {
    key: 'REDIS_USERNAME',
    required: false,
    default: 'default',
    description: 'Usuário do Redis',
    category: 'database'
  },
  {
    key: 'REDIS_PASSWORD',
    required: false,
    default: '',
    description: 'Senha do Redis',
    category: 'database'
  },
  
  // Security
  {
    key: 'API_KEY_ENCRYPTION_SECRET',
    required: true,
    description: 'Chave secreta para criptografia (mínimo 32 caracteres)',
    category: 'security'
  },
  {
    key: 'API_KEY_ENCRYPTION_SALT',
    required: true,
    description: 'Salt único para criptografia',
    category: 'security'
  },
  
  // AI - Condicionalmente obrigatórias
  {
    key: 'OPENAI_API_KEY',
    required: false,
    description: 'API Key da OpenAI',
    category: 'ai',
    condition: () => !process.env.AZURE_OPENAI_API_KEY // Obrigatória se não usar Azure
  },
  
  // Azure OpenAI (alternativa ao OpenAI)
  {
    key: 'AZURE_OPENAI_ENDPOINT',
    required: false,
    description: 'Endpoint do Azure OpenAI',
    category: 'ai',
    condition: () => !process.env.OPENAI_API_KEY // Obrigatória se não usar OpenAI direto
  },
  {
    key: 'AZURE_OPENAI_API_KEY',
    required: false,
    description: 'API Key do Azure OpenAI',
    category: 'ai',
    condition: () => !process.env.OPENAI_API_KEY
  },
  {
    key: 'AZURE_OPENAI_DEPLOYMENT_NAME',
    required: false,
    description: 'Nome do deployment Azure OpenAI',
    category: 'ai',
    condition: () => !!process.env.AZURE_OPENAI_API_KEY
  },
  {
    key: 'AZURE_OPENAI_API_VERSION',
    required: false,
    default: '2024-12-01-preview',
    description: 'Versão da API Azure OpenAI',
    category: 'ai'
  },
  
  // Processamento Multimodal
  {
    key: 'ASSEMBLYAI_API_KEY',
    required: false,
    description: 'API Key do AssemblyAI para transcrição',
    category: 'ai'
  },
  {
    key: 'ELEVENLABS_API_KEY',
    required: false,
    description: 'API Key do ElevenLabs para síntese de voz',
    category: 'ai'
  },
  {
    key: 'ELEVENLABS_VOICE_ID',
    required: false,
    description: 'ID da voz do ElevenLabs',
    category: 'ai',
    condition: () => !!process.env.ELEVENLABS_API_KEY
  },
  
  // Messaging - Email
  {
    key: 'SENDGRID_API_KEY',
    required: false,
    description: 'API Key do SendGrid para emails',
    category: 'messaging'
  },
  
  // Messaging - WhatsApp Evolution API
  {
    key: 'EVOLUTION_API_URL',
    required: false,
    default: 'https://evolution.moby.website',
    description: 'URL da Evolution API',
    category: 'messaging'
  },
  {
    key: 'EVOLUTION_API_KEY',
    required: false,
    description: 'API Key da Evolution API',
    category: 'messaging',
    condition: () => !!process.env.EVOLUTION_API_URL
  },
  {
    key: 'EVOLUTION_INSTANCE_NAME',
    required: false,
    description: 'Nome da instância Evolution',
    category: 'messaging',
    condition: () => !!process.env.EVOLUTION_API_KEY
  },
  
  // Messaging - SMS Twilio
  {
    key: 'TWILIO_ACCOUNT_SID',
    required: false,
    description: 'SID da conta Twilio',
    category: 'messaging'
  },
  {
    key: 'TWILIO_AUTH_TOKEN',
    required: false,
    description: 'Token de autenticação Twilio',
    category: 'messaging',
    condition: () => !!process.env.TWILIO_ACCOUNT_SID
  },
  {
    key: 'TWILIO_PHONE_NUMBER',
    required: false,
    description: 'Número de telefone Twilio',
    category: 'messaging',
    condition: () => !!process.env.TWILIO_ACCOUNT_SID
  },
  
  // Optional - Integrações extras
  {
    key: 'GOOGLE_VISION_API_KEY',
    required: false,
    description: 'API Key do Google Vision',
    category: 'optional'
  },
  {
    key: 'AZURE_VISION_ENDPOINT',
    required: false,
    description: 'Endpoint do Azure Vision',
    category: 'optional'
  },
  {
    key: 'AZURE_VISION_KEY',
    required: false,
    description: 'Chave do Azure Vision',
    category: 'optional',
    condition: () => !!process.env.AZURE_VISION_ENDPOINT
  },
  {
    key: 'META_GRAPH_ACCESS_TOKEN',
    required: false,
    description: 'Token de acesso Meta Graph API',
    category: 'optional'
  },
  {
    key: 'META_APP_ID',
    required: false,
    description: 'ID da aplicação Meta',
    category: 'optional',
    condition: () => !!process.env.META_GRAPH_ACCESS_TOKEN
  },
  
  // Environment
  {
    key: 'NODE_ENV',
    required: false,
    default: 'development',
    description: 'Ambiente de execução',
    category: 'core'
  }
];

// Resultado da validação
type ValidationResult = {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
};

/**
 * Valida todas as variáveis de ambiente
 */
export function validateEnvironment(): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    suggestions: []
  };
  
  // Agrupar variáveis por categoria
  const categories = {
    core: [] as EnvVarConfig[],
    ai: [] as EnvVarConfig[],
    messaging: [] as EnvVarConfig[],
    database: [] as EnvVarConfig[],
    security: [] as EnvVarConfig[],
    optional: [] as EnvVarConfig[]
  };
  
  ENV_VARS.forEach(envVar => {
    categories[envVar.category].push(envVar);
  });
  
  // Validar cada variável
  ENV_VARS.forEach(envVar => {
    const value = process.env[envVar.key];
    const isConditionallyRequired = envVar.condition ? envVar.condition() : false;
    
    // Verificar se é obrigatória
    if ((envVar.required || isConditionallyRequired) && !value && !envVar.default) {
      result.isValid = false;
      result.errors.push(
        `❌ ${envVar.key} é obrigatória: ${envVar.description}`
      );
    }
    
    // Verificar variáveis opcionais importantes
    if (!envVar.required && !value && envVar.category !== 'optional') {
      result.warnings.push(
        `⚠️  ${envVar.key} não está configurada: ${envVar.description}`
      );
    }
    
    // Validações específicas
    if (envVar.key === 'API_KEY_ENCRYPTION_SECRET' && value && value.length < 32) {
      result.isValid = false;
      result.errors.push(
        `❌ API_KEY_ENCRYPTION_SECRET deve ter pelo menos 32 caracteres`
      );
    }
    
    // Verificar se está usando valores padrão em produção
    if (process.env.NODE_ENV === 'production' && value === envVar.default) {
      result.warnings.push(
        `⚠️  ${envVar.key} está usando valor padrão em produção`
      );
    }
  });
  
  // Adicionar sugestões baseadas na configuração
  if (!process.env.OPENAI_API_KEY && !process.env.AZURE_OPENAI_API_KEY) {
    result.suggestions.push(
      '💡 Configure OPENAI_API_KEY ou AZURE_OPENAI_API_KEY para habilitar funcionalidades de IA'
    );
  }
  
  if (!process.env.SENDGRID_API_KEY) {
    result.suggestions.push(
      '💡 Configure SENDGRID_API_KEY para habilitar envio de emails'
    );
  }
  
  if (!process.env.EVOLUTION_API_KEY && !process.env.TWILIO_ACCOUNT_SID) {
    result.suggestions.push(
      '💡 Configure Evolution API ou Twilio para habilitar mensageria'
    );
  }
  
  // Verificar combinações de variáveis
  if (process.env.ELEVENLABS_API_KEY && !process.env.ELEVENLABS_VOICE_ID) {
    result.warnings.push(
      '⚠️  ELEVENLABS_API_KEY configurada mas ELEVENLABS_VOICE_ID não definida'
    );
  }
  
  return result;
}

/**
 * Gera um arquivo .env.example atualizado baseado na configuração
 */
export function generateEnvExample(): string {
  const grouped = ENV_VARS.reduce((acc, envVar) => {
    if (!acc[envVar.category]) {
      acc[envVar.category] = [];
    }
    acc[envVar.category].push(envVar);
    return acc;
  }, {} as Record<string, EnvVarConfig[]>);
  
  const categoryTitles = {
    core: 'Core Configuration',
    database: 'Database/Redis',
    security: 'Security',
    ai: 'AI Services',
    messaging: 'Messaging Services',
    optional: 'Optional Integrations'
  };
  
  let content = '# Moby CRM Environment Variables\n\n';
  
  Object.entries(categoryTitles).forEach(([category, title]) => {
    const vars = grouped[category as keyof typeof grouped];
    if (!vars || vars.length === 0) return;
    
    content += `# ${title}\n`;
    vars.forEach(envVar => {
      const required = envVar.required ? ' (REQUIRED)' : '';
      const defaultValue = envVar.default ? envVar.default : 'your_' + envVar.key.toLowerCase();
      content += `# ${envVar.description}${required}\n`;
      content += `${envVar.key}=${defaultValue}\n`;
    });
    content += '\n';
  });
  
  return content;
}

/**
 * Obtém a URL Redis formatada a partir das variáveis de ambiente
 */
export function getRedisUrl(): string {
  const host = process.env.REDIS_HOST || '52.188.186.112';
  const port = process.env.REDIS_PORT || '6379';
  const username = process.env.REDIS_USERNAME || 'default';
  const password = process.env.REDIS_PASSWORD || '';
  const db = process.env.REDIS_DB || '6';
  
  if (password) {
    return `redis://${username}:${password}@${host}:${port}/${db}`;
  }
  
  return `redis://${host}:${port}/${db}`;
}

/**
 * Verifica se as funcionalidades de IA estão configuradas
 */
export function isAIConfigured(): boolean {
  return !!(process.env.OPENAI_API_KEY || process.env.AZURE_OPENAI_API_KEY);
}

/**
 * Verifica se as funcionalidades de mensageria estão configuradas
 */
export function isMessagingConfigured(): {
  email: boolean;
  whatsapp: boolean;
  sms: boolean;
  any: boolean;
} {
  const email = !!process.env.SENDGRID_API_KEY;
  const whatsapp = !!process.env.EVOLUTION_API_KEY;
  const sms = !!process.env.TWILIO_ACCOUNT_SID;
  
  return {
    email,
    whatsapp,
    sms,
    any: email || whatsapp || sms
  };
}

/**
 * Imprime relatório de validação no console
 */
export function printValidationReport(result: ValidationResult): void {
  console.log('\n🔍 Validação de Variáveis de Ambiente\n');
  
  if (result.isValid) {
    console.log('✅ Todas as variáveis obrigatórias estão configuradas!\n');
  } else {
    console.log('❌ Existem erros na configuração!\n');
  }
  
  if (result.errors.length > 0) {
    console.log('Erros:');
    result.errors.forEach(error => console.log(error));
    console.log('');
  }
  
  if (result.warnings.length > 0) {
    console.log('Avisos:');
    result.warnings.forEach(warning => console.log(warning));
    console.log('');
  }
  
  if (result.suggestions.length > 0) {
    console.log('Sugestões:');
    result.suggestions.forEach(suggestion => console.log(suggestion));
    console.log('');
  }
  
  // Status das funcionalidades
  console.log('Status das Funcionalidades:');
  console.log(`- IA: ${isAIConfigured() ? '✅ Configurada' : '❌ Não configurada'}`);
  
  const messaging = isMessagingConfigured();
  console.log(`- Email: ${messaging.email ? '✅ Configurado' : '❌ Não configurado'}`);
  console.log(`- WhatsApp: ${messaging.whatsapp ? '✅ Configurado' : '❌ Não configurado'}`);
  console.log(`- SMS: ${messaging.sms ? '✅ Configurado' : '❌ Não configurado'}`);
  
  console.log('');
}

// Auto-validação ao importar em desenvolvimento
if (process.env.NODE_ENV === 'development' && typeof window === 'undefined') {
  const result = validateEnvironment();
  if (!result.isValid || result.warnings.length > 0) {
    printValidationReport(result);
  }
}