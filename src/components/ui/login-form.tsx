import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface LoginFormProps {
  heading?: string;
  buttonText?: string;
  onLogin: (username: string, password: string) => Promise<{ success: boolean; message: string }>;
  onSuccess?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({
  heading = "Sign in to continue",
  buttonText = "Login",
  onLogin,
  onSuccess,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await onLogin(username, password);
      
      if (result.success) {
        onSuccess?.();
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        <div className="border border-border bg-card/80 backdrop-blur-xl rounded-2xl shadow-2xl px-8 py-12">
          {/* Logo */}
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="flex flex-col items-center gap-4 mb-8"
          >
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center glow-primary">
                <Settings className="w-8 h-8 text-primary-foreground" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-accent rounded-full animate-pulse" />
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold gradient-text">Digital Twin Lathe</h1>
              <p className="text-muted-foreground text-sm mt-1">Hardware Monitoring System</p>
            </div>
          </motion.div>

          {/* Heading */}
          <h2 className="text-xl font-semibold text-center text-foreground mb-6">
            {heading}
          </h2>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Username</label>
              <Input
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-12 bg-background border-border focus:border-primary transition-colors"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 bg-background border-border focus:border-primary transition-colors pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-destructive text-sm text-center bg-destructive/10 py-2 px-4 rounded-lg"
              >
                {error}
              </motion.div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 mt-2 bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity text-primary-foreground font-semibold"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Authenticating...
                </>
              ) : (
                buttonText
              )}
            </Button>
          </form>

          {/* Demo credentials hint */}
          <div className="mt-8 text-center">
            <p className="text-muted-foreground text-xs">
              Demo credentials: <span className="text-foreground font-mono">admin / admin</span>
            </p>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export { LoginForm };
