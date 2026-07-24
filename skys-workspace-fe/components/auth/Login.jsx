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
      setError(err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-slate-50 px-4 font-sans text-slate-800 antialiased">
      <div className="w-full max-w-[360px] space-y-5">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center space-y-2 text-center">
          <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white font-semibold text-base shadow-xs">
            S
          </div>
          <h2 className="text-lg font-semibold text-slate-800 mt-1">Đăng nhập Skys Platform</h2>
          <p className="text-xs text-slate-500">Chào mừng quay trở lại không gian làm việc của bạn.</p>
        </div>

        {/* Form Card */}
        <div className="card-clean p-6 space-y-4">
          {error && (
            <div className="bg-rose-50 text-rose-700 border border-rose-200 p-3 rounded-lg text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="label-clean">Email truy cập</label>
              <div className="relative">
                <input 
                  type="email" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="input-clean pl-9"
                  placeholder="ten@email.com" 
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="label-clean">Mật khẩu</label>
                <button
                  type="button"
                  onClick={onSwitchToForgotPassword}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  Quên mật khẩu?
                </button>
              </div>
              <div className="relative">
                <input 
                  type="password" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="input-clean pl-9"
                  placeholder="••••••••" 
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="btn-primary-clean w-full flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Đang đăng nhập...
                </>
              ) : (
                'Đăng nhập'
              )}
            </button>
          </form>
        </div>

        {/* Footer Info */}
        <p className="text-center text-slate-500 text-xs">
          Chưa có tài khoản?{' '}
          <button 
            onClick={onSwitchToRegister} 
            disabled={loading}
            className="text-blue-600 hover:text-blue-700 font-semibold"
          >
            Đăng ký ngay
          </button>
        </p>
      </div>
    </div>
  );
}
