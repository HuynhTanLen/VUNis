'use client';

import { useState } from 'react';
import { useAuth } from "../../hooks/useAuth";
import { updateProfile } from '../../services/authService';
import Link from 'next/link';
import { User, LogOut, ChevronLeft, Pencil, X, Loader2 } from 'lucide-react';
import Toast from '../../components/ui/Toast';

const ROLE_LABELS = {
    SUPER_ADMIN: 'Super Admin',
    USER_ADMIN: 'User Admin',
    GROUPS_ADMIN: 'Groups Admin',
    SERVICE_ADMIN: 'Service Admin',
    HELP_DESK_ADMIN: 'Help Desk Admin',
    USER: 'Member',
};
const ADMIN_ROLES = ['SUPER_ADMIN', 'USER_ADMIN', 'GROUPS_ADMIN', 'SERVICE_ADMIN', 'HELP_DESK_ADMIN'];

const FIELDS = [
    { key: 'email', label: 'Email', editable: false },
    { key: 'phone', label: 'Phone number', editable: true },
    { key: 'jobTitle', label: 'Job title', editable: true },
    { key: 'department', label: 'Department', editable: true },
    { key: 'company', label: 'Company / Organization', editable: true },
];

const EDITABLE_KEYS = FIELDS.filter(f => f.editable).map(f => f.key);

