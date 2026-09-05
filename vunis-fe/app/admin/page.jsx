'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { getAllUsers, updateUserRole, updateUserStatus, deleteUser, getSystemStats } from '../../services/authService';
import { getAllProjectsAdmin, deleteProjectAdmin } from '../../services/projectService';
import { getRoles, getAllPermissions, createRole, deleteRole } from '../../services/roleService';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Toast from '../../components/ui/Toast';
import NotificationPopover from '../../components/ui/NotificationPopover';
import StatsCharts from '../../components/admin/StatsCharts';
import {
  Users, UserCheck, UserX, FolderGit2, Search, ShieldCheck,
  Settings, LogOut, LayoutDashboard, Folder, ShieldPlus, Trash2,
  RefreshCw, Lock, Unlock, AlertCircle, X, Activity,
  Cpu, MemoryStick, Server, Clock, Plus, Tag, BarChart3
} from 'lucide-react';

// Must match the SystemRole enum in prisma/schema.prisma exactly
const SYSTEM_ROLES = ['SUPER_ADMIN', 'USER_ADMIN', 'GROUPS_ADMIN', 'SERVICE_ADMIN', 'HELP_DESK_ADMIN', 'USER'];

// Display label shown to end users — the underlying value sent to the API stays 'USER'
const ROLE_LABEL = { USER: 'Member' };
const roleLabel = (r) => ROLE_LABEL[r] || r;

// Only SUPER_ADMIN + SERVICE_ADMIN can see all projects (see project.route.js: /admin/all)
const PROJECT_ADMIN_ROLES = ['SUPER_ADMIN', 'SERVICE_ADMIN'];

