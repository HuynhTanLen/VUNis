// Reading this as: Project Management Workspace for team collaborators, with a calm, high-density light minimalist language, leaning toward Tailwind UI + Geist/Outfit + fluid glassmorphism accents.
// DESIGN_VARIANCE: 5, MOTION_INTENSITY: 4, VISUAL_DENSITY: 7

import { useState } from 'react';
import KanbanBoard from './KanbanBoard';
import GanttChart from './GanttChart';
import SprintManager from './SprintManager';
import ProjectMembers from './ProjectMembers';
import { Calendar, ShieldCheck, Kanban, Award, BarChart3, Users, ChevronLeft } from 'lucide-react';

const STATUS_LABEL = { active: 'Đang thực hiện', paused: 'Tạm dừng', done: 'Hoàn thành' };

const STATUS_STYLE = {
  active: 'bg-indigo-50 text-indigo-700 border-indigo-100',
  paused: 'bg-amber-50 text-amber-700 border-amber-100',
  done:   'bg-emerald-50 text-emerald-700 border-emerald-100',
};

const STATUS_DOT = {
  active: 'bg-indigo-500',
  paused: 'bg-amber-500',
  done:   'bg-emerald-500',
};

export default function Workspace({ project, onBackToProjects }) {
  const [activeTab, setActiveTab] = useState('kanban');

  const tabs = [
    { id: 'kanban', label: 'Bảng Kanban', icon: Kanban },
    { id: 'sprints', label: 'Quản lý Sprint', icon: Award },
    { id: 'gantt',  label: 'Biểu đồ Gantt', icon: BarChart3 },
    { id: 'members', label: 'Thành viên', icon: Users },
  ];

  const status = project.status || 'active';
  const hasBudget = project.budget !== undefined && project.budget !== null;

  return (
    <article className="space-y-6 max-w-6xl mx-auto w-full px-4 py-6 md:px-8 md:py-10">
      
      {/* WORKSPACE HEADER */}
      <header className="bg-white rounded-xl border-2 border-slate-300 shadow-sm relative overflow-hidden">
        {/* Top status bar indicator */}
        <div className={`h-1.5 w-full ${STATUS_DOT[status] || STATUS_DOT.active}`} />
        
        <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5 min-w-0">
            <button
              onClick={onBackToProjects}
              className="p-2 bg-slate-100 hover:bg-slate-200 border-2 border-slate-300 rounded-lg text-slate-700 transition-colors shrink-0 cursor-pointer"
              title="Quay lại danh sách dự án"
            >
              <ChevronLeft className="w-4 h-4 text-slate-800 font-bold" />
            </button>
            <div className="min-w-0 space-y-1">
              <h1 className="text-lg font-bold text-slate-900 tracking-tight truncate leading-tight">{project.name}</h1>
              <p className="text-xs text-slate-500 font-normal line-clamp-2 leading-relaxed">
                {project.description || 'Chưa cập nhật mục tiêu và phạm vi công việc của dự án này.'}
              </p>
            </div>
          </div>

          {/* Project metadata badges */}
          <div className="flex flex-wrap gap-2 items-center md:self-center shrink-0">
            <span className={`text-xs font-bold px-3 py-1 rounded-md border-2 ${
              status === 'active' ? 'bg-indigo-50 text-indigo-800 border-indigo-300' :
              status === 'paused' ? 'bg-amber-50 text-amber-800 border-amber-300' : 'bg-emerald-50 text-emerald-800 border-emerald-300'
            }`}>
              ● {STATUS_LABEL[status] || 'Đang thực hiện'}
            </span>
            
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-100 border-2 border-slate-300 px-3 py-1 rounded-md">
              <Calendar className="w-3.5 h-3.5 text-slate-500" /> 
              <span>
                {project.durationWeeks ? `${project.durationWeeks} tuần (${project.totalDays || project.durationWeeks * 7} ngày)` : project.totalDays ? `${project.totalDays} ngày` : 'Chưa đặt thời gian'}
              </span>
            </div>

            {hasBudget && (
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 bg-slate-100 border-2 border-slate-300 px-3 py-1 rounded-md">
                <span>{Number(project.budget).toLocaleString()} đ</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* TAB NAVIGATION */}
      <nav className="flex bg-slate-100 p-1.5 rounded-xl border-2 border-slate-300 w-full sm:w-fit overflow-x-auto gap-1" aria-label="Phân hệ dự án">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-white text-indigo-900 border-2 border-indigo-300 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 border-2 border-transparent'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-500'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* ACTIVE TAB COMPONENT CONTAINER */}
      <section className="pt-1" aria-label="Chi tiết phân hệ">
        {activeTab === 'kanban' && <KanbanBoard projectId={project.id} project={project} />}
        {activeTab === 'sprints' && <SprintManager projectId={project.id} />}
        {activeTab === 'gantt'  && <GanttChart  projectId={project.id} />}
        {activeTab === 'members' && (
          <ProjectMembers projectId={project.id} projectOwnerId={project.owner?.id || project.owner} />
        )}
      </section>
    </article>
  );
}