export default function ProfilePage() {
    const { user, refreshUser, logout } = useAuth();
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState(null);
    const [toast, setToast] = useState(null);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const startEditing = () => {
        setForm({
            name: user.name || '',
            avatar: user.avatar || '',
            phone: user.phone || '',
            jobTitle: user.jobTitle || '',
            department: user.department || '',
            company: user.company || '',
        });
        setEditing(true);
    };

    const cancelEditing = () => {
        setEditing(false);
        setForm(null);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await updateProfile(user.id, form);
            await refreshUser();
            showToast('Profile updated.');
            setEditing(false);
            setForm(null);
        } catch (err) {
            showToast(err?.response?.data?.message || 'Failed to update profile.', 'error');
        } finally {
            setSaving(false);
        }
    };

    if (!user) {
        return (
            <div className="min-h-[100dvh] flex items-center justify-center bg-bg font-sans antialiased text-ink px-4">
                <div className="text-center space-y-4">
                    <div className="w-11 h-11 bg-accent-soft border border-accent/20 rounded-full flex items-center justify-center mx-auto">
                        <User className="w-5 h-5 text-accent" />
                    </div>
                    <p className="text-ink text-xs font-semibold uppercase tracking-wider">You are not logged in</p>
                    <Link href="/" className="btn-editorial max-w-xs mx-auto">Back to home</Link>
                </div>
            </div>
        );
    }

    const initial = user.name ? user.name.charAt(0).toUpperCase() : 'U';
    const isAdmin = ADMIN_ROLES.includes(user.role);
    const roleLabel = ROLE_LABELS[user.role] || user.role || 'Member';

    return (
        <div className="min-h-[100dvh] bg-bg text-ink font-sans antialiased">
            <div className="max-w-[1360px] mx-auto px-6 md:px-12 lg:px-16">

                <header className="flex items-center justify-between pt-8 md:pt-10">
                    <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-sub hover:text-ink transition-colors">
                        <ChevronLeft className="w-4 h-4" /> Workspace
                    </Link>
                    <span className="hidden sm:block text-[10px] font-mono text-sub uppercase tracking-[0.2em]">Profile</span>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-12 gap-y-12 mt-12 md:mt-16 pb-16">

                    {/* identity block — 7/12, left aligned, editorial scale */}
                    <div className="lg:col-span-7 xl:col-span-8">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono font-semibold text-accent uppercase tracking-[0.2em]">Profile</span>
                            {!editing ? (
                                <button onClick={startEditing} className="inline-flex items-center gap-1.5 text-[10px] font-mono font-semibold uppercase tracking-wider text-sub hover:text-accent transition-colors">
                                    <Pencil className="w-3 h-3" /> Edit profile
                                </button>
                            ) : (
                                <button onClick={cancelEditing} className="inline-flex items-center gap-1.5 text-[10px] font-mono font-semibold uppercase tracking-wider text-sub hover:text-danger transition-colors">
                                    <X className="w-3 h-3" /> Cancel
                                </button>
                            )}
                        </div>

                        <div className="flex items-center gap-5 mt-3">
                            <div className="w-16 h-16 rounded-2xl bg-accent text-white flex items-center justify-center text-2xl font-bold shrink-0 overflow-hidden">
                                {(editing ? form.avatar : user.avatar) ? (
                                    <img src={editing ? form.avatar : user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                ) : initial}
                            </div>
                            <div className="min-w-0 flex-1">
                                {!editing ? (
                                    <h1 className="text-[2rem] md:text-[2.4rem] leading-none font-bold text-ink tracking-tight">{user.name}</h1>
                                ) : (
                                    <input
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        placeholder="Full name"
                                        className="text-[1.6rem] font-bold text-ink tracking-tight input-line !py-1 max-w-sm"
                                    />
                                )}
                                <div className="mt-3">
                                    <span className={`inline-flex items-center gap-1.5 text-[10px] font-mono font-semibold uppercase tracking-wider px-2 py-1 rounded border ${
                                        isAdmin ? 'text-warning border-warning/30 bg-warning-soft' : 'text-accent border-accent/30 bg-accent-soft'
                                    }`}>
                                        {roleLabel}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleSave} className="mt-12 md:mt-16 max-w-md">
                            <dl>
                                {FIELDS.map((f, i) => (
                                    <div key={f.key} className="flex items-baseline gap-4 border-t border-border py-3.5 first:border-0">
                                        <dt className="text-[10px] font-mono font-semibold text-sub/70 uppercase tracking-[0.15em] w-32 shrink-0">
                                            <span className="text-accent">{String(i + 1).padStart(2, '0')}</span> {f.label}
                                        </dt>
                                        {editing && f.editable ? (
                                            <dd className="flex-1 min-w-0">
                                                <input
                                                    value={form[f.key]}
                                                    onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                                                    placeholder={f.label}
                                                    className="input-line !py-1 w-full"
                                                />
                                            </dd>
                                        ) : (
                                            <dd className={`text-sm truncate ${user[f.key] ? 'text-ink font-medium' : 'text-sub/60 italic'}`}>
                                                {user[f.key] || 'Not set'}
                                            </dd>
                                        )}
                                    </div>
                                ))}
                                {editing && (
                                    <div className="flex items-baseline gap-4 border-t border-border py-3.5">
                                        <dt className="text-[10px] font-mono font-semibold text-sub/70 uppercase tracking-[0.15em] w-32 shrink-0">
                                            <span className="text-accent">06</span> Avatar URL
                                        </dt>
                                        <dd className="flex-1 min-w-0">
                                            <input
                                                value={form.avatar}
                                                onChange={(e) => setForm({ ...form, avatar: e.target.value })}
                                                placeholder="https://..."
                                                className="input-line !py-1 w-full"
                                            />
                                        </dd>
                                    </div>
                                )}
                            </dl>

                            {editing && (
                                <div className="flex items-center gap-3 mt-6">
                                    <button type="submit" disabled={saving} className="btn-editorial max-w-[160px] disabled:opacity-50">
                                        {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                                        {saving ? 'Saving...' : 'Save changes'}
                                    </button>
                                    <button type="button" onClick={cancelEditing} className="text-xs font-semibold text-sub hover:text-ink transition-colors">
                                        Cancel
                                    </button>
                                </div>
                            )}
                        </form>
                    </div>

                    {/* security / actions rail — 5/12, thin rule divider */}
                    <div className="lg:col-span-5 xl:col-span-4 lg:border-l lg:border-border lg:pl-10 xl:pl-14 lg:pt-1">
                        <div className="max-w-xs space-y-8">
                            <div>
                                <label className="label-mono">System role</label>
                                <p className="text-sm font-semibold text-ink">{roleLabel}</p>
                                <p className="text-[11px] text-sub font-mono mt-0.5">{user.role}</p>
                            </div>

                            <div>
                                <label className="label-mono">Account security</label>
                                <p className="text-xs text-sub leading-relaxed">
                                    Your password is securely encrypted on the server. To change your password or delete your account, please contact a VUNIS administrator.
                                </p>
                            </div>

                            <button onClick={logout} className="btn-editorial !bg-transparent !text-danger border border-danger/30 hover:!bg-danger-soft">
                                <LogOut className="w-3.5 h-3.5" /> Log out
                            </button>
                        </div>
                    </div>

                </div>
            </div>

            <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />
        </div>
    );
}
