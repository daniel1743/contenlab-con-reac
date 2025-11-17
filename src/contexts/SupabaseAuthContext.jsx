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

          // ✅ NUEVO: Manejar implicit flow (#access_token en hash)
          // Con flowType: 'implicit', Google redirige con #access_token=...&refresh_token=...
          if (window.location.hash) {
            console.log('[SupabaseAuthContext] Detectado hash fragment (implicit flow)');
            const hashParams = new URLSearchParams(window.location.hash.substring(1));
            const accessToken = hashParams.get('access_token');
            const refreshToken = hashParams.get('refresh_token');

            if (accessToken && refreshToken) {
              console.log('[SupabaseAuthContext] Procesando tokens de implicit flow');
              const oauthStartTime = performance.now();

              try {
                // Establecer sesión manualmente con los tokens del hash
                const { data, error: sessionError } = await supabase.auth.setSession({
                  access_token: accessToken,
                  refresh_token: refreshToken
                });

                if (sessionError) {
                  console.error('[SupabaseAuthContext] Error setting session from hash:', sessionError);

                  toast({
                    variant: "destructive",
                    title: "Error al Establecer Sesión",
                    description: "Los tokens de autenticación son inválidos. Intenta nuevamente."
                  });

                  await handleSession(null);
                } else {
                  const exchangeDuration = performance.now() - oauthStartTime;
                  console.log(`[SupabaseAuthContext] Implicit OAuth successful in ${exchangeDuration.toFixed(0)}ms`);

                  await handleSession(data.session);

                  // Limpiar hash de la URL
                  const cleanUrl = `${url.origin}${url.pathname}`;
                  window.history.replaceState({}, document.title, cleanUrl);

                  toast({
                    title: "¡Bienvenido!",
                    description: "Has iniciado sesión con Google correctamente."
                  });

                  return; // Salir temprano
                }
              } catch (err) {
                console.error('[SupabaseAuthContext] Exception setting session from hash:', err);

                toast({
                  variant: "destructive",
                  title: "Error Inesperado",
                  description: "Ocurrió un error al procesar la autenticación. Intenta nuevamente."
                });

                await handleSession(null);
              }
            }
          }

          // Manejar PKCE flow (si lo usáramos en el futuro)
          const code = url.searchParams.get('code');
          if (code) {
            console.log('[SupabaseAuthContext] Processing OAuth callback with code (PKCE)');
            console.log('[SupabaseAuthContext] Full redirect URL enviada a Supabase:', window.location.href);
            const oauthStartTime = performance.now();

            try {
              const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(window.location.href);

              if (exchangeError) {
                console.error('[SupabaseAuthContext] Error exchanging code for session:', exchangeError);

                const cleanUrl = `${url.origin}${url.pathname}`;
                window.history.replaceState({}, document.title, cleanUrl);

                toast({
                  variant: "destructive",
                  title: "Error al Conectar con Google",
                  description: "El código de autenticación expiró o es inválido. Por favor, intenta iniciar sesión nuevamente."
                });

                await handleSession(null);
              } else {
                const exchangeDuration = performance.now() - oauthStartTime;
                console.log(`[SupabaseAuthContext] PKCE OAuth successful in ${exchangeDuration.toFixed(0)}ms`);

                await supabase.auth.setSession({
                  access_token: data.session.access_token,
                  refresh_token: data.session.refresh_token,
                });

                await handleSession(data.session);

                const cleanUrl = `${url.origin}${url.pathname}`;
                window.history.replaceState({}, document.title, cleanUrl);

                toast({
                  title: "¡Bienvenido!",
                  description: "Has iniciado sesión con Google correctamente."
                });

                return;
              }
            } catch (exchangeErr) {
              console.error('[SupabaseAuthContext] Exception during code exchange:', exchangeErr);

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