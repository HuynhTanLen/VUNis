import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Loader2, Mail, Lock, User } from 'lucide-react';

export default function Register({ onSwitchToLogin }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    
    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp!');
      return;
    }
    
    setLoading(true);
    try {
      await register(name.trim(), email.trim(), password);
      setSuccess('Đăng ký thành công! Đang chuyển hướng...');
      setTimeout(() => onSwitchToLogin(), 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.');
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
          <h2 className="text-lg font-semibold text-slate-800 mt-1">Tạo tài khoản Skys</h2>
          <p className="text-xs text-slate-500">Đăng ký thành viên tổ chức Skys Platform.</p>
        </div>

        {/* Form Card */}
        <div className="card-clean p-6 space-y-4">
          {error && (
            <div className="bg-rose-50 text-rose-700 border border-rose-200 p-3 rounded-lg text-xs font-medium">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-emerald-50 text-emerald-700 border border-emerald-200 p-3 rounded-lg text-xs font-medium">
              {success}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-3.5">
            <div className="space-y-1">
              <label className="label-clean">Họ và tên</label>
              <div className="relative">
                <input 
                  type="text" 
                  required 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                  className="input-clean pl-9"
                  placeholder="Nguyễn Văn A" 
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>
            
            <div className="space-y-1">
              <label className="label-clean">Email liên hệ</label>
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
              <label className="label-clean">Mật khẩu</label>
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
            
            <div className="space-y-1">
              <label className="label-clean">Xác nhận mật khẩu</label>
              <div className="relative">
                <input 
                  type="password" 
                  required 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
                  Đang xử lý...
                </>
              ) : (
                'Đăng ký tài khoản'
              )}
            </button>
          </form>
        </div>

        {/* Footer Info */}
        <p className="text-center text-slate-500 text-xs">
          Đã có tài khoản?{' '}
          <button 
            onClick={onSwitchToLogin} 
            disabled={loading}
            className="text-blue-600 hover:text-blue-700 font-semibold"
          >
            Đăng nhập ngay
          </button>
        </p>
      </div>
    </div>
  );
}
