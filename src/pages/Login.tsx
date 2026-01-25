import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginForm } from '@/components/ui/login-form';
import { useAuth } from '@/contexts/AuthContext';

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate('/dashboard');
  };

  return (
    <LoginForm 
      onLogin={login}
      onSuccess={handleSuccess}
    />
  );
};

export default Login;
