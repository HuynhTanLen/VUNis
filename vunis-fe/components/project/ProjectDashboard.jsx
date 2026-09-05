import { useState, useEffect } from 'react';
import { getProjects, createProject, delProject, updProject } from '../../services/projectService';
import Toast from '../ui/Toast';
import {
  FolderPlus, Trash2, Loader2, Clock, Layers, Filter, Pencil
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const STATUS_OPTIONS = [
  { code: 'active',  label: 'In Progress' },
  { code: 'paused',  label: 'Paused' },
  { code: 'done',    label: 'Completed' },
];

const STATUS_LABEL = { active: 'In Progress', paused: 'Paused', done: 'Completed' };

const MODEL_LABEL = {
  WATERFALL: 'Waterfall',
  AGILE_SCRUM: 'Agile / Scrum',
  KANBAN: 'Kanban',
  V_MODEL: 'V-Model',
  SPIRAL_MODEL: 'Spiral',
};

export default function ProjectDashboard({ onSelectProject }) {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [filter, setFilter] = useState('all');

  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    budget: '',
    durationWeeks: '',
    durationUnit: 'weeks',
    startDate: new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0],
    priority: 'Medium',
    modelType: 'WATERFALL'
  });

  const [editProject, setEditProject] = useState(null);
  const [editDurationUnit, setEditDurationUnit] = useState('weeks');

  useEffect(() => { loadProjects(); }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadProjects = async () => {
    setLoading(true);
    try {
      const data = await getProjects();
      setProjects(data);
    } catch (err) {
      console.error('Error loading projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const convertWeeksToDurationAndUnit = (weeks) => {
    if (!weeks) return { duration: '', unit: 'weeks' };
    const totalDays = Math.round(Number(weeks) * 7);

    if (totalDays % 90 === 0 && totalDays > 0) return { duration: totalDays / 90, unit: 'quarters' };
    if (totalDays % 30 === 0 && totalDays > 0) return { duration: totalDays / 30, unit: 'months' };
    if (totalDays % 7 === 0 && totalDays > 0) return { duration: totalDays / 7, unit: 'weeks' };
    return { duration: totalDays, unit: 'days' };
  };

  const handleStartEdit = (project) => {
    const { duration, unit } = convertWeeksToDurationAndUnit(project.durationWeeks);
    setEditDurationUnit(unit);
    setEditProject({ id: project.id, data: { ...project, durationWeeks: duration } });
    setShowForm(false);
  };

  const formatDuration = (weeks) => {
    if (!weeks) return 'No duration set';
    const totalDays = Math.round(Number(weeks) * 7);
    if (totalDays < 7) return `${totalDays} days`;
    if (totalDays % 30 === 0) return `${totalDays / 30} months`;
    if (totalDays % 7 === 0) return `${totalDays / 7} weeks`;
    return `${totalDays} days`;
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createProject({
        name: newProject.name,
        description: newProject.description,
        budget: typeof newProject.budget === 'number' ? newProject.budget : 0,
        durationWeeks: newProject.durationWeeks
          ? (
              newProject.durationUnit === 'weeks' ? Number(newProject.durationWeeks) :
              newProject.durationUnit === 'days' ? Number(newProject.durationWeeks) / 7 :
              newProject.durationUnit === 'months' ? (Number(newProject.durationWeeks) * 30) / 7 :
              (Number(newProject.durationWeeks) * 90) / 7
            )
          : 4,
        startDate: newProject.startDate || undefined,
        priority: newProject.priority || 'Medium',
        modelType: newProject.modelType || 'WATERFALL'
      });
      setNewProject({
        name: '', description: '', budget: 0, durationWeeks: '', durationUnit: 'weeks',
        startDate: new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0],
        priority: 'Medium', modelType: 'WATERFALL'
      });
      setShowForm(false);
      loadProjects();
      showToast('Project created successfully! You are assigned as PM.');
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to create project!', 'error');
    }
  };

  const handleUpdateProject = async (e) => {
    e.preventDefault();
    try {
      await updProject(editProject.id, {
        name: editProject.data.name,
        description: editProject.data.description,
        budget: typeof editProject.data.budget === 'number' ? editProject.data.budget : 0,
        durationWeeks: editProject.data.durationWeeks
          ? (
              editDurationUnit === 'weeks' ? Number(editProject.data.durationWeeks) :
              editDurationUnit === 'days' ? Number(editProject.data.durationWeeks) / 7 :
              editDurationUnit === 'months' ? (Number(editProject.data.durationWeeks) * 30) / 7 :
              (Number(editProject.data.durationWeeks) * 90) / 7
            )
          : undefined,
        startDate: editProject.data.startDate || undefined,
        priority: editProject.data.priority,
        status: editProject.data.status,
        modelType: editProject.data.modelType
      });
      setEditProject(null);
      loadProjects();
      showToast('Project updated successfully!');
    } catch (err) {
      showToast(err?.response?.data?.message || 'Update failed!', 'error');
    }
  };

  const [deleteProjectModal, setDeleteProjectModal] = useState({ isOpen: false, projectId: null, projectName: '' });

  const handleDelClick = (project, e) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    setDeleteProjectModal({ isOpen: true, projectId: project.id, projectName: project.name });
  };

  const handleConfirmDeleteProject = async () => {
    if (!deleteProjectModal.projectId) return;
    try {
      await delProject(deleteProjectModal.projectId);
      setDeleteProjectModal({ isOpen: false, projectId: null, projectName: '' });
      loadProjects();
      showToast('Project deleted successfully.');
    } catch (err) {
      showToast('Failed to delete project!', 'error');
      setDeleteProjectModal({ isOpen: false, projectId: null, projectName: '' });
    }
  };

  const handleUpdateStatus = async (projectId, newStatus) => {
    try {
      await updProject(projectId, { status: newStatus });
      setProjects(prev => prev.map(p => p.id === projectId ? { ...p, status: newStatus } : p));
      showToast(`Status updated: ${STATUS_LABEL[newStatus] || newStatus}`);
    } catch (err) {
      showToast('Failed to update status: ' + (err?.response?.data?.message || err.message), 'error');
    }
  };

  const handleUpdatePriority = async (projectId, newPriority) => {
    try {
      await updProject(projectId, { priority: newPriority });
      setProjects(prev => prev.map(p => p.id === projectId ? { ...p, priority: newPriority } : p));
      showToast('Priority updated.');
    } catch (err) {
      showToast('Failed to update priority: ' + (err?.response?.data?.message || err.message), 'error');
    }
  };

  const normalizeStatus = (rawStatus) => {
    if (!rawStatus) return 'active';
    const s = rawStatus.toString().toLowerCase();
    if (s === 'active' || s === 'on_going' || s === 'in_progress') return 'active';
    if (s === 'paused' || s === 'on_hold' || s === 'pending') return 'paused';
    if (s === 'done' || s === 'completed' || s === 'finished') return 'done';
    return 'active';
  };

  const countActive = projects.filter(p => normalizeStatus(p.status) === 'active').length;
  const countPaused = projects.filter(p => normalizeStatus(p.status) === 'paused').length;
  const countDone   = projects.filter(p => normalizeStatus(p.status) === 'done').length;

  const filteredProjects = filter === 'all' ? projects : projects.filter(p => normalizeStatus(p.status) === filter);

  return (
    <section className="space-y-5 max-w-6xl mx-auto w-full px-4 py-6 md:px-8 md:py-8" aria-labelledby="dashboard-title">

      {/* HEADER */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 id="dashboard-title" className="text-xl font-bold text-ink tracking-tight">Projects & Workspaces</h1>
          <p className="text-sm text-sub mt-0.5">Track progress, budget, and task distribution across projects.</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setEditProject(null); }} className="btn-primary w-full sm:w-auto">
          <FolderPlus className="w-4 h-4" /> Create New Project
        </button>
      </header>

      {/* BENTO GRID METRICS */}
      <section aria-label="Project Status Indicators" className="grid grid-cols-1 md:grid-cols-3 gap-4">

        <div
          onClick={() => setFilter(filter === 'active' ? 'all' : 'active')}
          className={`md:col-span-2 bg-surface rounded-xl border p-5 transition-colors cursor-pointer flex flex-col justify-between ${
            filter === 'active' ? 'border-accent ring-1 ring-accent/30' : 'border-border hover:border-accent/40'
          }`}
        >
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[11px] font-bold text-sub uppercase tracking-wider">Progress Overview</span>
              <div className="flex items-baseline gap-3 mt-1">
                <span className="text-3xl font-extrabold text-ink font-mono">{projects.length}</span>
                <span className="text-sm text-sub">total projects</span>
              </div>
            </div>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-accent-soft text-accent border border-accent/20">
              Active: <strong className="font-mono ml-1">{countActive}</strong>
            </span>
          </div>

          <div className="mt-5 space-y-2">
            <div className="flex justify-between text-xs font-medium text-sub">
              <span>Status Distribution</span>
              <span className="font-mono">{projects.length > 0 ? Math.round((countActive / projects.length) * 100) : 0}% in progress</span>
            </div>
            <div className="h-2 bg-bg rounded-full overflow-hidden flex">
              <div className="bg-accent h-full transition-all duration-300" style={{ width: `${projects.length > 0 ? (countActive / projects.length) * 100 : 0}%` }} title="In Progress" />
              <div className="bg-warning h-full transition-all duration-300" style={{ width: `${projects.length > 0 ? (countPaused / projects.length) * 100 : 0}%` }} title="Paused" />
              <div className="bg-success h-full transition-all duration-300" style={{ width: `${projects.length > 0 ? (countDone / projects.length) * 100 : 0}%` }} title="Completed" />
            </div>
          </div>
        </div>

        <div className="space-y-3 flex flex-col justify-between">
          <div
            onClick={() => setFilter(filter === 'paused' ? 'all' : 'paused')}
            className={`bg-surface rounded-xl border p-4 transition-colors cursor-pointer flex items-center justify-between ${
              filter === 'paused' ? 'border-warning ring-1 ring-warning/30' : 'border-border hover:border-warning/40'
            }`}
          >
            <div>
              <span className="text-[11px] font-bold text-sub uppercase tracking-wider">Paused</span>
              <h3 className="text-xl font-bold text-warning font-mono mt-0.5">{loading ? '...' : countPaused}</h3>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-warning-soft text-warning border border-warning/20">Needs Review</span>
          </div>

          <div
            onClick={() => setFilter(filter === 'done' ? 'all' : 'done')}
            className={`bg-surface rounded-xl border p-4 transition-colors cursor-pointer flex items-center justify-between ${
              filter === 'done' ? 'border-success ring-1 ring-success/30' : 'border-border hover:border-success/40'
            }`}
          >
            <div>
              <span className="text-[11px] font-bold text-sub uppercase tracking-wider">Completed</span>
              <h3 className="text-xl font-bold text-success font-mono mt-0.5">{loading ? '...' : countDone}</h3>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-success-soft text-success border border-success/20">Delivered</span>
          </div>
        </div>
      </section>

      {/* CREATE FORM */}
      {showForm && (
        <section aria-label="Project Creation Form" className="bg-surface rounded-xl border border-border p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h2 className="font-bold text-ink text-xs uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent" /> Create New Project
            </h2>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-accent-soft text-accent border border-accent/20">You will be the PM</span>
          </div>

          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-1">
              <label className="label-field">Project Name *</label>
              <input placeholder="e.g., Mobile App Upgrade" required value={newProject.name}
                onChange={(e) => setNewProject({ ...newProject, name: e.target.value })} className="input-field font-semibold" />
            </div>

            <div className="space-y-1">
              <label className="label-field">Project Objective & Description</label>
              <textarea placeholder="Briefly describe the objective and scope of the project..." value={newProject.description} rows={2}
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })} className="input-field resize-none leading-relaxed" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="label-field">Duration</label>
                <div className="flex gap-2">
                  <input type="number" min={1} max={260} placeholder="Amount..." value={newProject.durationWeeks}
                    onChange={(e) => setNewProject({ ...newProject, durationWeeks: e.target.value })} className="flex-1 input-field font-mono" />
                  <select value={newProject.durationUnit} onChange={(e) => setNewProject({ ...newProject, durationUnit: e.target.value })}
                    className="px-3 py-2 bg-bg border border-border rounded-lg text-xs text-ink font-semibold focus:outline-none focus:border-accent">
                    <option value="days">Days</option>
                    <option value="weeks">Weeks</option>
                    <option value="months">Months</option>
                    <option value="quarters">Quarters</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="label-field">Estimated Start Date</label>
                <input type="date" value={newProject.startDate} onChange={(e) => setNewProject({ ...newProject, startDate: e.target.value })} className="input-field font-mono" />
              </div>

              <div className="space-y-1">
                <label className="label-field">Priority</label>
                <select value={newProject.priority} onChange={(e) => setNewProject({ ...newProject, priority: e.target.value })} className="input-field font-semibold">
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="label-field">Management Model</label>
                <select value={newProject.modelType} onChange={(e) => setNewProject({ ...newProject, modelType: e.target.value })} className="input-field font-semibold">
                  {Object.entries(MODEL_LABEL).map(([code, label]) => <option key={code} value={code}>{label}</option>)}
                </select>
              </div>
            </div>

            <div className="flex gap-2.5 pt-4 border-t border-border">
              <button type="submit" className="btn-primary">Create Project</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </section>
      )}

      {/* EDIT FORM */}
      {editProject && (
        <section aria-label="Edit Project Form" className="bg-surface rounded-xl border border-warning/30 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h2 className="font-bold text-ink text-xs uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-warning" /> Edit: {editProject.data.name}
            </h2>
            <button onClick={() => setEditProject(null)} className="text-sub hover:text-ink text-xs font-bold transition-colors">✕ Close</button>
          </div>
          <form onSubmit={handleUpdateProject} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="label-field">Project Name *</label>
                <input required value={editProject.data.name}
                  onChange={e => setEditProject(p => ({ ...p, data: { ...p.data, name: e.target.value } }))} className="input-field font-semibold" />
              </div>
              <div className="space-y-1">
                <label className="label-field">Management Model</label>
                <select value={editProject.data.modelType || 'WATERFALL'}
                  onChange={e => setEditProject(p => ({ ...p, data: { ...p.data, modelType: e.target.value } }))} className="input-field font-semibold">
                  {Object.entries(MODEL_LABEL).map(([code, label]) => <option key={code} value={code}>{label}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="label-field">Duration</label>
                <div className="flex gap-2">
                  <input type="number" min={1} max={260} value={editProject.data.durationWeeks || ''}
                    onChange={e => setEditProject(p => ({ ...p, data: { ...p.data, durationWeeks: e.target.value } }))} className="flex-1 input-field font-mono" />
                  <select value={editDurationUnit} onChange={(e) => setEditDurationUnit(e.target.value)}
                    className="px-3 py-2 bg-bg border border-border rounded-lg text-xs text-ink font-semibold focus:outline-none focus:border-accent">
                    <option value="days">Days</option>
                    <option value="weeks">Weeks</option>
                    <option value="months">Months</option>
                    <option value="quarters">Quarters</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="label-field">Start Date</label>
                <input type="date" value={editProject.data.startDate ? new Date(editProject.data.startDate).toISOString().split('T')[0] : ''}
                  onChange={e => setEditProject(p => ({ ...p, data: { ...p.data, startDate: e.target.value } }))} className="input-field font-mono" />
              </div>
              <div className="space-y-1">
                <label className="label-field">Priority</label>
                <select value={editProject.data.priority || 'Medium'}
                  onChange={e => setEditProject(p => ({ ...p, data: { ...p.data, priority: e.target.value } }))} className="input-field font-semibold">
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="label-field">Status</label>
                <select value={editProject.data.status || 'active'}
                  onChange={e => setEditProject(p => ({ ...p, data: { ...p.data, status: e.target.value } }))} className="input-field font-semibold">
                  <option value="active">In Progress</option>
                  <option value="paused">Paused</option>
                  <option value="done">Completed</option>
                </select>
              </div>
            </div>
            <div className="space-y-1">
              <label className="label-field">Description</label>
              <textarea rows={2} value={editProject.data.description || ''}
                onChange={e => setEditProject(p => ({ ...p, data: { ...p.data, description: e.target.value } }))} className="input-field resize-none leading-relaxed" />
            </div>
            <div className="flex gap-2.5 pt-4 border-t border-border">
              <button type="submit" className="btn-primary">Update Project</button>
              <button type="button" onClick={() => setEditProject(null)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </section>
      )}

      {/* FILTER BAR */}
      <nav className="flex items-center gap-3 flex-wrap" aria-label="Project Filter">
        <span className="text-xs font-semibold text-sub uppercase tracking-wider flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" /> Filter:
        </span>
        <div className="flex bg-bg p-1 rounded-lg border border-border">
          <button onClick={() => setFilter('all')} className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${filter === 'all' ? 'bg-surface text-accent' : 'text-sub hover:text-ink'}`}>
            All
          </button>
          {STATUS_OPTIONS.map(({ code, label }) => (
            <button key={code} onClick={() => setFilter(code)} className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${filter === code ? 'bg-surface text-accent' : 'text-sub hover:text-ink'}`}>
              {label}
            </button>
          ))}
        </div>
        <span className="ml-auto text-xs text-sub font-mono">{filteredProjects.length} projects</span>
      </nav>

      {/* PROJECTS GRID */}
      {loading ? (
        <div className="text-center py-16 bg-surface rounded-xl border border-border">
          <Loader2 className="w-6 h-6 text-accent animate-spin mx-auto mb-3" />
          <p className="text-sub text-xs font-bold tracking-wider uppercase">Syncing project data...</p>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-xl bg-surface">
          <Layers className="w-8 h-8 text-sub/50 mx-auto mb-3" />
          <p className="text-ink font-bold text-sm">No projects found</p>
          <p className="text-sub text-xs mt-1">Click "Create New Project" to get started.</p>
        </div>
      ) : (
        <section aria-label="List of Projects" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project) => {
            const status = (project.status || 'active').toLowerCase();
            const priority = (project.priority || 'medium').toLowerCase();

            return (
              <article
                key={project.id}
                onClick={() => onSelectProject(project)}
                className="bg-surface rounded-xl border border-border p-5 hover:border-accent transition-colors duration-150 cursor-pointer group relative flex flex-col justify-between space-y-3 min-h-[200px]"
              >
                <div className="flex items-start justify-between gap-3 pb-2.5 border-b border-border">
                  <h3 className="text-base font-bold text-ink group-hover:text-accent transition-colors truncate flex-1 min-w-0">
                    {project.name}
                  </h3>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 bg-surface border border-border rounded-lg p-0.5">
                    <button onClick={(e) => { e.stopPropagation(); handleStartEdit(project); }} className="p-1 text-sub hover:text-warning hover:bg-warning-soft rounded transition-colors" title="Edit">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelClick(project, e); }} className="p-1 text-sub hover:text-danger hover:bg-danger-soft rounded transition-colors" title="Delete">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-sub text-sm line-clamp-2 leading-relaxed min-h-[36px]">
                  {project.description || 'No project description provided yet.'}
                </p>

                <div className="flex items-center justify-between gap-2 py-2 border-t border-b border-border" onClick={(e) => e.stopPropagation()}>
                  {(() => {
                    const ownerId = project.owner && typeof project.owner === 'object' ? project.owner.id : project.owner;
                    const isPM = project.userRole === 'PROJECT_MANAGER' || project.userRole === 'Project Manager' || (ownerId && user && ownerId.toString() === user.id?.toString());
                    const normalizedPriority = (priority === 'high' || priority === 'urgent') ? 'High' : priority === 'low' ? 'Low' : 'Medium';
                    const normalizedStatus = (status === 'paused' || status === 'on_hold') ? 'paused' : (status === 'done' || status === 'completed') ? 'done' : 'active';

                    return (
                      <>
                        <select value={normalizedPriority} onChange={(e) => isPM && handleUpdatePriority(project.id, e.target.value)} disabled={!isPM}
                          className={`text-xs font-bold px-2.5 py-1 rounded-md border cursor-pointer transition-colors outline-none appearance-none ${
                            normalizedPriority === 'High' ? 'text-danger bg-danger-soft border-danger/20' :
                            normalizedPriority === 'Low' ? 'text-sub bg-bg border-border' : 'text-warning bg-warning-soft border-warning/20'
                          }`}>
                          <option value="High">High Priority</option>
                          <option value="Medium">Medium Priority</option>
                          <option value="Low">Low Priority</option>
                        </select>

                        <select value={normalizedStatus} onChange={(e) => isPM && handleUpdateStatus(project.id, e.target.value)} disabled={!isPM}
                          className={`text-xs font-bold px-2.5 py-1 rounded-md border cursor-pointer transition-colors outline-none appearance-none ${
                            normalizedStatus === 'paused' ? 'text-warning bg-warning-soft border-warning/20' :
                            normalizedStatus === 'done' ? 'text-success bg-success-soft border-success/20' : 'text-accent bg-accent-soft border-accent/20'
                          }`}>
                          <option value="active">In Progress</option>
                          <option value="paused">Paused</option>
                          <option value="done">Completed</option>
                        </select>
                      </>
                    );
                  })()}
                </div>

                <div className="flex items-center justify-between pt-2.5 border-t border-border text-xs text-sub font-medium">
                  <div className="flex items-center gap-1.5 font-mono">
                    <Clock className="w-3.5 h-3.5 text-sub" />
                    <span>{formatDuration(project.durationWeeks)}</span>
                  </div>
                  <div className="flex items-center gap-1 text-ink font-semibold">
                    {MODEL_LABEL[project.modelType] || project.modelType || 'Waterfall'}
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteProjectModal.isOpen && (
        <div className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl border border-border shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-danger-soft text-danger border border-danger/20 shrink-0">
                <Trash2 className="w-5 h-5 text-danger" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-ink">Confirm Project Deletion</h3>
                <p className="text-xs text-sub mt-1 leading-relaxed">
                  Are you sure you want to delete the project "{deleteProjectModal.projectName}"? This action will permanently remove all related tasks and data.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
              <button onClick={() => setDeleteProjectModal({ isOpen: false, projectId: null, projectName: '' })} className="btn-secondary text-xs px-4 py-2">Cancel</button>
              <button onClick={handleConfirmDeleteProject} className="btn-danger text-xs px-4 py-2">Delete Permanently</button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </section>
  );
}
