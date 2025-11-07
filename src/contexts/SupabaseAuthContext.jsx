import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
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
    const processAuth = async () => {
      try {
        if (typeof window !== 'undefined') {
          const url = new URL(window.location.href);
          const hasAuthParams = url.searchParams.get('code') || url.searchParams.get('access_token');

          if (hasAuthParams) {
            const { data, error } = await supabase.auth.getSessionFromUrl({ storeSession: true });

            if (error) {
              console.error('[SupabaseAuthContext] Error processing OAuth callback:', error);
            } else {
              await handleSession(data.session);
            }

            const cleanUrl = `${url.origin}${url.pathname}${url.hash || ''}`;
            window.history.replaceState({}, document.title, cleanUrl);
          }
        }

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
  }, [handleSession]);

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