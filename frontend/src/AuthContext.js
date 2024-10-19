// src/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';

// Create AuthContext
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authToken, setAuthToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for authentication token in local storage
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setAuthToken(token);
    }
    setLoading(false);
  }, []);

  // Function to log in
  const login = (token) => {
    localStorage.setItem('token', token);
    setAuthToken(token);
  };

  // Function to log out
  const logout = () => {
    localStorage.removeItem('token');
    setAuthToken(null);
  };

  if (loading) {
    return null; // Prevent the rendering of children until the loading is complete
  }

  return (
    <AuthContext.Provider value={{ authToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
