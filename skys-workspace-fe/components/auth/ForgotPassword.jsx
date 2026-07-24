import { useState } from 'react';
import { forgotPassword, resetPassword } from '../../services/authService';
import { Loader2, Mail, Lock, CheckCircle2, AlertCircle, ChevronLeft } from 'lucide-react';

export default function ForgotPassword({ onSwitchToLogin }) {
  const [step, setStep] = useState(1); // 1: Send OTP, 2: Reset Password, 3: Success
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await forgotPassword(email.trim());
      const devTokenNotice = data.resetToken ? ` (Mã OTP test nhanh: ${data.resetToken})` : '';
      setSuccessMsg(`Mã OTP đã được gửi! Vui lòng kiểm tra email của bạn hoặc console server.${devTokenNotice}`);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Không tìm thấy tài khoản với email này.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    
    if (newPassword.length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Xác nhận mật khẩu mới không trùng khớp.');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email.trim(), otp.trim(), newPassword);
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || 'Mã OTP không hợp lệ hoặc đã hết hạn.');
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
          <h2 className="text-lg font-semibold text-slate-800 mt-1">Khôi phục mật khẩu</h2>
          <p className="text-xs text-slate-500">Đặt lại mật khẩu của bạn để truy cập không gian.</p>
        </div>

        {/* Form Card */}
        <div className="card-clean p-6 space-y-4">
          
          {error && (
            <div className="bg-rose-50 text-rose-700 border border-rose-200 p-3 rounded-lg text-xs font-medium flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && step === 2 && (
            <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 p-3 rounded-lg text-xs font-medium">
              {successMsg}
            </div>
          )}

          {/* STEP 1: SEND OTP FORM */}
          {step === 1 && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="space-y-1">
                <label className="label-clean">Email tài khoản</label>
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

              <button 
                type="submit"
                disabled={loading}
                className="btn-primary-clean w-full flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Đang gửi mã...
                  </>
                ) : (
                  'Gửi mã xác nhận OTP'
                )}
              </button>
            </form>
          )}

          {/* STEP 2: RESET PASSWORD FORM */}
          {step === 2 && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-1">
                <label className="label-clean text-center block">Mã xác nhận OTP (6 số)</label>
                <input 
                  type="text" 
                  required 
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  disabled={loading}
                  className="input-clean text-center text-sm font-bold tracking-widest"
                  placeholder="------" 
                />
              </div>

              <div className="space-y-1">
                <label className="label-clean">Mật khẩu mới</label>
                <div className="relative">
                  <input 
                    type="password" 
                    required 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={loading}
                    className="input-clean pl-9"
                    placeholder="Tối thiểu 6 ký tự" 
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
                    placeholder="Nhập lại mật khẩu mới" 
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
                    Đang thiết lập lại...
                  </>
                ) : (
                  'Đặt lại mật khẩu'
                )}
              </button>
            </form>
          )}

          {/* STEP 3: SUCCESS */}
          {step === 3 && (
            <div className="text-center space-y-4 py-2">
              <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-emerald-600">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-slate-800 text-sm">Đặt lại mật khẩu thành công!</h3>
                <p className="text-xs text-slate-500">
                  Mật khẩu của bạn đã được thay đổi. Bây giờ bạn có thể đăng nhập bằng mật khẩu mới.
                </p>
              </div>
              <button
                onClick={onSwitchToLogin}
                className="btn-primary-clean w-full"
              >
                Quay lại đăng nhập
              </button>
            </div>
          )}
        </div>

        {/* Back Link */}
        {step !== 3 && (
          <div className="text-center">
            <button 
              onClick={onSwitchToLogin}
              disabled={loading}
              className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-700 text-xs font-semibold"
            >
              <ChevronLeft className="w-4 h-4" />
              Quay lại đăng nhập
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
