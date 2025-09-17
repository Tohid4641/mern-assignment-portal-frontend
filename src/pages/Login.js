import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { login as apiLogin } from '../services/authService';
import { 
  Container, 
  TextField, 
  Button, 
  Typography, 
  Box, 
  Paper,
  InputAdornment,
  IconButton,
  Link
} from '@mui/material';
import { Person, Lock, Visibility, VisibilityOff } from '@mui/icons-material';

export default function Login(){
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const auth = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    
    // Client-side validation
    if (!email.trim()) {
      setErr('Email is required');
      return;
    }
    if (!password.trim()) {
      setErr('Password is required');
      return;
    }
    
    try {
      setLoading(true);
      const data = await auth.login(email, password);
      if (data.role === 'teacher') navigate('/teacher'); 
      else navigate('/student');
    } catch (err) {
      setErr(err.response?.data?.message || 'Login failed. Please try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ 
      minHeight: '86vh', 
      backgroundColor: '#f0f0f0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: { xs: 2, sm: 3 },
    }}>
      <Paper 
        elevation={0} 
        sx={{ 
          padding: { xs: '40px 32px', sm: '50px 40px' },
          width: '100%',
          maxWidth: 400,
          maxHeight: '90vh',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          overflow: 'auto'
        }}
      >
        <Box component="form" onSubmit={submit}>
          <TextField
            fullWidth
            placeholder="Username"
            value={email}
            onChange={e => setEmail(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Person sx={{ color: '#999', fontSize: '20px' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              mb: '20px',
              '& .MuiOutlinedInput-root': {
                backgroundColor: '#f8f8f8',
                borderRadius: '4px',
                '& fieldset': {
                  borderColor: '#d0d0d0',
                  borderWidth: '1px',
                },
                '&:hover fieldset': {
                  borderColor: '#b0b0b0',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#666',
                  borderWidth: '1px',
                },
              },
              '& .MuiInputBase-input': {
                padding: '14px 12px',
                fontSize: '14px',
                color: '#333',
                '&::placeholder': {
                  color: '#999',
                  opacity: 1,
                }
              }
            }}
          />
          
          <TextField
            fullWidth
            placeholder="Password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock sx={{ color: '#999', fontSize: '20px' }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    sx={{ color: '#999', padding: '4px' }}
                  >
                    {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              mb: '16px',
              '& .MuiOutlinedInput-root': {
                backgroundColor: '#f8f8f8',
                borderRadius: '4px',
                '& fieldset': {
                  borderColor: '#d0d0d0',
                  borderWidth: '1px',
                },
                '&:hover fieldset': {
                  borderColor: '#b0b0b0',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#666',
                  borderWidth: '1px',
                },
              },
              '& .MuiInputBase-input': {
                padding: '14px 12px',
                fontSize: '14px',
                color: '#333',
                '&::placeholder': {
                  color: '#999',
                  opacity: 1,
                }
              }
            }}
          />
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: '20px' }}>
            <Link
              href="#"
              sx={{
                color: '#64b5f6',
                textDecoration: 'none',
                fontSize: '13px',
                '&:hover': {
                  textDecoration: 'underline',
                }
              }}
            >
              Forgot Password?
            </Link>
          </Box>
          
          {err && (
            <Box sx={{ mb: 2 }}>
              <Typography 
                color="error" 
                sx={{ 
                  textAlign: 'center',
                  fontSize: '14px',
                  backgroundColor: '#ffebee',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  border: '1px solid #ffcdd2'
                }}
              >
                {err}
              </Typography>
            </Box>
          )}
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{
              backgroundColor: '#424242',
              color: 'white',
              padding: '14px',
              borderRadius: '4px',
              textTransform: 'none',
              fontSize: '15px',
              fontWeight: 400,
              '&:hover': {
                backgroundColor: '#333',
              },
              '&:disabled': {
                backgroundColor: '#666',
              },
              mb: '20px',
              boxShadow: 'none',
              '&:hover': {
                backgroundColor: loading ? '#666' : '#333',
                boxShadow: 'none',
              }
            }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </Button>
          
          <Box sx={{ textAlign: 'center' }}>
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#888',
                fontSize: '12px',
                lineHeight: 1.4
              }}
            >
              Demo accounts: teacher@demo.com / teacher123 •<br />
              student@demo.com / student123
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
