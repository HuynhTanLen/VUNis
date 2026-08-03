'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { getAllUsers, updateUserRole, updateUserStatus, deleteUser, getSystemStats } from '../../services/authService';
import { getProjects } from '../../services/projectService';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import NotificationPopover from '../../components/ui/NotificationPopover';
import {
  Users, UserCheck, UserX, FolderGit2, Search, ShieldCheck,
  Settings, LogOut, LayoutDashboard, Folder, Shield, Trash2,
  RefreshCw, Lock, Unlock, AlertCircle, X, CheckCircle2, Activity
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();

  const [activeNav, setActiveNav] = useState('users');
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'lock',
    confirmText: 'Xác nhận',
    cancelText: 'Hủy bỏ',
    targetUser: null,
    selectedRole: '',
    onConfirm: null,
  });

  useEffect(() => {
    if (!authLoading) {
      const userRole = user?.role?.name || user?.role || '';
      const isAdmin = ['SUPER_ADMIN', 'USER_ADMIN', 'admin', 'super_admin'].includes(userRole);
      
      if (!user || !isAdmin) {
        router.push('/');
      } else {
        loadData();
      }
    }
  }, [user, authLoading]);

  const loadData = async () => {
    try {
      setLoadingData(true);
      const [usersData, projectsData] = await Promise.all([
        getAllUsers().catch(() => []),
        getProjects().catch(() => [])
      ]);
      setUsers(Array.isArray(usersData) ? usersData : []);
      setProjects(Array.isArray(projectsData) ? projectsData : []);
    } catch (error) {
      console.error('Lỗi tải dữ liệu quản trị:', error);
      setUsers([]);
      setProjects([]);
    } finally {
      setLoadingData(false);
    }
  };

  const handleToggleStatus = (targetUser) => {
    const isSuspended = targetUser.status === 'suspended' || Boolean(targetUser.isBlocked);
    setModalConfig({
      isOpen: true,
      title: isSuspended ? 'Mở Khóa Tài Khoản' : 'Tạm Khóa Tài Khoản',
      message: isSuspended 
        ? `Bạn có chắc chắn muốn mở khóa tài khoản của ${targetUser.name} (${targetUser.email})?`
        : `Bạn có chắc chắn muốn tạm khóa tài khoản của ${targetUser.name} (${targetUser.email})? Người dùng này sẽ không thể đăng nhập.`,
      type: 'lock',
      confirmText: isSuspended ? 'Mở Khóa' : 'Tạm Khóa',
      cancelText: 'Hủy bỏ',
      targetUser,
      onConfirm: async () => {
        const newStatus = isSuspended ? 'active' : 'suspended';
        await updateUserStatus(targetUser.id || targetUser._id, newStatus);
        loadData();
      }
    });
  };

  const handleChangeRole = (targetUser, newRole) => {
    setModalConfig({
      isOpen: true,
      title: 'Cập Nhật Quyền Quản Trị',
      message: `Bạn có chắc muốn đổi quyền của ${targetUser.name} sang "${newRole}"?`,
      type: 'role',
      confirmText: 'Lưu Thay Đổi',
      cancelText: 'Hủy bỏ',
      targetUser,
      selectedRole: newRole,
      onConfirm: async () => {
        await updateUserRole(targetUser.id || targetUser._id, newRole);
        loadData();
      }
    });
  };

  const handleDeleteUser = (targetUser) => {
    setModalConfig({
      isOpen: true,
      title: 'Xóa Tài Khoản Vĩnh Viễn',
      message: `Hành động này không thể hoàn tác! Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản của ${targetUser.name}?`,
      type: 'delete',
      confirmText: 'Xóa Vĩnh Viễn',
      cancelText: 'Hủy bỏ',
      targetUser,
      onConfirm: async () => {
        await deleteUser(targetUser.id || targetUser._id);
        loadData();
      }
    });
  };

  const filteredUsers = users.filter(u => {
    const isSuspended = u.status === 'suspended' || u.isBlocked;
    const isCurrentUser = user && (u.email === user.email || u.id === user.id || u._id === user._id);
    const isUserOnline = !isSuspended && (isCurrentUser || Boolean(u.isOnline));

    const matchesSearch = u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          u.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || (u.role?.name || u.role) === roleFilter;

    let matchesStatus = true;
    if (statusFilter === 'online') {
      matchesStatus = isUserOnline === true;
    } else if (statusFilter === 'offline') {
      matchesStatus = isUserOnline === false && !isSuspended;
    } else if (statusFilter === 'suspended') {
      matchesStatus = isSuspended === true;
    }

    return matchesSearch && matchesRole && matchesStatus;
  });

  const onlineCount = users.filter(u => {
    const isSuspended = u.status === 'suspended' || u.isBlocked;
    const isCurrentUser = Boolean(user?.email && u.email && u.email.toLowerCase() === user.email.toLowerCase());
    return !isSuspended && (isCurrentUser || u.isOnline === true);
  }).length;

  const suspendedCount = users.filter(u => u.status === 'suspended' || u.isBlocked).length;
  const activeCount = users.length - suspendedCount;

  return (
    <div className="flex min-h-screen bg-bg font-sans text-ink">

      {/* LEFT SIDEBAR */}
      <aside className="w-60 bg-surface border-r border-border p-5 flex flex-col justify-between hidden md:flex shrink-0">
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-9 h-9 bg-accent rounded-xl flex items-center justify-center text-white font-extrabold text-base shadow-sm">
              KS
            </div>
            <div>
              <h2 className="text-xs font-bold text-ink leading-tight">KS Platform</h2>
              <span className="text-[10px] text-sub font-semibold tracking-wide uppercase">Admin Console</span>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <p className="text-[10px] font-bold text-sub uppercase tracking-wider mb-3">Menu Quản trị</p>
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveNav('users')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
                    activeNav === 'users' ? 'text-accent bg-accent-soft' : 'text-sub hover:bg-accent-soft hover:text-ink'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" /> Quản lý Người dùng
                </button>
                <button
                  onClick={() => setActiveNav('projects')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
                    activeNav === 'projects' ? 'text-accent bg-accent-soft' : 'text-sub hover:bg-accent-soft hover:text-ink'
                  }`}
                >
                  <Folder className="w-4 h-4" /> Quản lý Dự án
                </button>
              </nav>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-border space-y-1">
          <button
            onClick={() => router.push('/')}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-sub hover:bg-accent-soft hover:text-ink rounded-lg transition-colors"
          >
            <Settings className="w-4 h-4 text-sub" /> Trở về Trang chủ
          </button>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-danger hover:bg-danger-soft rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" /> Đăng xuất
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto">

        {/* Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-xl font-bold text-ink tracking-tight">System Admin Console</h1>
            <p className="text-xs text-sub mt-1">Giám sát tài khoản và phân quyền người dùng toàn hệ thống.</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-sub absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-9 w-64"
              />
            </div>
            <Button variant="secondary" icon={RefreshCw} onClick={loadData}>Tải lại</Button>
            <NotificationPopover />
          </div>
        </div>

        {/* BENTO GRID FOR ADMIN METRICS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          
          {/* Cell 1: Total Users - LARGE BENTO CELL (Top-Left Priority) */}
          <div className="md:col-span-2 bg-surface rounded-xl border border-border p-6 flex flex-col justify-between shadow-sm relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold text-sub uppercase tracking-wider">Hệ Thống Tải Khoản</span>
                <h3 className="text-3xl font-extrabold text-ink font-mono mt-1">{users.length}</h3>
                <p className="text-xs text-sub mt-1">Tổng người dùng đã đăng ký trên hệ thống</p>
              </div>
              <div className="p-3 bg-accent-soft text-accent rounded-xl border border-accent/20">
                <Users className="w-6 h-6" />
              </div>
            </div>

            {/* User Activity & Status Progress Bar */}
            <div className="mt-6 space-y-2">
              <div className="flex justify-between text-xs font-medium text-sub">
                <span>Trạng thái hoạt động</span>
                <span className="font-mono">{activeCount} hoạt động / {suspendedCount} bị khóa</span>
              </div>
              <div className="h-2 bg-bg rounded-full overflow-hidden flex">
                <div 
                  className="bg-success h-full transition-all duration-300"
                  style={{ width: `${users.length > 0 ? (onlineCount / users.length) * 100 : 0}%` }}
                  title="Online"
                />
                <div 
                  className="bg-accent h-full transition-all duration-300"
                  style={{ width: `${users.length > 0 ? ((activeCount - onlineCount) / users.length) * 100 : 0}%` }}
                  title="Offline"
                />
                <div 
                  className="bg-danger h-full transition-all duration-300"
                  style={{ width: `${users.length > 0 ? (suspendedCount / users.length) * 0 : 0}%` }}
                  title="Khóa"
                />
              </div>
              <div className="flex items-center gap-4 text-[11px] text-sub pt-1 font-mono">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-success"></span> Online ({onlineCount})</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-accent"></span> Offline ({activeCount - onlineCount})</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-danger"></span> Bị khóa ({suspendedCount})</span>
              </div>
            </div>
          </div>

          {/* Cell 2 & 3 & 4 Stacked */}
          <div className="space-y-4 flex flex-col justify-between">
            
            {/* Online Users */}
            <div className="bg-surface rounded-xl border border-border p-4 flex items-center justify-between shadow-sm">
              <div>
                <p className="text-[10px] font-bold text-sub uppercase tracking-wider">Đang Trực Tuyến</p>
                <h4 className="text-xl font-bold text-success font-mono mt-0.5">{onlineCount}</h4>
              </div>
              <div className="p-2.5 bg-success-soft text-success rounded-lg border border-success/20">
                <UserCheck className="w-5 h-5" />
              </div>
            </div>

            {/* Suspended Users */}
            <div className="bg-surface rounded-xl border border-border p-4 flex items-center justify-between shadow-sm">
              <div>
                <p className="text-[10px] font-bold text-sub uppercase tracking-wider">Tài Khoản Bị Khóa</p>
                <h4 className="text-xl font-bold text-danger font-mono mt-0.5">{suspendedCount}</h4>
              </div>
              <div className="p-2.5 bg-danger-soft text-danger rounded-lg border border-danger/20">
                <UserX className="w-5 h-5" />
              </div>
            </div>

            {/* Total Projects */}
            <div className="bg-surface rounded-xl border border-border p-4 flex items-center justify-between shadow-sm">
              <div>
                <p className="text-[10px] font-bold text-sub uppercase tracking-wider">Tổng Số Dự Án</p>
                <h4 className="text-xl font-bold text-ink font-mono mt-0.5">{projects.length}</h4>
              </div>
              <div className="p-2.5 bg-accent-soft text-accent rounded-lg border border-accent/20">
                <FolderGit2 className="w-5 h-5" />
              </div>
            </div>

          </div>

        </div>

        {/* DATA TABLE USER MANAGEMENT */}
        <div className="bg-surface rounded-xl border border-border overflow-hidden shadow-sm">
          
          {/* Table Toolbar Header */}
          <div className="p-5 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-ink">Danh Sách Tài Khoản Người Dùng</h3>
              <p className="text-xs text-sub mt-0.5">Hiển thị <span className="font-mono">{filteredUsers.length}</span> tài khoản phù hợp bộ lọc</p>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-1.5 bg-bg border border-border rounded-lg text-xs font-semibold text-ink focus:outline-none focus:border-accent"
              >
                <option value="all">Tất cả vai trò</option>
                <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                <option value="USER_ADMIN">USER_ADMIN</option>
                <option value="GROUPS_ADMIN">GROUPS_ADMIN</option>
                <option value="SECURITY_ADMIN">SECURITY_ADMIN</option>
                <option value="HELP_DESK_ADMIN">HELP_DESK_ADMIN</option>
                <option value="USER">USER</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 bg-bg border border-border rounded-lg text-xs font-semibold text-ink focus:outline-none focus:border-accent"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="online">Trực tuyến (Online)</option>
                <option value="offline">Ngoại tuyến (Offline)</option>
                <option value="suspended">Bị khóa (Suspended)</option>
              </select>
            </div>
          </div>

          {/* Table Area */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-bg border-b border-border text-[10px] font-bold text-sub uppercase tracking-wider">
                  <th className="py-3 px-4 w-10 text-center">
                    <input type="checkbox" className="rounded border-border text-accent focus:ring-accent/40" />
                  </th>
                  <th className="py-3 px-4">Họ & Tên / Email</th>
                  <th className="py-3 px-4">Quyền Admin Hệ Thống</th>
                  <th className="py-3 px-4">Trạng Thái</th>
                  <th className="py-3 px-4">Ngày Tham Gia</th>
                  <th className="py-3 px-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-xs">
                {loadingData ? (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-sub">
                      Đang tải danh sách người dùng...
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-sub">
                      Không tìm thấy tài khoản người dùng nào.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    const isSuspended = u.status === 'suspended' || u.isBlocked;
                    const userRole = u.role?.name || u.role || 'USER';
                    const isCurrentUser = Boolean(user?.email && u.email && u.email.toLowerCase() === user.email.toLowerCase());
                    const isUserOnline = !isSuspended && (isCurrentUser || u.isOnline === true);

                    return (
                      <tr key={u.id || u._id} className="hover:bg-accent-soft/30 transition-colors">
                        <td className="py-3.5 px-4 text-center">
                          <input type="checkbox" className="rounded border-border text-accent focus:ring-accent/40" />
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-accent text-white font-bold flex items-center justify-center text-xs overflow-hidden shrink-0">
                              {u.avatar ? (
                                <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" />
                              ) : (
                                u.name?.charAt(0).toUpperCase() || 'U'
                              )}
                            </div>
                            <div>
                              <p className="font-semibold text-ink">{u.name}</p>
                              <p className="text-[11px] text-sub font-mono">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <select
                            value={userRole}
                            onChange={(e) => handleChangeRole(u, e.target.value)}
                            className="bg-bg border border-border rounded-md px-2 py-1 text-xs font-semibold text-ink focus:outline-none focus:border-accent cursor-pointer"
                          >
                            <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                            <option value="USER_ADMIN">USER_ADMIN</option>
                            <option value="GROUPS_ADMIN">GROUPS_ADMIN</option>
                            <option value="SECURITY_ADMIN">SECURITY_ADMIN</option>
                            <option value="HELP_DESK_ADMIN">HELP_DESK_ADMIN</option>
                            <option value="USER">USER</option>
                          </select>
                        </td>
                        <td className="py-3.5 px-4">
                          {isSuspended ? (
                            <Badge variant="danger">Bị Khóa</Badge>
                          ) : isUserOnline ? (
                            <Badge variant="success">Trực Tuyến</Badge>
                          ) : (
                            <Badge variant="neutral">Ngoại Tuyến</Badge>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-sub font-mono">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString('vi-VN') : 'Mới tạo'}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant={isSuspended ? 'secondary' : 'danger'}
                              size="sm"
                              icon={isSuspended ? Unlock : Lock}
                              onClick={() => handleToggleStatus(u)}
                            >
                              {isSuspended ? 'Mở Khóa' : 'Khóa'}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              icon={Trash2}
                              onClick={() => handleDeleteUser(u)}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>

      {/* CENTER MODAL CONFIRMATION DIALOG */}
      {modalConfig.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm">
          <div className="bg-surface rounded-2xl max-w-md w-full p-6 shadow-xl border border-border">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${
                  modalConfig.type === 'delete' ? 'bg-danger-soft text-danger border border-danger/20' : 'bg-accent-soft text-accent border border-accent/20'
                }`}>
                  <AlertCircle className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-ink">{modalConfig.title}</h3>
              </div>
              <button
                onClick={() => setModalConfig({ ...modalConfig, isOpen: false })}
                className="p-1 text-sub hover:text-ink rounded-lg hover:bg-accent-soft transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-sub leading-relaxed mb-6">
              {modalConfig.message}
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
              <Button
                variant="secondary"
                onClick={() => setModalConfig({ ...modalConfig, isOpen: false })}
              >
                {modalConfig.cancelText}
              </Button>
              <Button
                variant={modalConfig.type === 'delete' ? 'danger' : 'primary'}
                onClick={async () => {
                  if (modalConfig.onConfirm) {
                    await modalConfig.onConfirm();
                  }
                  setModalConfig({ ...modalConfig, isOpen: false });
                }}
              >
                {modalConfig.confirmText}
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
