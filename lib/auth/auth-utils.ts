import { supabase } from '../supabase/client';
import { routes } from '../routes';

/**
 * Função de login comum para toda a aplicação
 */
export async function signIn(email: string, password: string) {
  try {
    console.log('Tentando fazer login com:', { email, passwordLength: password.length });
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    console.log('Resposta do Supabase:', { data, error });
    
    if (error) throw error;
    
    // Redireciona para o dashboard
    const redirectPath = routes.admin.dashboard;
    
    // Retorna dados para gerenciamento
    return { 
      success: true, 
      user: data.user,
      redirectPath 
    };
  } catch (error: any) {
    console.error('Erro de autenticação:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
}

/**
 * Função de registro comum para toda a aplicação
 */
export async function signUp(email: string, password: string, metadata = {}) {
  try {
    console.log('Registrando usuário:', { email, metadata });
    
    // Configurar para confirmações automáticas no ambiente de desenvolvimento
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
        emailRedirectTo: `${window.location.origin}/login`,
        // Desativar verificação por email para facilitar o teste
        // Opção removida pois não existe na versão atual do Supabase
      }
    });
    
    console.log('Resposta do registro:', { data, error });
    
    if (error) throw error;
    
    // Também fazer login imediatamente após o registro bem-sucedido para ambiente de dev
    if (data.user && !data.session) {
      try {
        console.log('Tentando login automático após registro');
        const loginResult = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        console.log('Resultado do login automático:', loginResult);
        data.session = loginResult.data.session;
      } catch (loginError) {
        console.error('Erro no login automático:', loginError);
      }
    }
    
    return { 
      success: true, 
      user: data.user,
      session: data.session
    };
  } catch (error: any) {
    console.error('Erro no registro:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
}

/**
 * Função de logout
 */
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    return { 
      success: false, 
      error: error.message 
    };
  }
}

/**
 * Função para redefinir senha
 */
export async function resetPassword(email: string) {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/recuperar-senha`,
    });
    
    if (error) throw error;
    
    return { success: true };
  } catch (error: any) {
    return { 
      success: false, 
      error: error.message 
    };
  }
}

/**
 * Função para obter o usuário atual
 */
// Removido devido a problemas de tipo e substituído por chamada direta ao Supabase
// export async function getCurrentUser()...
// Se esta função for necessária, descomente e corrija os tipos conforme necessário