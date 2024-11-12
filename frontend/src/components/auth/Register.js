import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../../AuthContext';
import AuthLayout from '../layout/AuthLayout';
import {
  TextField,
  Button,
  Box,
  Typography,
  InputAdornment,
  IconButton,
  Alert,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import GoogleIcon from '@mui/icons-material/Google';

export default function Register() {
  const { register } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    try {
      await register(email, password);
      navigate('/dashboard');
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <AuthLayout
      quote={{
        title: "Start Your Journey",
        subtitle: "Create an account to get started with all the features and tools you need."
      }}
    >
      <Box sx={{ maxWidth: '400px', mx: 'auto' }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" sx={{ mb: 1, fontWeight: 700 }}>
            Create an Account
          </Typography>
          <Typography color="text.secondary">
            Fill in your details to create your account
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleRegister}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            required
          />

          <TextField
            fullWidth
            label="Password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            required
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <TextField
            fullWidth
            label="Confirm Password"
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            margin="normal"
            required
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    edge="end"
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            sx={{ mt: 3, mb: 2 }}
          >
            Create Account
          </Button>

          <Button
            fullWidth
            variant="outlined"
            size="large"
            startIcon={<GoogleIcon />}
            sx={{ mb: 3 }}
          >
            Sign up with Google
          </Button>

          <Typography align="center" color="text.secondary">
            Already have an account?{' '}
            <Link to="/login" style={{ textDecoration: 'none' }}>
              <Typography component="span" color="primary" fontWeight={600}>
                Sign In
              </Typography>
            </Link>
          </Typography>
        </form>
      </Box>
    </AuthLayout>
  );
}