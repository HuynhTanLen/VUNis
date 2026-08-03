import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Loader2, Mail, Lock, User, Phone, Briefcase, Building, Layers } from 'lucide-react';

export default function Register({ onSwitchToLogin }) {
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', jobTitle: '',
    department: '', company: '', password: '', confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (formData.password.length < 6) { setError('Mật khẩu phải có ít nhất 6 ký tự.'); return; }
    if (formData.password !== formData.confirmPassword) { setError('Mật khẩu xác nhận không khớp!'); return; }
    setLoading(true);
    try {
      await register({
        name: formData.name.trim(), email: formData.email.trim(), password: formData.password,
        phone: formData.phone.trim() || undefined, jobTitle: formData.jobTitle.trim() || undefined,
        department: formData.department.trim() || undefined, company: formData.company.trim() || undefined
      });
      setSuccess('Đăng ký thành công! Đang chuyển hướng sang trang đăng nhập...');
      setTimeout(() => onSwitchToLogin(), 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-bg px-4 py-8 font-sans text-ink antialiased">
      <div className="w-full max-w-lg space-y-5">
        <div className="flex flex-col items-center space-y-2 text-center">
          <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-white font-extrabold text-base">KS</div>
          <h2 className="text-xl font-bold text-ink tracking-tight">Tạo tài khoản Skys Platform</h2>
          <p className="text-xs text-sub">Hoàn tất thông tin cá nhân và tổ chức để gia nhập hệ thống.</p>
        </div>

        <div className="card-clean p-6 md:p-8 space-y-5">
          {error && (<div className="bg-danger-soft text-danger border border-danger/20 p-3 rounded-lg text-xs font-medium">{error}</div>)}
          {success && (<div className="bg-success-soft text-success border border-success/20 p-3 rounded-lg text-xs font-medium">{success}</div>)}

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-sub uppercase tracking-wider">1. Thông tin cơ bản</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="label-field">Họ và tên <span className="text-danger">*</span></label>
                  <div className="relative">
                    <input type="text" name="name" required value={formData.name} onChange={handleChange} disabled={loading} className="input-field pl-9" placeholder="Huỳnh Tấn Lên" />
                    <User className="w-4 h-4 text-sub absolute left-3 top-2.5" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="label-field">Email liên hệ <span className="text-danger">*</span></label>
                  <div className="relative">
                    <input type="email" name="email" required value={formData.email} onChange={handleChange} disabled={loading} className="input-field pl-9" placeholder="ten@gmail.com" />
                    <Mail className="w-4 h-4 text-sub absolute left-3 top-2.5" />
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <label className="label-field">Số điện thoại</label>
                <div className="relative">
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} disabled={loading} className="input-field pl-9" placeholder="0901234567" />
                  <Phone className="w-4 h-4 text-sub absolute left-3 top-2.5" />
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-2 border-t border-border">
              <h3 className="text-xs font-bold text-sub uppercase tracking-wider">2. Thông tin công việc & Tổ chức</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="label-field">Chức danh / Vị trí</label>
                  <div className="relative">
                    <input type="text" name="jobTitle" value={formData.jobTitle} onChange={handleChange} disabled={loading} className="input-field pl-9" placeholder="Software Engineer" />
                    <Briefcase className="w-4 h-4 text-sub absolute left-3 top-2.5" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="label-field">Phòng ban / Bộ phận</label>
                  <div className="relative">
                    <input type="text" name="department" value={formData.department} onChange={handleChange} disabled={loading} className="input-field pl-9" placeholder="Engineering" />
                    <Layers className="w-4 h-4 text-sub absolute left-3 top-2.5" />
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <label className="label-field">Công ty / Tổ chức</label>
                <div className="relative">
                  <input type="text" name="company" value={formData.company} onChange={handleChange} disabled={loading} className="input-field pl-9" placeholder="KS Team Organization" />
                  <Building className="w-4 h-4 text-sub absolute left-3 top-2.5" />
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-2 border-t border-border">
              <h3 className="text-xs font-bold text-sub uppercase tracking-wider">3. Bảo mật tài khoản</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="label-field">Mật khẩu <span className="text-danger">*</span></label>
                  <div className="relative">
                    <input type="password" name="password" required value={formData.password} onChange={handleChange} disabled={loading} className="input-field pl-9" placeholder="••••••••" />
                    <Lock className="w-4 h-4 text-sub absolute left-3 top-2.5" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="label-field">Xác nhận mật khẩu <span className="text-danger">*</span></label>
                  <div className="relative">
                    <input type="password" name="confirmPassword" required value={formData.confirmPassword} onChange={handleChange} disabled={loading} className="input-field pl-9" placeholder="••••••••" />
                    <Lock className="w-4 h-4 text-sub absolute left-3 top-2.5" />
                  </div>
                </div>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 mt-4 disabled:opacity-50">
              {loading ? (<><Loader2 className="w-4 h-4 animate-spin" />Đang đăng ký...</>) : ('Đăng ký tài khoản')}
            </button>
          </form>
        </div>

        <p className="text-center text-sub text-xs">
          Đã có tài khoản?{' '}
          <button onClick={onSwitchToLogin} disabled={loading} className="text-accent hover:text-accent/80 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-accent/20 rounded">
            Đăng nhập ngay
          </button>
        </p>
      </div>
    </div>
  );
}
