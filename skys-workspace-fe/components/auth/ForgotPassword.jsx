import { useState } from 'react';
import { forgotPassword, resetPassword } from '../../services/authService';
import { Loader2, Mail, Lock, CheckCircle2, AlertCircle, ChevronLeft } from 'lucide-react';

export default function ForgotPassword({ onSwitchToLogin }) {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSendOtp = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const data = await forgotPassword(email.trim());
      const devTokenNotice = data.resetToken ? ` (Dev OTP token: ${data.resetToken})` : '';
      setSuccessMsg(`OTP sent! Please check your email or server console.${devTokenNotice}`);
      setStep(2);
    } catch (err) { setError(err.response?.data?.message || 'Account not found with this email.'); }
    finally { setLoading(false); }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault(); setError('');
    if (newPassword.length < 6) { setError('New password must be at least 6 characters.'); return; }
    if (newPassword !== confirmPassword) { setError('Passwords do not match.'); return; }
    setLoading(true);
    try { await resetPassword(email.trim(), otp.trim(), newPassword); setStep(3); }
    catch (err) { setError(err.response?.data?.message || 'Invalid or expired OTP code.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-bg px-4 font-sans text-ink antialiased">
      <div className="w-full max-w-[360px] space-y-5">
        <div className="flex flex-col items-center space-y-2 text-center">
          <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center text-white font-semibold text-base">VU</div>
          <h2 className="text-lg font-semibold text-ink mt-1">Reset Password</h2>
          <p className="text-xs text-sub">Set a new password to access your workspace.</p>
        </div>

        <div className="card-clean p-6 space-y-4">
          {error && (
            <div className="bg-danger-soft text-danger border border-danger/20 p-3 rounded-lg text-xs font-medium flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /><span>{error}</span>
            </div>
          )}
          {successMsg && step === 2 && (
            <div className="bg-success-soft text-success border border-success/20 p-3 rounded-lg text-xs font-medium">{successMsg}</div>
          )}

          {step === 1 && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="space-y-1">
                <label className="label-field">Account Email</label>
                <div className="relative">
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} className="input-field pl-9" placeholder="ten@email.com" />
                  <Mail className="w-4 h-4 text-sub absolute left-3 top-2.5" />
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-1.5 disabled:opacity-50">
                {loading ? (<><Loader2 className="w-4 h-4 animate-spin" />Sending...</>) : ('Send OTP Code')}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-1">
                <label className="label-field text-center block">OTP Code (6 digits)</label>
                <input type="text" required maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value)} disabled={loading} className="input-field text-center text-sm font-bold tracking-widest font-mono" placeholder="------" />
              </div>
              <div className="space-y-1">
                <label className="label-field">New Password</label>
                <div className="relative">
                  <input type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} disabled={loading} className="input-field pl-9" placeholder="Min 6 characters" />
                  <Lock className="w-4 h-4 text-sub absolute left-3 top-2.5" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="label-field">Confirm Password</label>
                <div className="relative">
                  <input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} disabled={loading} className="input-field pl-9" placeholder="Re-enter new password" />
                  <Lock className="w-4 h-4 text-sub absolute left-3 top-2.5" />
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-1.5 disabled:opacity-50">
                {loading ? (<><Loader2 className="w-4 h-4 animate-spin" />Resetting...</>) : ('Reset Password')}
              </button>
            </form>
          )}

          {step === 3 && (
            <div className="text-center space-y-4 py-2">
              <div className="w-10 h-10 rounded-full bg-success-soft border border-success/20 flex items-center justify-center mx-auto text-success">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-ink text-sm">Password Reset Successful!</h3>
                <p className="text-xs text-sub">Your password has been changed. You can now log in with your new password.</p>
              </div>
              <button onClick={onSwitchToLogin} className="btn-primary w-full">Back to Login</button>
            </div>
          )}
        </div>

        {step !== 3 && (
          <div className="text-center">
            <button onClick={onSwitchToLogin} disabled={loading} className="inline-flex items-center gap-1 text-sub hover:text-ink text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-accent/20 rounded">
              <ChevronLeft className="w-4 h-4" />Back to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
