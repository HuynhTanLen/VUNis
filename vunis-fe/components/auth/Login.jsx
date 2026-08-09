import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Loader2, Mail, Lock } from 'lucide-react';

export default function Login({ onSwitchToRegister, onSwitchToForgotPassword }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-bg px-4 font-sans text-ink antialiased">
      <div className="w-full max-w-[360px] space-y-5">
        
        <div className="flex flex-col items-center space-y-2 text-center">
          <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center text-white font-semibold text-base">
            VU
          </div>
          <h2 className="text-lg font-semibold text-ink mt-1">Sign in to VUNIS</h2>
          <p className="text-xs text-sub">Welcome back to your workspace.</p>
        </div>

        <div className="card-clean p-6 space-y-4">
          {error && (
            <div className="bg-danger-soft text-danger border border-danger/20 p-3 rounded-lg text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="label-field">Email address</label>
              <div className="relative">
                <input 
                  type="email" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="input-field pl-9"
                  placeholder="ten@email.com" 
                />
                <Mail className="w-4 h-4 text-sub absolute left-3 top-2.5" />
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="label-field">Password</label>
                <button
                  type="button"
                  onClick={onSwitchToForgotPassword}
                  className="text-xs text-accent hover:text-accent/80 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-accent/20 rounded"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input 
                  type="password" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="input-field pl-9"
                  placeholder="••••••••" 
                />
                <Lock className="w-4 h-4 text-sub absolute left-3 top-2.5" />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-sub text-xs">
          Don't have an account?{' '}
          <button 
            onClick={onSwitchToRegister} 
            disabled={loading}
            className="text-accent hover:text-accent/80 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-accent/20 rounded"
          >
            Sign up now
          </button>
        </p>
      </div>
    </div>
  );
}
