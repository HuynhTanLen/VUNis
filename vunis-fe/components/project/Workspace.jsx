import { useState } from 'react';
import KanbanBoard from './KanbanBoard';
import GanttChart from './GanttChart';
import VModelDiagram from './VModelDiagram';
import SpiralDiagram from './SpiralDiagram';
import SprintManager from './SprintManager';
import ProjectMembers from './ProjectMembers';
import { Calendar, Kanban, Award, BarChart3, GitBranch, Users, ChevronLeft } from 'lucide-react';

const STATUS_LABEL = { active: 'In Progress', paused: 'Paused', done: 'Completed' };

const STATUS_STYLE = {
  active: 'bg-accent-soft text-accent border-accent/20',
  paused: 'bg-warning-soft text-warning border-warning/20',
  done:   'bg-success-soft text-success border-success/20',
};

// Which project modules make sense for a given methodology:
// - Sprint/Backlog is a Scrum concept — doesn't apply to Waterfall/V-Model/Spiral/Kanban.
// - Timeline is model-aware: Waterfall & Scrum reuse the existing Gantt view (phase tree /
//   flat task list), V-Model and Spiral get a dedicated diagram, and pure Kanban has no
//   phases or gantt concept at all so the tab is dropped entirely.
const TIMELINE_BY_MODEL = {
  WATERFALL:    { label: 'Timeline', component: GanttChart },
  AGILE_SCRUM:  { label: 'Timeline', component: GanttChart },
  V_MODEL:      { label: 'V-Model', component: VModelDiagram },
  SPIRAL_MODEL: { label: 'Spiral', component: SpiralDiagram },
  KANBAN:       null,
};

export default function Workspace({ project, onBackToProjects }) {
  const [activeTab, setActiveTab] = useState('kanban');

  const isPM = project?.userRole === 'PROJECT_MANAGER' || project?.userRole === 'Project Manager';
  const modelType = project?.modelType || 'WATERFALL';
  const timeline = TIMELINE_BY_MODEL[modelType] ?? TIMELINE_BY_MODEL.WATERFALL;

  const tabs = [
    { id: 'kanban', label: 'Board', icon: Kanban },
    ...(modelType === 'AGILE_SCRUM' ? [{ id: 'sprints', label: 'Backlog (Sprint)', icon: Award }] : []),
    ...(timeline ? [{ id: 'gantt', label: timeline.label, icon: modelType === 'V_MODEL' || modelType === 'SPIRAL_MODEL' ? GitBranch : BarChart3 }] : []),
    { id: 'members', label: 'Members', icon: Users },
  ];

  const status = project.status || 'active';

  return (
    <article className="space-y-6 max-w-6xl mx-auto w-full px-4 py-6 md:px-8 md:py-10">

      <header className="bg-surface rounded-sm border-b border-border mb-4">
        <div className="px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4 min-w-0">
            <button
              onClick={onBackToProjects}
              className="p-1.5 hover:bg-bg rounded-md text-sub transition-colors shrink-0 cursor-pointer focus:outline-none"
              title="Back to projects list"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="min-w-0 space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-accent text-white flex items-center justify-center text-[10px] font-bold">PROJ</div>
                <h1 className="text-2xl font-semibold text-ink tracking-tight truncate leading-tight">{project.name}</h1>
              </div>
              <p className="text-base text-sub font-normal line-clamp-2 leading-relaxed">
                {project.description || 'No objective or scope provided for this project.'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 items-center md:self-center shrink-0">
            <span className={`text-[11px] uppercase font-bold px-2 py-0.5 rounded-sm ${STATUS_STYLE[status] || STATUS_STYLE.active}`}>
              {STATUS_LABEL[status] || 'In Progress'}
            </span>

            <div className="flex items-center gap-1.5 text-xs text-sub bg-bg px-2 py-1 rounded-sm">
              <Calendar className="w-3.5 h-3.5" />
              <span>
                {project.durationWeeks ? `${project.durationWeeks} weeks` : project.totalDays ? `${project.totalDays} days` : 'No duration set'}
                {project.endDate && ` · Kết thúc ${new Date(project.endDate).toLocaleDateString('en-US')}`}
              </span>
            </div>
          </div>
        </div>
      </header>

      <nav className="flex px-6 border-b border-border w-full gap-6" aria-label="Project Modules">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-3 text-sm font-medium transition-colors cursor-pointer focus:outline-none border-b-2 ${
                isActive
                  ? 'text-accent border-accent'
                  : 'text-sub hover:text-ink border-transparent'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      <section className="pt-1" aria-label="Module details">
        {activeTab === 'kanban' && <KanbanBoard projectId={project.id} project={project} />}
        {activeTab === 'sprints' && modelType === 'AGILE_SCRUM' && <SprintManager projectId={project.id} />}
        {activeTab === 'gantt' && timeline && (
          <timeline.component projectId={project.id} isPM={isPM} />
        )}
        {activeTab === 'members' && (
          <ProjectMembers projectId={project.id} project={project} />
        )}
      </section>
    </article>
  );
}
