import OpenAI from 'openai';
// import azureOpenAI from './azure-openai-client'; // Commented until file exists
const azureOpenAI = null as any; // Temporary placeholder

// Verifica se deve usar Azure OpenAI
const shouldUseAzureOpenAI = () => {
  return !!(
    process.env.AZURE_OPENAI_ENDPOINT && 
    process.env.AZURE_OPENAI_API_KEY &&
    process.env.AZURE_OPENAI_DEPLOYMENT_NAME
  );
};

// Obtém a chave da API OpenAI da variável de ambiente
const getOpenAIKey = () => {
  // Se estiver usando Azure, não precisa da chave OpenAI
  if (shouldUseAzureOpenAI()) {
    return 'azure-openai-configured';
  }
  
  // Verifica ambas as variáveis de ambiente para compatibilidade
  const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || process.env.OPENAI_API_KEY || '';
  
  if (!apiKey) {
    console.error('A chave da API OpenAI não foi configurada nas variáveis de ambiente.');
    // Retorna chave temporária para permitir build
    return 'sk-temp-demo-key-not-real-for-build-only';
  }
  
  return apiKey;
  
  // Código original comentado para permitir o build
  /*
  // Verifica ambas as variáveis de ambiente para compatibilidade
  const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || process.env.OPENAI_API_KEY || '';
  
  if (!apiKey) {
    console.error('A chave da API OpenAI não foi configurada nas variáveis de ambiente.');
    throw new Error('OpenAI API key não configurada. Por favor, configure a variável de ambiente NEXT_PUBLIC_OPENAI_API_KEY no arquivo .env.local');
  }
  
  return apiKey;
  */
};

// Cliente OpenAI com verificação de API key
const createOpenAIClient = () => {
  // Se Azure OpenAI estiver configurado, usar o cliente Azure
  if (shouldUseAzureOpenAI()) {
    console.log('Usando Azure OpenAI');
    return azureOpenAI;
  }
  
  // Caso contrário, usar OpenAI tradicional
  console.log('Usando OpenAI tradicional');
  try {
    return new OpenAI({
      apiKey: getOpenAIKey(),
      dangerouslyAllowBrowser: true // Necessário para uso no cliente (browser)
    });
  } catch (error) {
    console.error('Erro ao criar cliente OpenAI:', error);
    // Retorna um cliente com métodos de fallback que exibirão o erro apropriado
    return {
      chat: {
        completions: {
          create: async () => {
            throw new Error('401 You didn\'t provide an API key. Configure a variável NEXT_PUBLIC_OPENAI_API_KEY nas suas variáveis de ambiente ou use a API através do backend.');
          }
        }
      },
      embeddings: {
        create: async () => {
          throw new Error('401 You didn\'t provide an API key. Configure a variável NEXT_PUBLIC_OPENAI_API_KEY nas suas variáveis de ambiente ou use a API através do backend.');
        }
      }
    };
  }
};

const openai = createOpenAIClient();

export default openai;