import { useState } from 'react';
import KanbanBoard from './KanbanBoard';
import GanttChart from './GanttChart';
import SprintManager from './SprintManager';
import ProjectMembers from './ProjectMembers';
import { Calendar, Kanban, Award, BarChart3, Users, ChevronLeft } from 'lucide-react';

const STATUS_LABEL = { active: 'Đang thực hiện', paused: 'Tạm dừng', done: 'Hoàn thành' };

const STATUS_STYLE = {
  active: 'bg-accent-soft text-accent border-accent/20',
  paused: 'bg-warning-soft text-warning border-warning/20',
  done:   'bg-success-soft text-success border-success/20',
};

const STATUS_BAR = {
  active: 'bg-accent',
  paused: 'bg-warning',
  done:   'bg-success',
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
      
      <header className="bg-surface rounded-xl border border-border shadow-sm relative overflow-hidden">
        <div className={`h-1.5 w-full ${STATUS_BAR[status] || STATUS_BAR.active}`} />
        
        <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5 min-w-0">
            <button
              onClick={onBackToProjects}
              className="p-2 bg-accent-soft hover:bg-accent-soft/80 border border-border rounded-lg text-ink transition-colors shrink-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent/40"
              title="Quay lại danh sách dự án"
            >
              <ChevronLeft className="w-4 h-4 text-ink font-bold" />
            </button>
            <div className="min-w-0 space-y-1">
              <h1 className="text-lg font-bold text-ink tracking-tight truncate leading-tight">{project.name}</h1>
              <p className="text-xs text-sub font-normal line-clamp-2 leading-relaxed">
                {project.description || 'Chưa cập nhật mục tiêu và phạm vi công việc của dự án này.'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 items-center md:self-center shrink-0">
            <span className={`text-xs font-bold px-3 py-1 rounded-md border ${STATUS_STYLE[status] || STATUS_STYLE.active}`}>
              {STATUS_LABEL[status] || 'Đang thực hiện'}
            </span>
            
            <div className="flex items-center gap-1.5 text-xs font-bold text-ink bg-bg border border-border px-3 py-1 rounded-md">
              <Calendar className="w-3.5 h-3.5 text-sub" /> 
              <span className="font-mono">
                {project.durationWeeks ? `${project.durationWeeks} tuần (${project.totalDays || project.durationWeeks * 7} ngày)` : project.totalDays ? `${project.totalDays} ngày` : 'Chưa đặt thời gian'}
              </span>
            </div>

            {hasBudget && (
              <div className="flex items-center gap-1.5 text-xs font-bold text-ink bg-bg border border-border px-3 py-1 rounded-md">
                <span className="font-mono">{Number(project.budget).toLocaleString()} đ</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <nav className="flex bg-bg p-1.5 rounded-xl border border-border w-full sm:w-fit overflow-x-auto gap-1" aria-label="Phân hệ dự án">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-colors whitespace-nowrap cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent/40 ${
                isActive
                  ? 'bg-surface text-accent border border-accent/30 shadow-sm'
                  : 'text-sub hover:text-ink hover:bg-accent-soft border border-transparent'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-accent' : 'text-sub'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      <section className="pt-1" aria-label="Chi tiết phân hệ">
        {activeTab === 'kanban' && <KanbanBoard projectId={project.id} project={project} />}
        {activeTab === 'sprints' && <SprintManager projectId={project.id} />}
        {activeTab === 'gantt'  && <GanttChart  projectId={project.id} />}
        {activeTab === 'members' && (
          <ProjectMembers projectId={project.id} project={project} />
        )}
      </section>
    </article>
  );
}
