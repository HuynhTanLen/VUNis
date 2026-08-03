'use client';

import { useAuth } from "../../hooks/useAuth";
import Link from 'next/link';
import { User, Mail, Shield, LogOut, Briefcase, Lock, ChevronLeft } from 'lucide-react';
import Badge from '../../components/ui/Badge';

export default function ProfilePage() {
    const { user, logout } = useAuth();

    if (!user) {
        return (
            <div className="min-h-[100dvh] flex items-center justify-center bg-bg font-sans antialiased text-ink">
                <div className="text-center p-6 card-clean max-w-sm w-full mx-4 space-y-4">
                    <div className="w-12 h-12 bg-accent-soft rounded-full flex items-center justify-center mx-auto border border-accent/20">
                        <User className="w-6 h-6 text-accent" />
                    </div>
                    <p className="text-ink text-xs font-semibold uppercase tracking-wider">Bạn chưa đăng nhập</p>
                    <Link 
                        href="/" 
                        className="btn-primary block w-full text-center"
                    >
                        Về trang chủ
                    </Link>
                </div>
            </div>
        );
    }

    const initial = user.name ? user.name.charAt(0).toUpperCase() : 'U';
    const isAdmin = (user.role?.name === 'admin' || user.role?.name === 'super_admin');

    return (
        <div className="min-h-[100dvh] bg-bg text-ink p-4 md:p-6 font-sans antialiased">
            <div className="max-w-2xl mx-auto space-y-5 py-6">
                
                <div>
                    <Link 
                        href="/" 
                        className="btn-secondary inline-flex items-center gap-2"
                    >
                        <ChevronLeft className="w-4 h-4 text-sub" />
                        <span>Quay lại trang chính</span>
                    </Link>
                </div>

                <div className="card-clean overflow-hidden">
                    <div className="p-6 md:p-8 space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-accent text-white rounded-xl flex items-center justify-center text-xl font-semibold shadow-sm">
                                    {initial}
                                </div>
                                <div>
                                    <h1 className="text-base font-semibold text-ink leading-tight">{user.name}</h1>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Badge variant={isAdmin ? 'warning' : 'accent'} icon={Shield}>
                                            {user.role?.displayName || 'Thành viên'}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                            
                            <button 
                                onClick={logout} 
                                className="btn-danger flex items-center justify-center gap-1.5 w-full sm:w-auto"
                            >
                                <LogOut className="w-3.5 h-3.5" />
                                Đăng xuất
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-5 border-t border-border">
                            <div className="p-4 bg-bg border border-border rounded-lg flex items-start gap-3">
                                <div className="p-2 bg-surface rounded-md border border-border shrink-0">
                                    <Mail className="w-4 h-4 text-accent" />
                                </div>
                                <div className="min-w-0">
                                    <p className="label-field">Địa chỉ Email</p>
                                    <p className="font-semibold text-xs text-ink truncate mt-0.5">{user.email}</p>
                                </div>
                            </div>

                            <div className="p-4 bg-bg border border-border rounded-lg flex items-start gap-3">
                                <div className="p-2 bg-surface rounded-md border border-border shrink-0">
                                    <User className="w-4 h-4 text-accent" />
                                </div>
                                <div className="min-w-0">
                                    <p className="label-field">Số điện thoại</p>
                                    <p className="font-semibold text-xs text-ink font-mono truncate mt-0.5">{user.phone || 'Chưa cập nhật'}</p>
                                </div>
                            </div>

                            <div className="p-4 bg-bg border border-border rounded-lg flex items-start gap-3">
                                <div className="p-2 bg-surface rounded-md border border-border shrink-0">
                                    <Briefcase className="w-4 h-4 text-accent" />
                                </div>
                                <div className="min-w-0">
                                    <p className="label-field">Chức danh / Vị trí</p>
                                    <p className="font-semibold text-xs text-ink truncate mt-0.5">{user.jobTitle || 'Software Engineer'}</p>
                                </div>
                            </div>

                            <div className="p-4 bg-bg border border-border rounded-lg flex items-start gap-3">
                                <div className="p-2 bg-surface rounded-md border border-border shrink-0">
                                    <Shield className="w-4 h-4 text-accent" />
                                </div>
                                <div className="min-w-0">
                                    <p className="label-field">Phòng ban & Công ty</p>
                                    <p className="font-semibold text-xs text-ink truncate mt-0.5">
                                        {user.department || 'Engineering'} • {user.company || 'KS Organization'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-warning-soft border border-warning/20 rounded-lg flex items-start gap-3">
                            <div className="p-2 bg-surface rounded-md border border-warning/20 shrink-0">
                                <Lock className="w-4 h-4 text-warning" />
                            </div>
                            <div>
                                <h4 className="text-xs font-semibold text-warning uppercase tracking-wider">Bảo mật tài khoản</h4>
                                <p className="text-xs text-warning/90 font-normal leading-relaxed mt-1">
                                    Mật khẩu của bạn đã được mã hóa an toàn trên máy chủ. Nếu có nhu cầu thay đổi mật khẩu hoặc xóa tài khoản, vui lòng gửi yêu cầu hỗ trợ trực tiếp đến Ban Quản Trị Skys.
                                </p>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
