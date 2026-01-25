import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginForm } from '@/components/ui/login-form';
import { useAuth } from '@/contexts/AuthContext';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

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