export default function AdminDashboard() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const userRole = user?.role || '';

  const [activeNav, setActiveNav] = useState('stats');
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [systemStats, setSystemStats] = useState(null);
  const [loadingData, setLoadingData] = useState(true);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [toast, setToast] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const [modalConfig, setModalConfig] = useState({
    isOpen: false, title: '', message: '', type: 'lock',
    confirmText: 'Confirm', cancelText: 'Cancel', onConfirm: null,
  });
  const [roleFormOpen, setRoleFormOpen] = useState(false);
  const [roleForm, setRoleForm] = useState({ name: '', code: '', description: '', permissions: [] });

  const canViewAllProjects = PROJECT_ADMIN_ROLES.includes(userRole);
  const canManageRoles = ['SUPER_ADMIN', 'USER_ADMIN'].includes(userRole);

  useEffect(() => {
    if (!authLoading) {
      const isAdmin = SYSTEM_ROLES.filter(r => r !== 'USER').includes(userRole);
      if (!user || !isAdmin) {
        router.push('/');
      } else {
        loadData();
      }
    }
  }, [user, authLoading]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadData = async () => {
    try {
      setLoadingData(true);
      const [usersData, projectsData, statsData] = await Promise.all([
        getAllUsers().catch(() => []),
        canViewAllProjects ? getAllProjectsAdmin().catch(() => []) : Promise.resolve([]),
        getSystemStats().catch(() => null),
      ]);
      setUsers(Array.isArray(usersData) ? usersData : []);
      setProjects(Array.isArray(projectsData) ? projectsData : []);
      setSystemStats(statsData);
    } catch (error) {
      console.error('Error loading admin data:', error);
      setUsers([]);
      setProjects([]);
    } finally {
      setLoadingData(false);
    }
  };

  const loadRoles = async () => {
    try {
      setLoadingRoles(true);
      const [rolesData, permsData] = await Promise.all([
        getRoles().catch(() => []),
        getAllPermissions().catch(() => []),
      ]);
      setRoles(Array.isArray(rolesData) ? rolesData : []);
      setPermissions(Array.isArray(permsData) ? permsData : []);
    } finally {
      setLoadingRoles(false);
    }
  };

  const handleNavChange = (nav) => {
    setActiveNav(nav);
    if (nav === 'roles' && roles.length === 0 && permissions.length === 0) {
      loadRoles();
    }
  };

  const handleToggleStatus = (targetUser) => {
    const isSuspended = targetUser.status === 'suspended' || Boolean(targetUser.isBlocked);
    setModalConfig({
      isOpen: true,
      title: isSuspended ? 'Unlock Account' : 'Suspend Account',
      message: isSuspended
        ? `Are you sure you want to unlock the account of ${targetUser.name} (${targetUser.email})?`
        : `Are you sure you want to suspend the account of ${targetUser.name} (${targetUser.email})? This user will not be able to log in.`,
      type: 'lock',
      confirmText: isSuspended ? 'Unlock' : 'Suspend',
      cancelText: 'Cancel',
      onConfirm: async () => {
        await updateUserStatus(targetUser.id, !isSuspended);
        showToast(isSuspended ? 'Account unlocked.' : 'Account suspended.');
        loadData();
      }
    });
  };

  const handleChangeRole = (targetUser, newRole) => {
    if (newRole === (targetUser.role || 'USER')) return;
    setModalConfig({
      isOpen: true,
      title: 'Update System Role',
      message: `Are you sure you want to change ${targetUser.name}'s role to "${roleLabel(newRole)}"?`,
      type: 'role',
      confirmText: 'Save Changes',
      cancelText: 'Cancel',
      onConfirm: async () => {
        await updateUserRole(targetUser.id, newRole);
        showToast('User role updated.');
        loadData();
      }
    });
  };

  const handleDeleteUser = (targetUser) => {
    setModalConfig({
      isOpen: true,
      title: 'Permanently Delete Account',
      message: `This action cannot be undone! Are you sure you want to permanently delete the account of ${targetUser.name}?`,
      type: 'delete',
      confirmText: 'Delete Permanently',
      cancelText: 'Cancel',
      onConfirm: async () => {
        await deleteUser(targetUser.id);
        showToast('User account deleted.');
        loadData();
      }
    });
  };

  const handleDeleteProject = (project) => {
    setModalConfig({
      isOpen: true,
      title: 'Delete Project',
      message: `This will permanently delete the project "${project.name}" along with all related sprints and tasks. Are you sure?`,
      type: 'delete',
      confirmText: 'Delete Project',
      cancelText: 'Cancel',
      onConfirm: async () => {
        await deleteProjectAdmin(project.id);
        showToast('Project deleted.');
        loadData();
      }
    });
  };

  const handleDeleteRole = (role) => {
    setModalConfig({
      isOpen: true,
      title: 'Delete Project Role',
      message: `Are you sure you want to delete the role "${role.name}"? Members currently holding this role will lose the associated permissions.`,
      type: 'delete',
      confirmText: 'Delete Role',
      cancelText: 'Cancel',
      onConfirm: async () => {
        await deleteRole(role.id);
        showToast('Role deleted.');
        loadRoles();
      }
    });
  };

  const togglePermissionInForm = (code) => {
    setRoleForm(prev => ({
      ...prev,
      permissions: prev.permissions.includes(code)
        ? prev.permissions.filter(c => c !== code)
        : [...prev.permissions, code]
    }));
  };

  const handleCreateRole = async (e) => {
    e.preventDefault();
    try {
      await createRole(roleForm);
      showToast('Role created.');
      setRoleFormOpen(false);
      setRoleForm({ name: '', code: '', description: '', permissions: [] });
      loadRoles();
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to create role.', 'error');
    }
  };

  const filteredUsers = users.filter(u => {
    const isSuspended = u.status === 'suspended' || u.isBlocked;
    const matchesSearch = u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          u.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;

    let matchesStatus = true;
    if (statusFilter === 'online') matchesStatus = u.isOnline === true;
    else if (statusFilter === 'offline') matchesStatus = u.isOnline === false && !isSuspended;
    else if (statusFilter === 'suspended') matchesStatus = isSuspended === true;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const onlineCount = users.filter(u => u.isOnline).length;
  const suspendedCount = users.filter(u => u.status === 'suspended' || u.isBlocked).length;
  const activeCount = users.length - suspendedCount;
  const offlineCount = activeCount - onlineCount;

  const permissionsByModule = permissions.reduce((acc, p) => {
    const mod = p.module || 'OTHER';
    (acc[mod] ||= []).push(p);
    return acc;
  }, {});

  const NAV_ITEMS = [
    { key: 'stats', label: 'Statistics', icon: BarChart3 },
    { key: 'users', label: 'User Management', icon: LayoutDashboard },
    ...(canViewAllProjects ? [{ key: 'projects', label: 'Project Management', icon: Folder }] : []),
    { key: 'roles', label: 'Roles & Permissions', icon: ShieldCheck },
  ];

  return (
    <div className="flex min-h-screen bg-bg font-sans text-ink">

      {/* LEFT SIDEBAR */}
      <aside className="w-60 bg-surface border-r border-border p-5 flex flex-col justify-between hidden md:flex shrink-0">
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-white font-black text-xs">
              VU
            </div>
            <div>
              <h2 className="text-xs font-bold text-ink leading-tight">VUNIS</h2>
              <span className="text-[10px] text-sub font-semibold tracking-wide uppercase">Admin Console</span>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <p className="text-[10px] font-bold text-sub uppercase tracking-wider mb-3">Admin Menu</p>
              <nav className="space-y-1">
                {NAV_ITEMS.map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => handleNavChange(key)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
                      activeNav === key ? 'text-accent bg-accent-soft' : 'text-sub hover:bg-accent-soft hover:text-ink'
                    }`}
                  >
                    <Icon className="w-4 h-4" /> {label}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-border space-y-1">
          <div className="px-3 py-2 mb-1">
            <p className="text-xs font-semibold text-ink truncate">{user?.name}</p>
            <Badge variant="accent" size="sm">{roleLabel(userRole)}</Badge>
          </div>
          <button
            onClick={() => router.push('/')}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-sub hover:bg-accent-soft hover:text-ink rounded-lg transition-colors"
          >
            <Settings className="w-4 h-4 text-sub" /> Back to Workspace
          </button>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-danger hover:bg-danger-soft rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto">

        {/* Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-xl font-bold text-ink tracking-tight">System Admin Console</h1>
            <p className="text-xs text-sub mt-1">Monitor accounts, projects, and permissions across the VUNIS system.</p>
          </div>

          <div className="flex items-center gap-3">
            {activeNav === 'users' && (
              <div className="relative">
                <Search className="w-4 h-4 text-sub absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search by name, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-9 w-64"
                />
              </div>
            )}
            <Button variant="secondary" icon={RefreshCw} onClick={activeNav === 'roles' ? loadRoles : loadData}>Reload</Button>
            <NotificationPopover />
          </div>
        </div>

        {/* BENTO GRID FOR ADMIN METRICS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">

          {/* Cell 1: Total Users - LARGE BENTO CELL */}
          <div className="md:col-span-2 bg-surface rounded-xl border border-border p-6 flex flex-col justify-between relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold text-sub uppercase tracking-wider">System Accounts</span>
                <h3 className="text-3xl font-extrabold text-ink font-mono mt-1">{users.length}</h3>
                <p className="text-xs text-sub mt-1">Total registered users on the platform</p>
              </div>
              <div className="p-3 bg-accent-soft text-accent rounded-xl border border-accent/20">
                <Users className="w-6 h-6" />
              </div>
            </div>

            <div className="mt-6 space-y-2">
              <div className="flex justify-between text-xs font-medium text-sub">
                <span>Activity Status</span>
                <span className="font-mono">{activeCount} active / {suspendedCount} suspended</span>
              </div>
              <div className="h-2 bg-bg rounded-full overflow-hidden flex">
                <div className="bg-success h-full transition-all duration-300" style={{ width: `${users.length > 0 ? (onlineCount / users.length) * 100 : 0}%` }} title="Online" />
                <div className="bg-accent h-full transition-all duration-300" style={{ width: `${users.length > 0 ? (offlineCount / users.length) * 100 : 0}%` }} title="Offline" />
                <div className="bg-danger h-full transition-all duration-300" style={{ width: `${users.length > 0 ? (suspendedCount / users.length) * 100 : 0}%` }} title="Suspended" />
              </div>
              <div className="flex items-center gap-4 text-[11px] text-sub pt-1 font-mono">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-success"></span> Online ({onlineCount})</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-accent"></span> Offline ({offlineCount})</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-danger"></span> Suspended ({suspendedCount})</span>
              </div>
            </div>
          </div>

          {/* Cell 2 & 3 & 4 Stacked */}
          <div className="space-y-4 flex flex-col justify-between">
            <div className="bg-surface rounded-xl border border-border p-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-sub uppercase tracking-wider">Online Now</p>
                <h4 className="text-xl font-bold text-success font-mono mt-0.5">{onlineCount}</h4>
              </div>
              <div className="p-2.5 bg-success-soft text-success rounded-lg border border-success/20">
                <UserCheck className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-surface rounded-xl border border-border p-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-sub uppercase tracking-wider">Suspended Accounts</p>
                <h4 className="text-xl font-bold text-danger font-mono mt-0.5">{suspendedCount}</h4>
              </div>
              <div className="p-2.5 bg-danger-soft text-danger rounded-lg border border-danger/20">
                <UserX className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-surface rounded-xl border border-border p-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-sub uppercase tracking-wider">
                  {canViewAllProjects ? 'Total Projects' : 'Project Roles'}
                </p>
                <h4 className="text-xl font-bold text-ink font-mono mt-0.5">
                  {canViewAllProjects ? projects.length : roles.length || '—'}
                </h4>
              </div>
              <div className="p-2.5 bg-accent-soft text-accent rounded-lg border border-accent/20">
                {canViewAllProjects ? <FolderGit2 className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
              </div>
            </div>
          </div>
        </div>

        {/* SYSTEM HEALTH (only shown if /api/system/stats returns data - SUPER_ADMIN only) */}
        {systemStats && (
          <div className="bg-surface rounded-xl border border-border p-5 mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Server className="w-4 h-4 text-accent" />
              <h3 className="text-sm font-bold text-ink">Server Health</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-bg rounded-lg border border-border"><MemoryStick className="w-4 h-4 text-sub" /></div>
                <div>
                  <p className="text-[10px] text-sub uppercase font-bold">RAM</p>
                  <p className="text-xs font-semibold text-ink font-mono">{systemStats.ramUsed} / {systemStats.ramTotal}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-bg rounded-lg border border-border"><Cpu className="w-4 h-4 text-sub" /></div>
                <div>
                  <p className="text-[10px] text-sub uppercase font-bold">CPU</p>
                  <p className="text-xs font-semibold text-ink font-mono">{systemStats.cpuLoad}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-bg rounded-lg border border-border"><Clock className="w-4 h-4 text-sub" /></div>
                <div>
                  <p className="text-[10px] text-sub uppercase font-bold">Uptime</p>
                  <p className="text-xs font-semibold text-ink font-mono">{systemStats.uptime}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-bg rounded-lg border border-border"><Activity className="w-4 h-4 text-sub" /></div>
                <div>
                  <p className="text-[10px] text-sub uppercase font-bold">Database</p>
                  <p className="text-xs font-semibold text-ink font-mono">{systemStats.dbName}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: STATISTICS */}
        {activeNav === 'stats' && (
          loadingData ? (
            <div className="py-16 text-center text-sub text-xs">Loading statistics...</div>
          ) : (
            <StatsCharts
              users={users}
              projects={projects}
              canViewAllProjects={canViewAllProjects}
              systemRoles={SYSTEM_ROLES}
            />
          )
        )}

        {/* TAB: USERS */}
        {activeNav === 'users' && (
          <div className="bg-surface rounded-xl border border-border overflow-hidden">
            <div className="p-5 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-ink">User Accounts</h3>
                <p className="text-xs text-sub mt-0.5">Showing <span className="font-mono">{filteredUsers.length}</span> matching accounts</p>
              </div>

              <div className="flex items-center gap-3">
                <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="px-3 py-1.5 bg-bg border border-border rounded-lg text-xs font-semibold text-ink focus:outline-none focus:border-accent">
                  <option value="all">All Roles</option>
                  {SYSTEM_ROLES.map(r => <option key={r} value={r}>{roleLabel(r)}</option>)}
                </select>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-1.5 bg-bg border border-border rounded-lg text-xs font-semibold text-ink focus:outline-none focus:border-accent">
                  <option value="all">All Statuses</option>
                  <option value="online">Online</option>
                  <option value="offline">Offline</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-bg border-b border-border text-[10px] font-bold text-sub uppercase tracking-wider">
                    <th className="py-3 px-4">Full Name / Email</th>
                    <th className="py-3 px-4">System Role</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Joined Date</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-xs">
                  {loadingData ? (
                    <tr><td colSpan="5" className="py-12 text-center text-sub">Loading users...</td></tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr><td colSpan="5" className="py-12 text-center text-sub">No user accounts found.</td></tr>
                  ) : (
                    filteredUsers.map((u) => {
                      const isSuspended = u.status === 'suspended' || u.isBlocked;
                      const isCurrentUser = user && u.id === user.id;
                      return (
                        <tr key={u.id} className="hover:bg-accent-soft/30 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-accent text-white font-bold flex items-center justify-center text-xs overflow-hidden shrink-0">
                                {u.avatar ? <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" /> : (u.name?.charAt(0).toUpperCase() || 'U')}
                              </div>
                              <div>
                                <p className="font-semibold text-ink">{u.name} {isCurrentUser && <span className="text-[10px] text-accent font-normal">(you)</span>}</p>
                                <p className="text-[11px] text-sub font-mono">{u.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <select
                              value={u.role || 'USER'}
                              onChange={(e) => handleChangeRole(u, e.target.value)}
                              disabled={isCurrentUser}
                              className="bg-bg border border-border rounded-md px-2 py-1 text-xs font-semibold text-ink focus:outline-none focus:border-accent cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {SYSTEM_ROLES.map(r => <option key={r} value={r}>{roleLabel(r)}</option>)}
                            </select>
                          </td>
                          <td className="py-3.5 px-4">
                            {isSuspended ? <Badge variant="danger">Suspended</Badge> : u.isOnline ? <Badge variant="success">Online</Badge> : <Badge variant="neutral">Offline</Badge>}
                          </td>
                          <td className="py-3.5 px-4 text-sub font-mono">
                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-US') : 'New'}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button variant={isSuspended ? 'secondary' : 'danger'} size="sm" icon={isSuspended ? Unlock : Lock} disabled={isCurrentUser} onClick={() => handleToggleStatus(u)}>
                                {isSuspended ? 'Unlock' : 'Suspend'}
                              </Button>
                              <Button variant="ghost" size="sm" icon={Trash2} disabled={isCurrentUser} onClick={() => handleDeleteUser(u)} />
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
        )}

        {/* TAB: PROJECTS (SUPER_ADMIN / SERVICE_ADMIN only) */}
        {activeNav === 'projects' && canViewAllProjects && (
          <div className="bg-surface rounded-xl border border-border overflow-hidden">
            <div className="p-5 border-b border-border">
              <h3 className="text-sm font-bold text-ink">All Projects in the System</h3>
              <p className="text-xs text-sub mt-0.5">Showing <span className="font-mono">{projects.length}</span> projects (all owners)</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-bg border-b border-border text-[10px] font-bold text-sub uppercase tracking-wider">
                    <th className="py-3 px-4">Project</th>
                    <th className="py-3 px-4">Owner</th>
                    <th className="py-3 px-4">Model</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Created</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-xs">
                  {loadingData ? (
                    <tr><td colSpan="6" className="py-12 text-center text-sub">Loading projects...</td></tr>
                  ) : projects.length === 0 ? (
                    <tr><td colSpan="6" className="py-12 text-center text-sub">No projects in the system yet.</td></tr>
                  ) : (
                    projects.map((p) => (
                      <tr key={p.id} className="hover:bg-accent-soft/30 transition-colors">
                        <td className="py-3.5 px-4">
                          <p className="font-semibold text-ink">{p.name}</p>
                          <p className="text-[11px] text-sub font-mono">{p.key}</p>
                        </td>
                        <td className="py-3.5 px-4 text-sub">{p.owner?.name || p.owner?.email || '—'}</td>
                        <td className="py-3.5 px-4"><Badge variant="neutral" size="sm">{p.modelType}</Badge></td>
                        <td className="py-3.5 px-4"><Badge variant={p.status === 'ACTIVE' ? 'success' : p.status === 'CANCELLED' ? 'danger' : 'neutral'} size="sm">{p.status}</Badge></td>
                        <td className="py-3.5 px-4 text-sub font-mono">{p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-US') : '—'}</td>
                        <td className="py-3.5 px-4 text-right">
                          <Button variant="ghost" size="sm" icon={Trash2} onClick={() => handleDeleteProject(p)} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB: ROLES & PERMISSIONS */}
        {activeNav === 'roles' && (
          <div className="space-y-5">
            <div className="bg-surface rounded-xl border border-border overflow-hidden">
              <div className="p-5 border-b border-border flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-ink">Project Roles (Role-Based Access Control)</h3>
                  <p className="text-xs text-sub mt-0.5">Roles assigned to members within each project, with their associated permission sets.</p>
                </div>
                {canManageRoles && (
                  <Button variant="primary" size="sm" icon={Plus} onClick={() => setRoleFormOpen(true)}>Create Role</Button>
                )}
              </div>

              <div className="divide-y divide-border">
                {loadingRoles ? (
                  <p className="py-12 text-center text-sub text-xs">Loading roles...</p>
                ) : roles.length === 0 ? (
                  <p className="py-12 text-center text-sub text-xs">No custom roles yet.</p>
                ) : (
                  roles.map(role => (
                    <div key={role.id} className="p-5 flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-bold text-ink">{role.name}</p>
                          <Badge variant="neutral" size="sm">{role.code}</Badge>
                          {role.isSystem && <Badge variant="accent" size="sm">System</Badge>}
                        </div>
                        {role.description && <p className="text-xs text-sub mt-1">{role.description}</p>}
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {role.permissions.length === 0 ? (
                            <span className="text-[11px] text-sub italic">No permissions</span>
                          ) : role.permissions.map(code => (
                            <span key={code} className="jira-badge">{code}</span>
                          ))}
                        </div>
                      </div>
                      {canManageRoles && !role.isSystem && (
                        <Button variant="ghost" size="sm" icon={Trash2} onClick={() => handleDeleteRole(role)} />
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-surface rounded-xl border border-border overflow-hidden">
              <div className="p-5 border-b border-border">
                <h3 className="text-sm font-bold text-ink">Permission List</h3>
                <p className="text-xs text-sub mt-0.5">A total of <span className="font-mono">{permissions.length}</span> permissions, grouped by module.</p>
              </div>
              <div className="p-5 space-y-4">
                {Object.keys(permissionsByModule).length === 0 ? (
                  <p className="text-xs text-sub">No permission data yet.</p>
                ) : Object.entries(permissionsByModule).map(([mod, perms]) => (
                  <div key={mod}>
                    <p className="text-[10px] font-bold text-sub uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Tag className="w-3 h-3" /> {mod}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {perms.map(p => (
                        <span key={p.id} className="jira-badge" title={p.name}>{p.code}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </main>

      {/* CENTER MODAL CONFIRMATION DIALOG */}
      {modalConfig.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm">
          <div className="bg-surface rounded-2xl max-w-md w-full p-6 shadow-xl border border-border">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${modalConfig.type === 'delete' ? 'bg-danger-soft text-danger border border-danger/20' : 'bg-accent-soft text-accent border border-accent/20'}`}>
                  <AlertCircle className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-ink">{modalConfig.title}</h3>
              </div>
              <button onClick={() => setModalConfig({ ...modalConfig, isOpen: false })} className="p-1 text-sub hover:text-ink rounded-lg hover:bg-accent-soft transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-sub leading-relaxed mb-6">{modalConfig.message}</p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
              <Button variant="secondary" onClick={() => setModalConfig({ ...modalConfig, isOpen: false })}>{modalConfig.cancelText}</Button>
              <Button
                variant={modalConfig.type === 'delete' ? 'danger' : 'primary'}
                onClick={async () => {
                  try {
                    if (modalConfig.onConfirm) await modalConfig.onConfirm();
                  } catch (err) {
                    showToast(err?.response?.data?.message || 'An error occurred.', 'error');
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

      {/* CREATE ROLE MODAL */}
      {roleFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm">
          <form onSubmit={handleCreateRole} className="bg-surface rounded-2xl max-w-lg w-full p-6 shadow-xl border border-border max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-ink flex items-center gap-2"><ShieldPlus className="w-5 h-5 text-accent" /> Create New Role</h3>
              <button type="button" onClick={() => setRoleFormOpen(false)} className="p-1 text-sub hover:text-ink rounded-lg hover:bg-accent-soft transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="label-field">Role Name</label>
                <input required className="input-field" value={roleForm.name} onChange={e => setRoleForm({ ...roleForm, name: e.target.value })} placeholder="e.g. QA Tester" />
              </div>
              <div>
                <label className="label-field">Role Code</label>
                <input required className="input-field font-mono" value={roleForm.code} onChange={e => setRoleForm({ ...roleForm, code: e.target.value.toUpperCase() })} placeholder="e.g. QA_TESTER_CUSTOM" />
              </div>
              <div>
                <label className="label-field">Description</label>
                <input className="input-field" value={roleForm.description} onChange={e => setRoleForm({ ...roleForm, description: e.target.value })} placeholder="Short description of the role" />
              </div>
              <div>
                <label className="label-field">Permissions</label>
                <div className="border border-border rounded-lg p-3 space-y-3 max-h-56 overflow-y-auto bg-bg">
                  {Object.entries(permissionsByModule).map(([mod, perms]) => (
                    <div key={mod}>
                      <p className="text-[10px] font-bold text-sub uppercase tracking-wider mb-1.5">{mod}</p>
                      <div className="flex flex-wrap gap-2">
                        {perms.map(p => (
                          <label key={p.id} className={`flex items-center gap-1.5 px-2 py-1 rounded-md border text-[11px] font-semibold cursor-pointer transition-colors ${
                            roleForm.permissions.includes(p.code) ? 'bg-accent-soft border-accent/40 text-accent' : 'bg-surface border-border text-sub hover:bg-accent-soft/30'
                          }`}>
                            <input type="checkbox" className="hidden" checked={roleForm.permissions.includes(p.code)} onChange={() => togglePermissionInForm(p.code)} />
                            {p.code}
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                  {permissions.length === 0 && <p className="text-xs text-sub">No permissions available.</p>}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-5 mt-5 border-t border-border">
              <Button type="button" variant="secondary" onClick={() => setRoleFormOpen(false)}>Cancel</Button>
              <Button type="submit" variant="primary">Create Role</Button>
            </div>
          </form>
        </div>
      )}

      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />

    </div>
  );
}
