// App.js
import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import theme from './styles/theme'; // Import your custom theme
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/Dashboard'; // Import your Dashboard component
import AuthContext, { AuthProvider } from './AuthContext'; // Import AuthContext and Provider
import { CircularProgress } from '@mui/material';

// ProtectedRoute component for route guarding
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <CircularProgress />; // Show loading indicator while checking auth state
  }

  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <Router>
          <Routes>
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          </Routes>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
