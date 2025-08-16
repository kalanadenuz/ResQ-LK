import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Container,
  Paper,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSnackbar } from 'notistack';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  
  const { adminLogin, isLoading, error, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const result = await adminLogin(formData.email, formData.password);
    
    if (result.success) {
      enqueueSnackbar('Login successful!', { variant: 'success' });
      navigate('/dashboard');
    } else {
      enqueueSnackbar(result.error || 'Login failed', { variant: 'error' });
    }
  };

  // Demo credentials
  const fillDemoCredentials = () => {
    setFormData({
      email: 'admin@resq-lk.lk',
      password: 'admin123',
    });
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #E53E3E 0%, #C53030 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 2,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={8}
          sx={{
            borderRadius: 3,
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <Box
            sx={{
              background: 'linear-gradient(135deg, #E53E3E 0%, #C53030 100%)',
              color: 'white',
              padding: 4,
              textAlign: 'center',
            }}
          >
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                backgroundColor: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              }}
            >
              <Typography
                variant="h3"
                sx={{
                  color: '#E53E3E',
                  fontWeight: 'bold',
                }}
              >
                🚨
              </Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
              ResQ-LK
            </Typography>
            <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
              Emergency Response Platform - Admin Dashboard
            </Typography>
          </Box>

          {/* Login Form */}
          <CardContent sx={{ padding: 4 }}>
            <Typography variant="h5" sx={{ mb: 3, textAlign: 'center', fontWeight: 'bold' }}>
              Admin Login
            </Typography>

            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={!!errors.email}
                helperText={errors.email}
                margin="normal"
                variant="outlined"
                disabled={isLoading}
              />

              <TextField
                fullWidth
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                error={!!errors.password}
                helperText={errors.password}
                margin="normal"
                variant="outlined"
                disabled={isLoading}
              />

              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
              )}

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={isLoading}
                sx={{
                  mt: 3,
                  mb: 2,
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                }}
              >
                {isLoading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Login'
                )}
              </Button>
            </form>

            {/* Demo Credentials */}
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Demo Credentials:
              </Typography>
              <Button
                variant="outlined"
                size="small"
                onClick={fillDemoCredentials}
                disabled={isLoading}
              >
                Fill Demo Credentials
              </Button>
            </Box>

            {/* Footer */}
            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Emergency Response Platform for Sri Lanka
              </Typography>
              <Typography variant="caption" color="text.secondary">
                © 2025 ResQ-LK. All rights reserved.
              </Typography>
            </Box>
          </CardContent>
        </Paper>
      </Container>
    </Box>
  );
};

export default LoginPage;
