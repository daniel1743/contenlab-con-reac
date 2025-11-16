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
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`*`)
        .eq('id', userId)
        .maybeSingle(); // Usar maybeSingle en lugar de single para permitir 0 filas

      if (error) {
        throw error;
      }

      if (data) {
        return data;
      }
    } catch (error) {
      console.error('Error fetching profile:', error.message);
    }
    return null;
  }, []);

  const handleSession = useCallback(async (currentSession) => {
    setSession(currentSession);
    const currentUser = currentSession?.user ?? null;
    setUser(currentUser);

    if (currentUser) {
      const userProfile = await fetchProfile(currentUser.id);
      setProfile(userProfile);
    } else {
      setProfile(null);
    }
    setLoading(false);
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

          const code = url.searchParams.get('code');

          if (code) {
            console.log('[SupabaseAuthContext] Processing OAuth callback with code');

            try {
              // Intercambiar el código por una sesión
              const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

              if (exchangeError) {
                console.error('[SupabaseAuthContext] Error exchanging code for session:', exchangeError);

                // Limpiar URL
                const cleanUrl = `${url.origin}${url.pathname}`;
                window.history.replaceState({}, document.title, cleanUrl);

                toast({
                  variant: "destructive",
                  title: "Error al Conectar con Google",
                  description: "El código de autenticación expiró o es inválido. Por favor, intenta iniciar sesión nuevamente."
                });

                await handleSession(null);
              } else {
                console.log('[SupabaseAuthContext] OAuth successful, session created');
                await handleSession(data.session);

                // Limpiar URL sin recargar
                const cleanUrl = `${url.origin}${url.pathname}`;
                window.history.replaceState({}, document.title, cleanUrl);

                toast({
                  title: "¡Bienvenido!",
                  description: "Has iniciado sesión con Google correctamente."
                });

                return; // Salir temprano ya que tenemos sesión
              }
            } catch (exchangeErr) {
              console.error('[SupabaseAuthContext] Exception during code exchange:', exchangeErr);

              // Limpiar URL
              const cleanUrl = `${url.origin}${url.pathname}`;
              window.history.replaceState({}, document.title, cleanUrl);

              toast({
                variant: "destructive",
                title: "Error Inesperado",
                description: "Ocurrió un error al procesar la autenticación. Intenta nuevamente."
              });

              await handleSession(null);
            }
          }
        }

        // Obtener sesión existente
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        if (error) {
          console.warn('[SupabaseAuthContext] Error getting session:', error);
          await handleSession(null);
          return;
        }
        await handleSession(currentSession);
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