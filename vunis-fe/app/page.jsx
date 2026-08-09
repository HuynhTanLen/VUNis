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

/** Inner content of sidebar - shared for desktop and mobile overlay */
function SidebarContent({ user, selectedProject, sidebarProjects, showProjectList, setShowProjectList, onBackToDashboard, onSelectProject, onCloseSidebar, onLogout }) {
  return (
    <>
      <nav className="p-3 space-y-1 shrink-0" aria-label="Main Menu">
        <button
          onClick={onBackToDashboard}
          className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
            !selectedProject ? 'bg-accent-soft text-accent' : 'text-sub hover:bg-accent-soft hover:text-ink'
          }`}
        >
          <LayoutDashboard className={`w-5 h-5 shrink-0 ${!selectedProject ? 'text-accent' : 'text-sub'}`} />
          <span>Project Overview</span>
        </button>

        <Link
          href="/profile"
          onClick={onCloseSidebar}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-semibold text-sub hover:bg-accent-soft hover:text-ink transition-colors"
        >
          <User className="w-5 h-5 shrink-0 text-sub" />
          <span>My Profile</span>
        </Link>

        {['SUPER_ADMIN', 'USER_ADMIN', 'admin', 'super_admin'].includes(user.role?.name || user.role || '') && (
          <Link
            href="/admin"
            onClick={onCloseSidebar}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-semibold text-accent bg-accent-soft border border-accent/20 hover:bg-accent-soft/80 transition-colors"
          >
            <ShieldAlert className="w-5 h-5 shrink-0 text-accent" />
            <span>Admin Console</span>
          </Link>
        )}
      </nav>

      <section className="flex-1 overflow-y-auto px-3 py-2 space-y-1.5 border-t border-border" aria-label="My Projects">
        <button
          onClick={() => setShowProjectList(!showProjectList)}
          className="w-full flex items-center justify-between px-2.5 py-2 hover:bg-accent-soft rounded-lg text-xs font-bold text-sub tracking-wider uppercase transition-colors"
          aria-expanded={showProjectList}
        >
          <span className="flex items-center gap-1.5">
            <Folder className="w-4 h-4 text-sub" />
            My Projects (<span className="font-mono">{sidebarProjects.length}</span>)
          </span>
          <ChevronRight className={`w-4 h-4 text-sub transition-transform duration-200 ${showProjectList ? 'rotate-90' : ''}`} />
        </button>

        {showProjectList && (
          <nav className="space-y-0.5" aria-label="Personal Projects">
            {sidebarProjects.length === 0 ? (
              <p className="text-left text-xs text-sub py-2 pl-3 font-normal">No projects yet</p>
            ) : (
              sidebarProjects.map(p => {
                const status = p.status || 'active';
                const isActive = selectedProject?.id === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => onSelectProject(p)}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2.5 text-left rounded-lg transition-colors ${
                      isActive ? 'bg-accent-soft text-accent font-semibold' : 'text-sub hover:bg-accent-soft hover:text-ink'
                    }`}
                  >
                    <div className={`w-2 h-2 rounded-full shrink-0 ${STATUS_DOT[status] || 'bg-sub'}`} />
                    <span className="text-sm truncate flex-1">{p.name}</span>
                    {isActive && <ChevronRight className="w-4 h-4 text-accent shrink-0" />}
                  </button>
                );
              })
            )}
          </nav>
        )}
      </section>

      <footer className="p-3 border-t border-border space-y-2 shrink-0 bg-surface">
        <div className="flex items-center gap-2.5 p-2 bg-bg border border-border rounded-lg">
          <div className="w-10 h-10 rounded-lg bg-accent text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-sm">
            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="truncate min-w-0 flex-1">
            <p className="text-sm font-semibold text-ink truncate leading-tight">{user.name}</p>
            <p className="text-xs text-sub truncate mt-0.5">{user.email}</p>
          </div>
        </div>
        <button onClick={onLogout} className="btn-danger w-full flex items-center justify-center gap-1.5 py-2 text-sm">
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </footer>
    </>
  );
}

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
          <p className="text-sub text-sm font-medium">Loading workspace...</p>
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

  const sidebarProps = {
    user,
    selectedProject,
    sidebarProjects,
    showProjectList,
    setShowProjectList,
    onBackToDashboard: handleBackToDashboard,
    onSelectProject: handleSelectProject,
    onCloseSidebar: closeSidebar,
    onLogout: logout,
  };

  return (
    // App shell: fixed 100vh, flex row, no full-page scroll
    <div className="h-[100dvh] bg-bg text-ink font-sans antialiased flex overflow-hidden">

      {/* ====== DESKTOP SIDEBAR: always takes space in flex row, not fixed ====== */}
      <aside className="hidden md:flex md:flex-col md:w-72 md:shrink-0 bg-surface border-r border-border overflow-hidden">
        <header className="p-4 flex items-center gap-3 border-b border-border shrink-0">
          <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center text-white font-extrabold text-sm shadow-sm">VU</div>
          <div>
            <h1 className="text-ink font-bold text-sm leading-none">VUNIS</h1>
            <span className="text-xs text-sub font-medium uppercase tracking-wider mt-1 block">Enterprise Workspace</span>
          </div>
        </header>
        <SidebarContent {...sidebarProps} />
      </aside>

      {/* ====== MOBILE SIDEBAR OVERLAY: fixed, shown only when sidebarOpen ====== */}
      {sidebarOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 bg-ink/40 z-40 md:hidden" onClick={closeSidebar} />
          {/* Drawer */}
          <aside className="fixed inset-y-0 left-0 z-50 w-72 bg-surface border-r border-border flex flex-col shadow-2xl md:hidden">
            <header className="p-4 flex items-center justify-between border-b border-border shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center text-white font-extrabold text-sm shadow-sm">VU</div>
                <div>
                  <h1 className="text-ink font-bold text-sm leading-none">VUNIS</h1>
                  <span className="text-xs text-sub font-medium uppercase tracking-wider mt-1 block">Enterprise Workspace</span>
                </div>
              </div>
              <button onClick={closeSidebar} className="p-1.5 rounded-lg hover:bg-accent-soft text-sub transition-colors" aria-label="Close navigation">
                <X className="w-5 h-5" />
              </button>
            </header>
            <SidebarContent {...sidebarProps} />
          </aside>
        </>
      )}

      {/* ====== MAIN CONTENT: scrolls independently ====== */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="shrink-0 flex items-center justify-between gap-3 px-6 py-3 bg-surface border-b border-border z-30">
          <div className="flex items-center gap-4 min-w-0">
            {/* Mobile sidebar toggle */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 rounded-lg hover:bg-accent-soft text-ink border border-border transition-colors focus:outline-none"
              aria-label="Open navigation"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-sub font-medium text-sm hidden sm:inline">Projects /</span>
              <span className="text-sm font-bold text-ink truncate">
                {selectedProject ? selectedProject.name : 'VUNIS Workspace'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <div className="hidden lg:flex items-center bg-bg border border-border rounded-md px-3 py-1.5 w-64 hover:bg-accent-soft transition-colors cursor-pointer">
              <span className="text-sub text-xs">Search (Ctrl+K)</span>
            </div>
            <NotificationPopover onProjectApproved={loadSidebarProjects} />
          </div>
        </header>

        <section className="flex-1 overflow-y-auto min-h-0" aria-label="Main Content">
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
