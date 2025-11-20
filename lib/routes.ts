/**
 * Configuração de rotas unificada para a aplicação
 */

// Estrutura de rotas para a aplicação unificada
export const routes = {
  // Landing pages (antigas rotas do Vite)
  landing: {
    home: '/',
    login: '/login',
    register: '/registro',
    recoverPassword: '/recuperar-senha',
    maturityCalculator: '/calculadora-maturidade',
    contact: '/contato'
  },

  // Rotas do painel administrativo
  admin: {
    // Rota base
    root: '/admin',
    
    // Rotas específicas
    dashboard: '/admin/dashboard',
    analytics: '/admin/analytics',
    chats: '/admin/chats',
    leads: '/admin/leads',
    imoveis: '/admin/imoveis',
    moby: '/admin/moby',
    config: '/admin/config',
    
    // Subrotas com parâmetros
    chatDetail: (id: string) => `/admin/chats/${id}`,
    leadDetail: (id: string) => `/admin/leads/${id}`,
    imovelDetail: (id: string) => `/admin/imoveis/${id}`,
  },

  // Rotas de API
  api: {
    moby: {
      chat: '/api/moby/chat',
      aiMetrics: '/api/moby/ai-metrics',
      generateDescription: '/api/moby/generate-description',
      summarizeDocument: '/api/moby/summarize-document',
    }
  }
};