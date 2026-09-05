import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Loader2, ArrowRight, AlertCircle } from 'lucide-react';
import AuthLayout from './AuthLayout';

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
    <AuthLayout
      eyebrow="Sign in"
      title="Sign in"
      subtitle="Welcome back to your workspace."
      footer={
        <>
          Don't have an account?{' '}
          <button onClick={onSwitchToRegister} disabled={loading} className="text-ink font-semibold underline underline-offset-2 hover:text-accent transition-colors focus:outline-none">
            Sign up now
          </button>
        </>
      }
    >
      {error && (
        <div className="text-danger border-l-2 border-danger pl-3 py-1 text-xs font-medium flex items-start gap-2 mb-5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" /><span>{error}</span>
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-5">
        <div>
          <label className="label-mono"><span className="text-accent">01</span> Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            className="input-line"
            placeholder="you@email.com"
          />
        </div>

        <div>
          <div className="flex justify-between items-baseline">
            <label className="label-mono"><span className="text-accent">02</span> Password</label>
            <button type="button" onClick={onSwitchToForgotPassword} className="text-[11px] text-sub hover:text-accent font-medium transition-colors focus:outline-none mb-1.5">
              Forgot password?
            </button>
          </div>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            className="input-line"
            placeholder="••••••••"
          />
        </div>

        <button type="submit" disabled={loading} className="btn-editorial mt-3">
          {loading ? (<><Loader2 className="w-3.5 h-3.5 animate-spin" />Signing in</>) : (<>Sign in<ArrowRight className="w-3.5 h-3.5" /></>)}
        </button>
      </form>
    </AuthLayout>
  );
}
