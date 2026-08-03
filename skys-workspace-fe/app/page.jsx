'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import Login from '../components/auth/Login';
import Register from '../components/auth/Register';
import ForgotPassword from '../components/auth/ForgotPassword';
import ProjectDashboard from '../components/project/ProjectDashboard';
import Workspace from '../components/project/Workspace';
import NotificationPopover from '../components/ui/NotificationPopover';
import { LayoutDashboard, User, ShieldAlert, LogOut, ChevronRight, Folder, Menu, X, Bell } from 'lucide-react';
import Link from 'next/link';
import { getProjects } from '../services/projectService';

const STATUS_DOT = {
  active: 'bg-accent',
  paused: 'bg-warning',
  done:   'bg-success',
};

export default function Home() {
  const { user, loading, logout } = useAuth();
  const [currentScreen, setCurrentScreen] = useState('login');
  const [selectedProject, setSelectedProject] = useState(null);
  const [sidebarProjects, setSidebarProjects] = useState([]);
  const [showProjectList, setShowProjectList] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setSelectedProject(null);
    if (user) { loadSidebarProjects(); }
  }, [user]);

  const closeSidebar = () => setSidebarOpen(false);

  const loadSidebarProjects = async () => {
    try {
      const data = await getProjects();
      setSidebarProjects(data);
    } catch { /* ignore */ }
  };

  const handleBackToDashboard = () => {
    setSelectedProject(null);
    closeSidebar();
  };

  const handleSelectProject = (project) => {
    setSelectedProject(project);
    closeSidebar();
  };

  if (loading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-bg">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-accent border-t-transparent mx-auto"></div>
          <p className="text-sub text-xs font-medium">Đang tải không gian...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    if (currentScreen === 'login') {
      return (
        <Login 
          onSwitchToRegister={() => setCurrentScreen('register')} 
          onSwitchToForgotPassword={() => setCurrentScreen('forgot-password')} 
        />
      );
    } else if (currentScreen === 'register') {
      return <Register onSwitchToLogin={() => setCurrentScreen('login')} />;
    } else if (currentScreen === 'forgot-password') {
      return <ForgotPassword onSwitchToLogin={() => setCurrentScreen('login')} />;
    }
  }

  return (
    <div className="min-h-[100dvh] bg-bg text-ink flex font-sans antialiased overflow-hidden">
      
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-ink/30 z-40 md:hidden"
          onClick={closeSidebar}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-surface border-r border-border flex flex-col h-screen shrink-0
        transform transition-transform duration-200 ease-out shadow-sm
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:sticky md:top-0 md:h-screen md:translate-x-0 md:w-60 md:z-auto
      `}>
        <header className="p-4 flex items-center justify-between border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-white font-extrabold text-xs shadow-sm">
              KS
            </div>
            <div>
              <h1 className="text-ink font-bold text-xs leading-none">KS Platform</h1>
              <span className="text-[10px] text-sub font-medium uppercase tracking-wider">Enterprise Workspace</span>
            </div>
          </div>
          <button
            onClick={closeSidebar}
            className="md:hidden p-1.5 rounded-lg hover:bg-accent-soft text-sub transition-colors focus:outline-none focus:ring-2 focus:ring-accent/20"
            aria-label="Đóng thanh điều hướng"
          >
            <X className="w-4 h-4" />
          </button>
        </header>

        <nav className="p-3 space-y-1 shrink-0" aria-label="Menu chính">
          <button
            onClick={handleBackToDashboard}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
              !selectedProject
                ? 'bg-accent-soft text-accent'
                : 'text-sub hover:bg-accent-soft hover:text-ink'
            }`}
          >
            <LayoutDashboard className={`w-4 h-4 shrink-0 ${!selectedProject ? 'text-accent' : 'text-sub'}`} />
            <span>Tổng quan dự án</span>
          </button>

          <Link 
            href="/profile"
            onClick={closeSidebar}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-sub hover:bg-accent-soft hover:text-ink transition-colors"
          >
            <User className="w-4 h-4 shrink-0 text-sub" />
            <span>Hồ sơ cá nhân</span>
          </Link>

          {['SUPER_ADMIN', 'USER_ADMIN', 'admin', 'super_admin'].includes(user.role?.name || user.role || '') && (
            <Link 
              href="/admin"
              onClick={closeSidebar}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-accent bg-accent-soft border border-accent/20 hover:bg-accent-soft/80 transition-colors"
            >
              <ShieldAlert className="w-4 h-4 shrink-0 text-accent" />
              <span>Trang Quản trị Admin</span>
            </Link>
          )}
        </nav>

        <section className="flex-1 overflow-y-auto px-3 py-2 space-y-1.5 border-t border-border" aria-label="Danh sách dự án của tôi">
          <button
            onClick={() => setShowProjectList(!showProjectList)}
            className="w-full flex items-center justify-between px-2.5 py-1.5 hover:bg-accent-soft rounded-lg text-[10px] font-bold text-sub tracking-wider uppercase transition-colors"
            aria-expanded={showProjectList}
          >
            <span className="flex items-center gap-1.5">
              <Folder className="w-3.5 h-3.5 text-sub" />
              Dự án của tôi (<span className="font-mono">{sidebarProjects.length}</span>)
            </span>
            <ChevronRight className={`w-3 h-3 text-sub transition-transform duration-200 ${showProjectList ? 'rotate-90' : ''}`} />
          </button>

          {showProjectList && (
            <nav className="space-y-0.5" aria-label="Dự án cá nhân">
              {sidebarProjects.length === 0 ? (
                <p className="text-left text-[10px] text-sub py-2 pl-3 font-normal">Chưa có dự án nào</p>
              ) : (
                sidebarProjects.map(p => {
                  const status = p.status || 'active';
                  const isActive = selectedProject?.id === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => handleSelectProject(p)}
                      className={`w-full flex items-center gap-2 px-2.5 py-2 text-left rounded-lg transition-colors ${
                        isActive 
                          ? 'bg-accent-soft text-accent font-semibold' 
                          : 'text-sub hover:bg-accent-soft hover:text-ink'
                      }`}
                    >
                      <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${STATUS_DOT[status] || 'bg-sub'}`} />
                      <span className="text-xs truncate flex-1">
                        {p.name}
                      </span>
                      {isActive && <ChevronRight className="w-3 h-3 text-accent shrink-0" />}
                    </button>
                  );
                })
              )}
            </nav>
          )}
        </section>

        <footer className="p-3 border-t border-border space-y-2 shrink-0 bg-surface">
          <div className="flex items-center gap-2.5 p-2 bg-bg border border-border rounded-lg">
            <div className="w-8 h-8 rounded-lg bg-accent text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="truncate min-w-0 flex-1">
              <p className="text-xs font-semibold text-ink truncate leading-tight">{user.name}</p>
              <p className="text-[10px] text-sub truncate mt-0.5">{user.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="btn-danger w-full flex items-center justify-center gap-1.5 py-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            Đăng xuất
          </button>
        </footer>
      </aside>

      <main className="flex-1 overflow-y-auto min-w-0 flex flex-col">
        {/* TOP HEADER BAR (Mobile & Desktop) */}
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 px-4 py-3 bg-surface border-b border-border shadow-xs">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 rounded-lg hover:bg-accent-soft text-ink border border-border transition-colors focus:outline-none focus:ring-2 focus:ring-accent/20"
              aria-label="Mở thanh điều hướng"
            >
              <Menu className="w-4 h-4" />
            </button>
            
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs font-bold text-ink truncate">
                {selectedProject ? selectedProject.name : 'Không gian làm việc Skys'}
              </span>
            </div>
          </div>

          {/* Right Header Controls: Notification Button */}
          <div className="flex items-center gap-3 shrink-0">
            <NotificationPopover onProjectApproved={() => loadSidebarProjects()} />
          </div>
        </header>

        <section className="flex-1 flex flex-col min-w-0 overflow-y-auto" aria-label="Nội dung chính">
          {!selectedProject ? (
            <ProjectDashboard
              onSelectProject={handleSelectProject}
              onProjectCreated={loadSidebarProjects}
            />
          ) : (
            <Workspace
              project={selectedProject}
              onBackToProjects={handleBackToDashboard}
            />
          )}
        </section>
      </main>

    </div>
  );
}
