import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card, { CardContent } from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import useAuthStore from '../store/authStore';
import { AlertTriangle, Sparkles } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { login, exploreDemo, isLoading, error, isAuthenticated, sessionExpiredReason } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) {
      navigate('/');
    }
  };

  const handleExploreDemo = async () => {
    const success = await exploreDemo();
    if (success) {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="mb-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary shadow-soft-purple mx-auto flex items-center justify-center font-bold text-white tracking-wider text-2xl mb-4">
          OD
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Ocean Developers</h1>
        <p className="text-text-secondary mt-2">Internal Business Suite</p>
      </div>

      <Card className="w-full max-w-md">
        <CardContent className="p-8 space-y-6">
          {sessionExpiredReason && (
            <div className="bg-amber-500/10 text-amber-400 p-4 rounded-xl text-sm border border-amber-500/20 flex items-start gap-3">
              <AlertTriangle className="shrink-0 mt-0.5" size={18} />
              <span>{sessionExpiredReason}</span>
            </div>
          )}

          {error && (
            <div className="bg-danger/10 text-danger p-3 rounded-lg text-sm text-center border border-danger/20">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <Input 
                label="Email Address" 
                type="email"
                placeholder="admin@oceandevelopers.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input 
                label="Password" 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button 
              variant="primary" 
              className="w-full" 
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>

          <div className="relative flex items-center justify-center pt-2">
            <div className="border-t border-border w-full absolute"></div>
            <span className="bg-card px-3 text-xs text-text-secondary z-10 font-medium uppercase tracking-wider">or</span>
          </div>

          <button
            type="button"
            onClick={handleExploreDemo}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-secondary hover:bg-secondary/80 text-white font-medium py-3 px-4 rounded-xl border border-primary/40 hover:border-primary transition-all duration-200 shadow-sm hover:shadow-soft-purple group cursor-pointer"
          >
            <Sparkles size={18} className="text-primary group-hover:rotate-12 transition-transform" />
            <span>✨ Explore Demo</span>
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
