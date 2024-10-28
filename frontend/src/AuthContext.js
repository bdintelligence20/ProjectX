// AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import { supabase } from './supabaseClient'; // Import Supabase client

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null); // Track session

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
        setSession(session);  // Store session in state
        localStorage.setItem('user', JSON.stringify(session.user)); // Persist user in local storage
        localStorage.setItem('token', session.access_token);  // Persist token in local storage
      }

      // Listen for auth state changes
      const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
        if (session?.user) {
          setUser(session.user);
          setSession(session); // Update session when state changes
          localStorage.setItem('user', JSON.stringify(session.user)); 
          localStorage.setItem('token', session.access_token);
        } else {
          setUser(null);
          setSession(null);  // Clear session when user logs out
          localStorage.removeItem('user');
          localStorage.removeItem('token');
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
      email,
      password,
    });

    if (error) throw error;
    if (session?.user) {
      setUser(session.user);
      setSession(session);  // Set session on login
      localStorage.setItem('user', JSON.stringify(session.user));
      localStorage.setItem('token', session.access_token);  // Persist token
    }
  };

  // Register function using Supabase
  const register = async (email, password) => {
    const { data: { user }, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    setUser(user);
    localStorage.setItem('user', JSON.stringify(user)); 
  };

  // Logout function using Supabase
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);  // Clear session on logout
    localStorage.removeItem('user'); 
    localStorage.removeItem('token');  // Remove token on logout
  };

  return (
    <AuthContext.Provider value={{ user, session, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
