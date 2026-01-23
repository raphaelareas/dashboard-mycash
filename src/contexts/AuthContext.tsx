import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { detectUserLocale } from '@/utils/localeDetection';
import { detectCountryByIPWithFallback } from '@/services/ipLocationService';

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
    let initialSessionChecked = false;
    
    // Timeout de segurança: se após 5 segundos ainda estiver carregando, forçar loading = false
    timeoutId = setTimeout(() => {
      if (isMounted && !initialSessionChecked) {
        console.warn('Timeout ao verificar autenticação - assumindo não autenticado');
        setLoading(false);
      }
    }, 5000);

    // Verificar sessão inicial
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (!isMounted) return;
      initialSessionChecked = true;
      clearTimeout(timeoutId);
      if (error) {
        console.error('Erro ao obter sessão:', error);
        setSession(null);
        setUser(null);
        setLoading(false);
      } else if (session) {
        // Sessão encontrada - atualizar estado
        console.log('Sessão encontrada na inicialização:', session.user?.email);
        setSession(session);
        setUser(session.user);
        setLoading(false);
      } else {
        // Sem sessão - usuário não autenticado
        console.log('Nenhuma sessão encontrada na inicialização');
        setSession(null);
        setUser(null);
        setLoading(false);
      }
    }).catch((error) => {
      if (!isMounted) return;
      initialSessionChecked = true;
      clearTimeout(timeoutId);
      console.error('Erro ao verificar sessão:', error);
      setSession(null);
      setUser(null);
      setLoading(false);
    });

    // Listener para mudanças de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;
      clearTimeout(timeoutId);
      
      // Tratar eventos específicos
      if (event === 'SIGNED_OUT') {
        // Logout explícito - limpar estado
        setSession(null);
        setUser(null);
        setLoading(false);
        return;
      }
      
      // Para TOKEN_REFRESHED, manter a sessão atual se o user.id for o mesmo
      if (event === 'TOKEN_REFRESHED') {
        setSession((prevSession) => {
          if (prevSession?.user?.id === session?.user?.id && session) {
            // Atualizar apenas o token, mantendo o resto
            return session;
          }
          return session || null;
        });
        setUser((prevUser) => {
          if (prevUser?.id === session?.user?.id && session?.user) {
            return session.user;
          }
          return session?.user ?? null;
        });
        setLoading(false);
        return;
      }
      
      // Para SIGNED_IN, sempre atualizar e verificar se precisa atualizar preferências
      if (event === 'SIGNED_IN') {
        if (session) {
          console.log('SIGNED_IN detectado:', session.user?.email);
          setSession(session);
          setUser(session.user);
          
          // Verificar e atualizar preferências baseadas em IP para usuários existentes
          updateUserLocaleIfNeeded(session.user.id);
        }
        setLoading(false);
        return;
      }
      
      // Para INITIAL_SESSION, tratar como verificação inicial
      if (event === 'INITIAL_SESSION') {
        if (session) {
          console.log('INITIAL_SESSION detectado:', session.user?.email);
          setSession(session);
          setUser(session.user);
          
          // Verificar e atualizar preferências baseadas em IP para usuários existentes
          updateUserLocaleIfNeeded(session.user.id);
        } else {
          console.log('INITIAL_SESSION: nenhuma sessão encontrada');
          setSession(null);
          setUser(null);
        }
        setLoading(false);
        return;
      }
      
      // Para outros eventos, verificar se a sessão realmente mudou
      const newUser = session?.user ?? null;
      const newSession = session || null;
      
      // Comparar de forma mais robusta
      setSession((prevSession) => {
        // Se ambas são null, não mudou
        if (!prevSession && !newSession) {
          return prevSession;
        }
        // Se uma é null e outra não, mudou
        if (!prevSession || !newSession) {
          return newSession;
        }
        // Comparar access_token e user.id
        if (prevSession.access_token === newSession.access_token && 
            prevSession.user?.id === newSession.user?.id) {
          return prevSession; // Não mudou
        }
        return newSession; // Mudou
      });
      
      setUser((prevUser) => {
        // Se ambas são null, não mudou
        if (!prevUser && !newUser) {
          return prevUser;
        }
        // Se uma é null e outra não, mudou
        if (!prevUser || !newUser) {
          return newUser;
        }
        // Comparar IDs
        if (prevUser.id === newUser.id) {
          return prevUser; // Não mudou
        }
        return newUser; // Mudou
      });
      
      setLoading(false);
    });

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  // Função para atualizar preferências do usuário baseadas em IP (se necessário)
  const updateUserLocaleIfNeeded = async (userId: string) => {
    try {
      // Buscar perfil do usuário
      const { data: profile, error: fetchError } = await supabase
        .from('users')
        .select('language, currency, date_format')
        .eq('id', userId)
        .single();

      if (fetchError || !profile) {
        console.warn('⚠️ Erro ao buscar perfil para atualizar locale:', fetchError);
        return;
      }

      // Verificar se o usuário já tem preferências personalizadas (não são valores padrão genéricos)
      // Se já tem valores personalizados, não atualizar
      // Atualizar apenas se TODOS os valores forem padrão (pt-BR, BRL, DD/MM/YYYY)
      const hasCustomPreferences = 
        (profile.language && profile.language !== 'pt-BR') ||
        (profile.currency && profile.currency !== 'BRL') ||
        (profile.date_format && profile.date_format !== 'DD/MM/YYYY');

      if (hasCustomPreferences) {
        console.log('✅ Usuário já tem preferências personalizadas, mantendo:', profile);
        return;
      }

      // Se não tem preferências personalizadas, detectar por IP e atualizar
      console.log('🌍 Detectando país por IP para atualizar preferências do usuário existente...');
      const detectedCountry = await detectCountryByIPWithFallback();
      const locale = detectUserLocale(detectedCountry);

      // Atualizar apenas se os valores forem diferentes dos padrões atuais
      const updates: any = {};
      
      if (!profile.language || profile.language === 'pt-BR') {
        updates.language = locale.language || 'pt-BR';
      }
      if (!profile.currency || profile.currency === 'BRL') {
        updates.currency = locale.currency || 'BRL';
      }
      if (!profile.date_format || profile.date_format === 'DD/MM/YYYY') {
        updates.date_format = locale.dateFormat || 'DD/MM/YYYY';
      }

      if (Object.keys(updates).length > 0) {
        console.log('🔄 Atualizando preferências do usuário:', updates);
        const { error: updateError } = await supabase
          .from('users')
          .update(updates)
          .eq('id', userId);

        if (updateError) {
          console.error('❌ Erro ao atualizar preferências:', updateError);
        } else {
          console.log('✅ Preferências atualizadas com sucesso baseadas no IP');
        }
      }
    } catch (error) {
      console.warn('⚠️ Erro ao atualizar locale do usuário (não crítico):', error);
      // Não bloquear o fluxo em caso de erro
    }
  };

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

      // Não atualizar estado aqui - deixar o onAuthStateChange fazer isso
      // Isso evita condições de corrida e garante sincronização
      // O onAuthStateChange será disparado automaticamente após signIn

      if (data.user) {
        // Criar/atualizar registro na tabela users se necessário
        try {
          const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('id', data.user.id)
            .single();

          if (!existingUser) {
            // Criar perfil do usuário na primeira vez usando idioma do localStorage
            const savedLanguage = localStorage.getItem('language') as LanguageCode;
            const hasManualLanguage = localStorage.getItem('language_manually_set') === 'true';
            
            let finalLanguage: string;
            let detectedCountry: string | null = null;
            let locale: ReturnType<typeof detectUserLocale>;
            
            if (hasManualLanguage && savedLanguage) {
              // Usar idioma escolhido pelo usuário
              console.log('✅ Usando idioma escolhido pelo usuário no login:', savedLanguage);
              finalLanguage = savedLanguage;
              detectedCountry = await detectCountryByIPWithFallback();
              locale = detectUserLocale(detectedCountry);
              locale.language = savedLanguage;
            } else {
              // Detectar por IP
              detectedCountry = await detectCountryByIPWithFallback();
              locale = detectUserLocale(detectedCountry);
              finalLanguage = locale.language || 'pt-BR';
            }
            
            // @ts-ignore - Database types serão gerados depois das migrations
            await supabase.from('users').insert({
              id: data.user.id,
              email: data.user.email || '',
              name: data.user.email?.split('@')[0] || 'Usuário',
              currency: locale.currency,
              date_format: locale.dateFormat,
              language: finalLanguage,
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
          data: {
            name,
            full_name: name,
          },
        },
      });

      if (error) {
        return { error };
      }

      if (data.user) {
        // Criar perfil do usuário após signup usando idioma do localStorage (escolha do usuário)
        try {
          // Priorizar idioma do localStorage (escolha manual do usuário no dropdown)
          const savedLanguage = localStorage.getItem('language') as LanguageCode;
          const hasManualLanguage = localStorage.getItem('language_manually_set') === 'true';
          
          let finalLanguage: string;
          let detectedCountry: string | null = null;
          let locale: ReturnType<typeof detectUserLocale>;
          
          if (hasManualLanguage && savedLanguage) {
            // Usar idioma escolhido pelo usuário no dropdown
            console.log('✅ Usando idioma escolhido pelo usuário:', savedLanguage);
            finalLanguage = savedLanguage;
            // Detectar país por IP apenas para moeda e formato de data
            detectedCountry = await detectCountryByIPWithFallback();
            locale = detectUserLocale(detectedCountry);
            // Manter o idioma escolhido pelo usuário, mas usar moeda/data do país
            locale.language = savedLanguage;
          } else {
            // Se não há escolha manual, detectar por IP
            console.log('🌍 Detectando país por IP para novo usuário...');
            detectedCountry = await detectCountryByIPWithFallback();
            locale = detectUserLocale(detectedCountry);
            finalLanguage = locale.language || 'pt-BR';
          }
          
          console.log('✅ Configurações para novo usuário:', {
            country: detectedCountry || 'não detectado (usando navegador)',
            language: finalLanguage,
            currency: locale.currency,
            dateFormat: locale.dateFormat,
            source: hasManualLanguage ? 'escolha do usuário' : 'detecção por IP',
          });
          
          // @ts-ignore - Database types serão gerados depois das migrations
          await supabase.from('users').insert({
            id: data.user.id,
            email: data.user.email || email,
            name,
            currency: locale.currency,
            date_format: locale.dateFormat,
            language: finalLanguage,
          });

          // Criar owner automaticamente com o nome do usuário
          try {
            const { error: ownerError } = await supabase
              .from('family_members')
              .insert({
                user_id: data.user.id,
                name: name, // Nome do usuário cadastrado
                role: 'Owner',
                is_active: true,
                color: '#DBEAFE', // Cor pastel padrão para owner
              });

            if (ownerError) {
              console.error('Erro ao criar owner automaticamente:', ownerError);
              // Não bloquear o signup se falhar ao criar owner
            }
          } catch (ownerError: any) {
            console.error('Erro ao criar owner automaticamente:', ownerError);
            // Não bloquear o signup se falhar ao criar owner
          }
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
