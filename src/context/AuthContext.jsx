import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '@/lib/supabaseClient';

export const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (supabase) {
      const getSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        console.log('🔐 AuthContext: Session loaded', session ? 'Authenticated' : 'Not authenticated');
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      };

      getSession();

      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, session) => {
          console.log('🔐 AuthContext: Auth state changed', event, session ? 'Authenticated' : 'Not authenticated');
          setSession(session);
          setUser(session?.user ?? null);
        }
      );

      return () => {
        subscription?.unsubscribe();
      };
    } else {
      setLoading(false);
    }
  }, []);

  const value = {
    session,
    user,
    signOut: () => supabase?.auth.signOut(),
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};