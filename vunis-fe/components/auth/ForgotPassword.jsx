import { useState } from 'react';
import { forgotPassword, resetPassword } from '../../services/authService';
import { Loader2, ArrowRight, CheckCircle2, AlertCircle, ChevronLeft } from 'lucide-react';
import AuthLayout from './AuthLayout';

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
      setSuccessMsg(`OTP sent! Please check your email.${devTokenNotice}`);
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
    <AuthLayout
      eyebrow="Reset password"
      title="Reset password"
      subtitle="Set a new password to access your workspace."
      footer={step !== 3 && (
        <button onClick={onSwitchToLogin} disabled={loading} className="inline-flex items-center gap-1 text-sub hover:text-ink font-semibold transition-colors focus:outline-none">
          <ChevronLeft className="w-3.5 h-3.5" />Back to sign in
        </button>
      )}
    >
      {error && (
        <div className="text-danger border-l-2 border-danger pl-3 py-1 text-xs font-medium flex items-start gap-2 mb-5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" /><span>{error}</span>
        </div>
      )}
      {successMsg && step === 2 && (
        <div className="text-success border-l-2 border-success pl-3 py-1 text-xs font-medium mb-5">{successMsg}</div>
      )}

      {step === 1 && (
        <form onSubmit={handleSendOtp} className="space-y-5">
          <div>
            <label className="label-mono"><span className="text-accent">01</span> Account email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} className="input-line" placeholder="you@email.com" />
          </div>
          <button type="submit" disabled={loading} className="btn-editorial mt-3">
            {loading ? (<><Loader2 className="w-3.5 h-3.5 animate-spin" />Sending</>) : (<>Send OTP code<ArrowRight className="w-3.5 h-3.5" /></>)}
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleResetPassword} className="space-y-5">
          <div>
            <label className="label-mono"><span className="text-accent">02</span> OTP code (6 digits)</label>
            <input type="text" required maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value)} disabled={loading} className="input-line text-center text-sm font-bold tracking-[0.5em] font-mono" placeholder="------" />
          </div>
          <div>
            <label className="label-mono"><span className="text-accent">03</span> New password</label>
            <input type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} disabled={loading} className="input-line" placeholder="Min 6 characters" />
          </div>
          <div>
            <label className="label-mono"><span className="text-accent">04</span> Confirm password</label>
            <input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} disabled={loading} className="input-line" placeholder="Re-enter new password" />
          </div>
          <button type="submit" disabled={loading} className="btn-editorial mt-3">
            {loading ? (<><Loader2 className="w-3.5 h-3.5 animate-spin" />Resetting</>) : (<>Reset password<ArrowRight className="w-3.5 h-3.5" /></>)}
          </button>
        </form>
      )}

      {step === 3 && (
        <div className="space-y-4 py-2">
          <div className="w-9 h-9 rounded-full bg-success-soft border border-success/20 flex items-center justify-center text-success">
            <CheckCircle2 className="w-4.5 h-4.5" />
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold text-ink text-sm">Password reset successful!</h3>
            <p className="text-xs text-sub leading-relaxed">Your password has been changed. You can now sign in with your new password.</p>
          </div>
          <button onClick={onSwitchToLogin} className="btn-editorial">Back to sign in<ArrowRight className="w-3.5 h-3.5" /></button>
        </div>
      )}
    </AuthLayout>
  );
}
