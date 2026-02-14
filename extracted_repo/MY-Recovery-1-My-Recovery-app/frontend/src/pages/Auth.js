import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Heart, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authAPI } from '@/lib/api';
import { saveToken } from '@/lib/auth';
import { toast } from 'sonner';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirm_password: '',
    display_name: ''
  });
  const navigate = useNavigate();

  const passwordsMatch = formData.password && formData.confirm_password && formData.password === formData.confirm_password;
  const showPasswordValidation = !isLogin && formData.confirm_password.length > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isLogin && !passwordsMatch) {
      toast.error('Passwords do not match');
      return;
    }
    
    setLoading(true);

    try {
      const response = isLogin
        ? await authAPI.login({ email: formData.email, password: formData.password })
        : await authAPI.register(formData);

      saveToken(response.data.token);
      
      if (!isLogin || !response.data.user.onboarded) {
        navigate('/onboarding');
      } else {
        navigate('/home');
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F1115] flex items-center justify-center p-5 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-14 h-14 bg-white/[0.05] border border-white/[0.1] rounded-xl flex items-center justify-center mb-4">
            <Heart className="w-7 h-7 text-[#E57373]" fill="#E57373" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-1">
            MyRecovery
          </h1>
          <p className="text-sm text-white/40">
            Your recovery companion
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="display_name" className="text-sm font-medium text-white/70">
                  Display Name
                </Label>
                <p className="text-xs text-white/40 mb-2">What would you prefer we called you?</p>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-5 h-5 text-white/30" />
                  <Input
                    id="display_name"
                    data-testid="auth-display-name-input"
                    type="text"
                    placeholder="Your name"
                    className="pl-10 h-12 bg-white/[0.03] border-white/[0.1] focus:border-white/[0.2] text-white placeholder:text-white/30 rounded-xl"
                    value={formData.display_name}
                    onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-white/70">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-white/30" />
                <Input
                  id="email"
                  data-testid="auth-email-input"
                  type="email"
                  placeholder="your@email.com"
                  className="pl-10 h-12 bg-white/[0.03] border-white/[0.1] focus:border-white/[0.2] text-white placeholder:text-white/30 rounded-xl"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-white/70">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-white/30" />
                <Input
                  id="password"
                  data-testid="auth-password-input"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10 h-12 bg-white/[0.03] border-white/[0.1] focus:border-white/[0.2] text-white placeholder:text-white/30 rounded-xl"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="confirm_password" className="text-sm font-medium text-white/70">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-white/30" />
                  <Input
                    id="confirm_password"
                    data-testid="auth-confirm-password-input"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10 pr-10 h-12 bg-white/[0.03] border-white/[0.1] focus:border-white/[0.2] text-white placeholder:text-white/30 rounded-xl"
                    value={formData.confirm_password}
                    onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                    required
                  />
                  {showPasswordValidation && (
                    <div className="absolute right-3 top-3">
                      {passwordsMatch ? (
                        <Check className="w-5 h-5 text-[#4A7C59]" data-testid="password-match-check" />
                      ) : (
                        <X className="w-5 h-5 text-[#C4785C]" data-testid="password-mismatch-x" />
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            <Button
              data-testid="auth-submit-button"
              type="submit"
              disabled={loading || (!isLogin && !passwordsMatch)}
              className="w-full bg-white text-[#0F1115] hover:bg-white/90 h-12 rounded-xl text-base font-semibold transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              data-testid="auth-toggle-button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-white/40 hover:text-white/60 transition-colors"
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
