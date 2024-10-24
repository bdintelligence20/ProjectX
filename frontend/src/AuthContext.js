// AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import { supabase } from './supabaseClient'; // Import Supabase client

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for an existing session on component mount
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
        localStorage.setItem('user', JSON.stringify(session.user)); // Persist user in local storage
      }

      // Listen for auth state changes
      const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
        if (session?.user) {
          setUser(session.user);
          localStorage.setItem('user', JSON.stringify(session.user)); // Update user in local storage
        } else {
          setUser(null);
          localStorage.removeItem('user');
        }
      });

      setLoading(false);
      return () => {
        authListener.subscription?.unsubscribe();
      };
    };

    checkSession();
  }, []);

  // Login function using Supabase
  const login = async (email, password) => {
    const { data: { session }, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) throw error;
    if (session?.user) {
      setUser(session.user);
      localStorage.setItem('user', JSON.stringify(session.user)); // Persist user in local storage
    }
  };

  // Register function using Supabase
  const register = async (email, password) => {
    const { data: { user }, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    setUser(user);
    localStorage.setItem('user', JSON.stringify(user)); // Persist user in local storage
  };

  // Logout function using Supabase
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    localStorage.removeItem('user'); // Clear local storage on logout
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
