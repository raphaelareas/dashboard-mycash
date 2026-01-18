import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let isMounted = true;
    
    // Timeout de segurança: se após 5 segundos ainda estiver carregando, forçar loading = false
    timeoutId = setTimeout(() => {
      if (isMounted) {
        console.warn('Timeout ao verificar autenticação - assumindo não autenticado');
        setLoading(false);
      }
    }, 5000);

    // Verificar sessão inicial
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (!isMounted) return;
      clearTimeout(timeoutId);
      if (error) {
        console.error('Erro ao obter sessão:', error);
      }
      setSession(session || null);
      setUser(session?.user ?? null);
      setLoading(false);
    }).catch((error) => {
      if (!isMounted) return;
      clearTimeout(timeoutId);
      console.error('Erro ao verificar sessão:', error);
      setSession(null);
      setUser(null);
      setLoading(false);
    });

    // Listener para mudanças de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;
      clearTimeout(timeoutId);
      setSession(session || null);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    // Verificar se Supabase está configurado antes de tentar
    if (!isSupabaseConfigured()) {
      const authError: any = {
        message: 'Supabase não está configurado. Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY nas variáveis de ambiente da Vercel.',
      };
      return { error: authError };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error };
      }

      if (data.user) {
        // Criar/atualizar registro na tabela users se necessário
        try {
          const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('id', data.user.id)
            .single();

          if (!existingUser) {
            // Criar perfil do usuário na primeira vez
            // @ts-ignore - Database types serão gerados depois das migrations
            await supabase.from('users').insert({
              id: data.user.id,
              email: data.user.email || '',
              name: data.user.email?.split('@')[0] || 'Usuário',
            });
          }
        } catch (insertError: any) {
          // Se falhar ao inserir na tabela users, logar mas não bloquear o login
          console.error('Erro ao verificar/criar perfil do usuário:', insertError);
        }
      }

      return { error: null };
    } catch (err: any) {
      // Tratar erros de rede/connection
      console.error('Erro ao fazer login:', err);
      const authError: any = {
        message: err.message || 'Erro ao conectar com o servidor. Verifique sua conexão.',
      };
      if (err.message?.includes('fetch') || err.message?.includes('network') || err.message?.includes('Failed to fetch')) {
        authError.message = 'Não foi possível conectar ao Supabase. Verifique se as variáveis de ambiente (VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY) estão configuradas corretamente na Vercel.';
      }
      return { error: authError };
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    // Verificar se Supabase está configurado antes de tentar
    if (!isSupabaseConfigured()) {
      const authError: any = {
        message: 'Supabase não está configurado. Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY nas variáveis de ambiente da Vercel.',
      };
      return { error: authError };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) {
        return { error };
      }

      if (data.user) {
        // Criar perfil do usuário após signup
        try {
          // @ts-ignore - Database types serão gerados depois das migrations
          await supabase.from('users').insert({
            id: data.user.id,
            email: data.user.email || email,
            name,
          });
        } catch (insertError: any) {
          // Se falhar ao inserir na tabela users, logar mas não bloquear o signup
          console.error('Erro ao criar perfil do usuário:', insertError);
        }
      }

      return { error: null };
    } catch (err: any) {
      // Tratar erros de rede/connection
      console.error('Erro ao criar conta:', err);
      const authError: any = {
        message: err.message || 'Erro ao conectar com o servidor. Verifique sua conexão.',
      };
      if (err.message?.includes('fetch') || err.message?.includes('network') || err.message?.includes('Failed to fetch')) {
        authError.message = 'Não foi possível conectar ao Supabase. Verifique se as variáveis de ambiente (VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY) estão configuradas corretamente na Vercel.';
      }
      return { error: authError };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signIn,
        signUp,
        signOut,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
