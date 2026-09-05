import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Loader2, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import AuthLayout from './AuthLayout';

const FIELDS = [
  { name: 'name', label: 'Full name', type: 'text', required: true, placeholder: 'Jane Doe' },
  { name: 'email', label: 'Email', type: 'email', required: true, placeholder: 'you@email.com' },
  { name: 'phone', label: 'Phone number', type: 'tel', required: false, placeholder: '0901234567' },
  { name: 'jobTitle', label: 'Job title', type: 'text', required: false, placeholder: 'Software Engineer' },
  { name: 'department', label: 'Department', type: 'text', required: false, placeholder: 'Engineering' },
  { name: 'company', label: 'Company / Organization', type: 'text', required: false, placeholder: 'Organization name' },
  { name: 'password', label: 'Password', type: 'password', required: true, placeholder: '••••••••' },
  { name: 'confirmPassword', label: 'Confirm password', type: 'password', required: true, placeholder: '••••••••' },
];

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
    if (formData.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (formData.password !== formData.confirmPassword) { setError('Passwords do not match!'); return; }
    setLoading(true);
    try {
      await register({
        name: formData.name.trim(), email: formData.email.trim(), password: formData.password,
        phone: formData.phone.trim() || undefined, jobTitle: formData.jobTitle.trim() || undefined,
        department: formData.department.trim() || undefined, company: formData.company.trim() || undefined
      });
      setSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => onSwitchToLogin(), 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please check your information.');
    } finally { setLoading(false); }
  };

  return (
    <AuthLayout
      wide
      eyebrow="Create account"
      title="Create account"
      subtitle="Complete your personal and organizational details to join the platform."
      footer={
        <>
          Already have an account?{' '}
          <button onClick={onSwitchToLogin} disabled={loading} className="text-ink font-semibold underline underline-offset-2 hover:text-accent transition-colors focus:outline-none">
            Sign in now
          </button>
        </>
      }
    >
      {error && (
        <div className="text-danger border-l-2 border-danger pl-3 py-1 text-xs font-medium flex items-start gap-2 mb-5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" /><span>{error}</span>
        </div>
      )}
      {success && (
        <div className="text-success border-l-2 border-success pl-3 py-1 text-xs font-medium flex items-start gap-2 mb-5">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" /><span>{success}</span>
        </div>
      )}

      <form onSubmit={handleRegister} className="space-y-5">
        {FIELDS.map((f, i) => (
          <div key={f.name}>
            <label className="label-mono">
              <span className="text-accent">{String(i + 1).padStart(2, '0')}</span> {f.label} {f.required && <span className="text-danger normal-case">*</span>}
            </label>
            <input
              type={f.type} name={f.name} required={f.required}
              value={formData[f.name]} onChange={handleChange} disabled={loading}
              className="input-line" placeholder={f.placeholder}
            />
          </div>
        ))}

        <button type="submit" disabled={loading} className="btn-editorial mt-3">
          {loading ? (<><Loader2 className="w-3.5 h-3.5 animate-spin" />Creating account</>) : (<>Create account<ArrowRight className="w-3.5 h-3.5" /></>)}
        </button>
      </form>
    </AuthLayout>
  );
}
