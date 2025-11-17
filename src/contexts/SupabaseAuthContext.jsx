import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  console.log('[SupabaseAuthContext] AuthProvider MONTADO');
  const { toast } = useToast();

  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId) => {
    if (!userId) return null;

    console.log('[SupabaseAuthContext] Fetching profile for user:', userId);
    const startTime = performance.now();

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`*`)
        .eq('id', userId)
        .maybeSingle(); // Usar maybeSingle en lugar de single para permitir 0 filas

      const duration = performance.now() - startTime;
      console.log(`[SupabaseAuthContext] Profile fetch completed in ${duration.toFixed(0)}ms`);

      if (error) {
        console.error('[SupabaseAuthContext] Error fetching profile:', error);
        throw error;
      }

      if (data) {
        console.log('[SupabaseAuthContext] Profile found:', data.id);
        return data;
      } else {
        console.log('[SupabaseAuthContext] No profile found, will use defaults');
      }
    } catch (error) {
      console.error('[SupabaseAuthContext] Profile fetch failed:', error.message);
    }
    return null;
  }, []);

  const handleSession = useCallback(async (currentSession) => {
    console.log('[SupabaseAuthContext] handleSession called, has session:', !!currentSession);
    const startTime = performance.now();

    setSession(currentSession);
    const currentUser = currentSession?.user ?? null;
    setUser(currentUser);

    if (currentUser) {
      console.log('[SupabaseAuthContext] User authenticated:', currentUser.email);

      // Optimización: establecer loading en false ANTES de fetchProfile
      // para que la UI se actualice inmediatamente
      setLoading(false);

      // Fetch profile en background (no bloquea UI)
      fetchProfile(currentUser.id).then(userProfile => {
        setProfile(userProfile);
        const duration = performance.now() - startTime;
        console.log(`[SupabaseAuthContext] Total handleSession time: ${duration.toFixed(0)}ms`);
      });
    } else {
      console.log('[SupabaseAuthContext] No user, clearing session');
      setProfile(null);
      setLoading(false);
    }
  }, [fetchProfile]);

  useEffect(() => {
    console.log('[SupabaseAuthContext] useEffect INICIADO - URL:', window.location.href);

    const processAuth = async () => {
      try {
        // ✅ NUEVO: Manejar OAuth callback y errores
        if (typeof window !== 'undefined') {
          const url = new URL(window.location.href);
          console.log('[SupabaseAuthContext] Procesando URL, params:', url.search);

          // Detectar errores de OAuth en la URL
          const error = url.searchParams.get('error');
          const errorDescription = url.searchParams.get('error_description');

          if (error) {
            console.error('[SupabaseAuthContext] OAuth error in URL:', error, errorDescription);

            // Limpiar URL
            const cleanUrl = `${url.origin}${url.pathname}`;
            window.history.replaceState({}, document.title, cleanUrl);

            // Mostrar error al usuario
            toast({
              variant: "destructive",
              title: "Error de Autenticación con Google",
              description: errorDescription?.replace(/\+/g, ' ') || "No se pudo completar el inicio de sesión. Intenta nuevamente."
            });

            await handleSession(null);
            return;
          }

          // ✅ PKCE flow: Con detectSessionInUrl: true, Supabase procesa automáticamente el callback
          // El código OAuth en la URL será manejado automáticamente por Supabase
          const code = url.searchParams.get('code');
          if (code) {
            console.log('[SupabaseAuthContext] Detectado código OAuth (PKCE), Supabase lo procesará automáticamente');
            // Supabase procesará el código automáticamente gracias a detectSessionInUrl: true
            // El onAuthStateChange se disparará cuando la sesión esté lista
            // No necesitamos hacer nada más aquí
          }

          // Limpiar hash fragment si existe (de sesiones anteriores con implicit flow)
          if (window.location.hash && !code) {
            console.log('[SupabaseAuthContext] Limpiando hash fragment antiguo (implicit flow)');
            const cleanUrl = `${url.origin}${url.pathname}${url.search}`;
            window.history.replaceState({}, document.title, cleanUrl);
          }
        }

        // Si no hay OAuth callback, intentar recuperar sesión existente
        console.log('[SupabaseAuthContext] Verificando sesión existente...');
        const { data: { session: existingSession } } = await supabase.auth.getSession();
        if (existingSession) {
          console.log('[SupabaseAuthContext] Sesión existente encontrada');
          await handleSession(existingSession);
        } else {
          console.log('[SupabaseAuthContext] No hay sesión activa');
          await handleSession(null);
        }
      } catch (error) {
        console.error('[SupabaseAuthContext] Failed to fetch session:', error);
        await handleSession(null);
      }
    };

    processAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        try {
          await handleSession(newSession);
        } catch (error) {
          console.error('[SupabaseAuthContext] Error in auth state change:', error);
        }
      }
    );

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [handleSession, toast]);

  const signUp = useCallback(async (email, password, options) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options,
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Sign up Failed",
        description: error.message || "Something went wrong",
      });
    }

    return { error };
  }, [toast]);

  const signIn = useCallback(async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Sign in Failed",
        description: error.message || "Something went wrong",
      });
    }

    return { error };
  }, [toast]);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      toast({
        variant: "destructive",
        title: "Sign out Failed",
        description: error.message || "Something went wrong",
      });
    }

    return { error };
  }, [toast]);

  const value = useMemo(() => ({
    user,
    session,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
  }), [user, session, profile, loading, signUp, signIn, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};