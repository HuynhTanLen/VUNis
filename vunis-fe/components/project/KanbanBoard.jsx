import { useState, useEffect } from 'react';
import { getTasksByProject, createTask, updateTask, updateTaskStatus, deleteTask } from '../../services/taskService';
import { Kanban, Plus, Loader2, Pencil, Trash2, X, Check, CheckSquare, AlertCircle, Bookmark, CircleDot, Flame, ArrowUp, ArrowDown, Minus, Users, UserPlus } from 'lucide-react';
import { getProjectMembers, getGanttData } from '../../services/projectService';
import TaskDetailModal from './TaskDetailModal';
import { useAuth } from '../../hooks/useAuth';
import PriorityIcon from '../ui/PriorityIcon';
import IssueTypeIcon from '../ui/IssueTypeIcon';

const COLUMNS = [
  { id: 'TODO', label: 'TO DO', statusKeys: ['TODO', 'Todo', 'todo'], color: 'border-t-sub', badgeBg: 'bg-bg text-sub border border-border' },
  { id: 'IN_PROGRESS', label: 'IN PROGRESS', statusKeys: ['IN_PROGRESS', 'InProgress', 'in_progress'], color: 'border-t-accent', badgeBg: 'bg-accent-soft text-accent border border-accent/20' },
  { id: 'REVIEW', label: 'IN REVIEW', statusKeys: ['REVIEW', 'Review', 'review'], color: 'border-t-warning', badgeBg: 'bg-warning-soft text-warning border border-warning/20' },
  { id: 'DONE', label: 'DONE', statusKeys: ['DONE', 'Done', 'done'], color: 'border-t-success', badgeBg: 'bg-success-soft text-success border border-success/20' },
];

const PRIORITIES = [
  { value: 'urgent', label: 'Urgent', color: 'text-danger bg-danger-soft border-danger/20', icon: Flame },
  { value: 'high', label: 'High', color: 'text-warning bg-warning-soft border-warning/20', icon: ArrowUp },
  { value: 'medium', label: 'Medium', color: 'text-accent bg-accent-soft border-accent/20', icon: Minus },
  { value: 'low', label: 'Low', color: 'text-sub bg-bg border-border', icon: ArrowDown },
];

const ROLES = [
  'Developer',
  'Frontend Developer',
  'Backend Developer',
  'Fullstack Developer',
  'UI/UX Designer',
  'QA Tester',
  'Project Manager',
  'Business Analyst',
  'DevOps Engineer'
];

const EMPTY_TASK = { title: '', role: '', priority: 'medium', assigneeId: '', teamMemberIds: [], startDate: '', endDate: '', estimatedCost: '', phaseId: '' };

function TaskForm({ initial, userList, phases = [], onSubmit, onCancel, submitLabel = 'Save', title = 'Create Task', projectDateRange }) {
  const [form, setForm] = useState(initial || EMPTY_TASK);
  const [error, setError] = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await onSubmit(form);
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
    }
  };

  return (
    <div className="bg-surface rounded-xl border border-border p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-border pb-2.5">
        <h4 className="font-bold text-ink text-xs uppercase tracking-wider">{title}</h4>
        {projectDateRange && (
          <span className="text-[10px] text-warning font-mono bg-warning-soft border border-warning/20 rounded px-2 py-0.5 font-bold">
            ⏱ {projectDateRange}
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-danger-soft text-danger border border-danger/20 p-2.5 rounded-lg text-xs font-semibold">{error}</div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="label-field">Task Name *</label>
            <input placeholder="e.g.: Design Database Schema" required value={form.title}
              onChange={e => set('title', e.target.value)} className="input-field" />
          </div>

          <div className="space-y-1 md:col-span-2">
            <label className="label-field">Task Description</label>
            <textarea 
              placeholder="Enter detailed description for this task..." 
              value={form.description || ''}
              onChange={e => set('description', e.target.value)} 
              className="input-field min-h-[80px] resize-y" 
            />
          </div>

          <div className="space-y-1">
            <label className="label-field">Priority</label>
            <select value={form.priority || 'medium'} onChange={e => set('priority', e.target.value)} className="input-field">
              {PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </div>

          <div className="space-y-1">
            <label className="label-field">Role / Expertise</label>
            <select value={form.role} onChange={e => set('role', e.target.value)} className="input-field">
              <option value="">Select Role</option>
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <div className="space-y-1">
            <label className="label-field">Task Lead (Assignee) *</label>
            <select value={form.assigneeId} onChange={e => set('assigneeId', e.target.value)} className="input-field" required>
              {userList.length === 0
                ? <option value="">(No project members yet)</option>
                : userList.map(u => <option key={u.id || u.userId} value={u.userId || u.user?.id || u.id}>{u.name || u.user?.name || u.email} ({u.role || 'Member'})</option>)
              }
            </select>
          </div>

          {phases && phases.length > 0 && (
            <div className="space-y-1">
              <label className="label-field">Phase</label>
              <select 
                value={form.phaseId || ''} 
                onChange={e => {
                  const newPhaseId = e.target.value;
                  setForm(prev => {
                    const next = { ...prev, phaseId: newPhaseId };
                    if (newPhaseId) {
                      const selectedPhase = phases.find(p => p.id === newPhaseId);
                      if (selectedPhase) {
                        if (selectedPhase.startDate) {
                          next.startDate = new Date(selectedPhase.startDate).toISOString().split('T')[0];
                        }
                        if (selectedPhase.endDate) {
                          next.endDate = new Date(selectedPhase.endDate).toISOString().split('T')[0];
                        }
                      }
                    }
                    return next;
                  });
                }} 
                className="input-field"
              >
                <option value="">(Not in any Phase)</option>
                {phases.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          )}

          <div className="space-y-1">
            <label className="label-field">Estimated Cost (VND)</label>
            <input type="number" placeholder="e.g.: 5000000" value={form.estimatedCost}
              onChange={e => set('estimatedCost', e.target.value)} className="input-field font-mono" />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="label-field">Start Date</label>
              <input type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} className="input-field font-mono" />
            </div>
            <div className="space-y-1">
              <label className="label-field">End Date</label>
              <input type="date" value={form.endDate} onChange={e => set('endDate', e.target.value)} className="input-field font-mono" />
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-border space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold text-ink uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-accent" />
              Assign Task Team
            </label>
            <span className="text-[10px] text-sub font-mono bg-bg px-2 py-0.5 rounded border border-border">
              {(form.teamMemberIds?.length || 0) + (form.assigneeId ? 1 : 0)} members
            </span>
          </div>

          <p className="text-[10px] text-sub font-normal">
            Select team members to collaborate on this task:
          </p>

          <div className="flex flex-wrap gap-2 bg-bg p-3 rounded-xl border border-border max-h-32 overflow-y-auto">
            {userList.map(u => {
              const uId = u.id || u.userId;
              const isLead = uId === form.assigneeId;
              const isCoAssignee = form.teamMemberIds?.includes(uId);

              return (
                <button
                  type="button"
                  key={uId}
                  onClick={() => {
                    if (isLead) return;
                    const current = form.teamMemberIds || [];
                    const updated = isCoAssignee
                      ? current.filter(id => id !== uId)
                      : [...current, uId];
                    set('teamMemberIds', updated);
                  }}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 border transition-colors cursor-pointer ${
                    isLead
                      ? 'bg-accent-soft text-accent border-accent/40 font-extrabold cursor-default'
                      : isCoAssignee
                      ? 'bg-success-soft text-success border-success/40'
                      : 'bg-surface text-ink border-border hover:bg-accent-soft/50'
                  }`}
                >
                  <span className={`w-4 h-4 rounded-full text-white flex items-center justify-center text-[9px] font-bold ${
                    isLead ? 'bg-accent' : isCoAssignee ? 'bg-success' : 'bg-sub'
                  }`}>
                    {(u.name || u.email || 'U').charAt(0).toUpperCase()}
                  </span>
                  <span>{u.name || u.email}</span>
                  {isLead ? (
                    <span className="text-[9px] bg-accent text-white px-1 rounded font-bold">Lead</span>
                  ) : (
                    <span className="text-[10px] font-bold">{isCoAssignee ? '✓' : '+'}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex gap-2 pt-3 border-t border-border justify-end">
          <button type="button" onClick={onCancel} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn-primary">
            {submitLabel}
          </button>
        </div>
      </form>
    </div>
  );
}

function TaskTeamModal({ isOpen, onClose, task, userList, onSaveTaskTeam }) {
  const [assigneeId, setAssigneeId] = useState('');
  const [teamMemberIds, setTeamMemberIds] = useState([]);
  const [subtasks, setSubtasks] = useState([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [newSubtaskAssignee, setNewSubtaskAssignee] = useState('');

  useEffect(() => {
    if (task) {
      setAssigneeId(task.assigneeId || task.assignee?.id || '');
      setTeamMemberIds(task.teamMemberIds || []);
      setSubtasks(task.subtasks || []);
    }
  }, [task]);

  if (!isOpen || !task) return null;

  const handleToggleMember = (uId) => {
    if (uId === assigneeId) return;
    if (teamMemberIds.includes(uId)) {
      setTeamMemberIds(prev => prev.filter(id => id !== uId));
    } else {
      setTeamMemberIds(prev => [...prev, uId]);
    }
  };

  const handleAddSubtask = (e) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    setSubtasks(prev => [
      ...prev,
      {
        id: `st-${Date.now()}`,
        title: newSubtaskTitle.trim(),
        assigneeId: newSubtaskAssignee || assigneeId,
        completed: false
      }
    ]);
    setNewSubtaskTitle('');
  };

  const handleRemoveSubtask = (index) => {
    setSubtasks(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleToggleSubtask = (index) => {
    setSubtasks(prev => prev.map((st, idx) => idx === index ? { ...st, completed: !st.completed } : st));
  };

  const handleSave = () => {
    onSaveTaskTeam(task.id, {
      assigneeId,
      teamMemberIds,
      subtasks
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-surface rounded-xl border border-border p-5 max-w-lg w-full space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <span className="text-[10px] font-bold text-accent uppercase tracking-wider bg-accent-soft px-2 py-0.5 rounded border border-accent/20">
              Manage Task Team
            </span>
            <h3 className="font-bold text-ink text-sm mt-1 truncate max-w-sm">
              👥 {task.title}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-sub hover:text-ink rounded-lg cursor-pointer transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-1.5 bg-bg p-3 rounded-xl border border-border">
          <label className="text-[11px] font-bold text-ink uppercase tracking-wider flex items-center gap-1.5">
            👑 Task Lead (Assignee)
          </label>
          <select
            value={assigneeId}
            onChange={e => setAssigneeId(e.target.value)}
            className="input-field font-semibold"
          >
            {userList.map(u => (
              <option key={u.id || u.userId} value={u.id || u.userId}>
                👤 {u.name || u.user?.name || u.email} ({u.role || 'Member'})
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-[11px] font-bold text-ink uppercase tracking-wider flex items-center justify-between">
            <span>Collaborating Members (<span className="font-mono">{teamMemberIds.length + (assigneeId ? 1 : 0)}</span> members)</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto p-1">
            {userList.map(u => {
              const uId = u.id || u.userId;
              const isLead = uId === assigneeId;
              const isMember = teamMemberIds.includes(uId);

              return (
                <div
                  key={uId}
                  onClick={() => handleToggleMember(uId)}
                  className={`p-2 rounded-lg border flex items-center justify-between transition-colors cursor-pointer ${
                    isLead
                      ? 'bg-accent-soft border-accent/40 font-bold text-accent cursor-default'
                      : isMember
                      ? 'bg-success-soft border-success/40 font-bold text-success'
                      : 'bg-surface border-border text-ink hover:bg-accent-soft/30'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={`w-6 h-6 rounded-full text-white font-bold text-[10px] flex items-center justify-center shrink-0 ${
                      isLead ? 'bg-accent' : isMember ? 'bg-success' : 'bg-sub'
                    }`}>
                      {(u.name || u.email || 'U').charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs truncate">{u.name || u.email}</span>
                  </div>
                  <span className="text-[10px] shrink-0 font-bold">
                    {isLead ? <span className="bg-accent text-white px-1.5 py-0.5 rounded text-[9px]">Lead</span> : isMember ? '✓ Selected' : '+ Add'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-2 pt-2 border-t border-border">
          <label className="text-[11px] font-bold text-ink uppercase tracking-wider flex items-center gap-1">
            <CheckSquare className="w-3.5 h-3.5 text-accent" />
            Assign Subtasks (<span className="font-mono">{subtasks.length}</span>)
          </label>

          <form onSubmit={handleAddSubtask} className="flex gap-2">
            <input
              type="text"
              placeholder="e.g.: UI Design, Code API..."
              value={newSubtaskTitle}
              onChange={e => setNewSubtaskTitle(e.target.value)}
              className="flex-1 input-field"
            />
            <select
              value={newSubtaskAssignee}
              onChange={e => setNewSubtaskAssignee(e.target.value)}
              className="w-36 input-field"
            >
              {userList.map(u => (
                <option key={u.id || u.userId} value={u.id || u.userId}>
                  {u.name || u.email}
                </option>
              ))}
            </select>
            <button type="submit" className="btn-primary text-xs shrink-0">
              + Add
            </button>
          </form>

          <div className="max-h-28 overflow-y-auto space-y-1.5 pr-1">
            {subtasks.length === 0 ? (
              <p className="text-[11px] text-sub italic text-center py-2">No subtasks assigned yet</p>
            ) : (
              subtasks.map((st, idx) => {
                const assignedUser = userList.find(u => (u.id || u.userId) === st.assigneeId);
                return (
                  <div key={st.id || idx} className="flex items-center justify-between p-2 bg-bg border border-border rounded-lg text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <input
                        type="checkbox"
                        checked={st.completed}
                        onChange={() => handleToggleSubtask(idx)}
                        className="rounded text-accent focus:ring-accent/40 cursor-pointer"
                      />
                      <span className={`truncate font-semibold ${st.completed ? 'line-through text-sub' : 'text-ink'}`}>
                        {st.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] font-bold text-sub bg-surface border border-border px-1.5 py-0.5 rounded">
                        👤 {assignedUser?.name || 'Unassigned'}
                      </span>
                      <button onClick={() => handleRemoveSubtask(idx)} className="text-sub hover:text-danger transition-colors cursor-pointer">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-border">
          <button onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button onClick={handleSave} className="btn-primary">
            Save Team Changes
          </button>
        </div>

      </div>
    </div>
  );
}

export default function KanbanBoard({ projectId, project }) {
  const { user } = useAuth();
  const isPM = project?.userRole === 'PROJECT_MANAGER' || project?.userRole === 'Project Manager';
  const [tasks, setTasks] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [userList, setUserList] = useState([]);
  const [phases, setPhases] = useState([]);
  const [defaultAssignee, setDefaultAssignee] = useState('');
  const [taskTeamModal, setTaskTeamModal] = useState({ isOpen: false, task: null });
  const [taskDetailModal, setTaskDetailModal] = useState({ isOpen: false, task: null });

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [tasksData, usersData, ganttData] = await Promise.all([
          getTasksByProject(projectId),
          getProjectMembers(projectId),
          getGanttData(projectId).catch(() => null)
        ]);

        setTasks(tasksData);
        setUserList(usersData);
        if (ganttData && ganttData.phases) {
          setPhases(ganttData.phases);
        }
        if (usersData.length > 0) {
          setDefaultAssignee(usersData[0].id || usersData[0].userId);
        }
      } catch (err) {
        console.error('Error loading Kanban data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, [projectId]);

  const loadTasks = async () => {
    try {
      const data = await getTasksByProject(projectId);
      setTasks(data);
    } catch (err) {
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (form) => {
    await createTask({
      projectId,
      title: form.title,
      description: form.description,
      role: form.role,
      priority: form.priority,
      assigneeId: form.assigneeId || defaultAssignee,
      teamMemberIds: form.teamMemberIds || [],
      startDate: form.startDate || null,
      endDate: form.endDate || null,
      estimatedCost: form.estimatedCost !== '' ? Number(form.estimatedCost) : 0,
      phaseId: form.phaseId || null,
    });
    setShowCreateForm(false);
    loadTasks();
  };

  const handleEdit = async (form) => {
    await updateTask(editingTask.id, {
      projectId,
      title: form.title,
      description: form.description,
      role: form.role,
      priority: form.priority,
      assigneeId: form.assigneeId,
      teamMemberIds: form.teamMemberIds || [],
      startDate: form.startDate || null,
      endDate: form.endDate || null,
      estimatedCost: form.estimatedCost !== '' ? Number(form.estimatedCost) : 0,
      phaseId: form.phaseId || null,
    });
    setEditingTask(null);
    loadTasks();
  };

  const handleSaveTaskTeam = async (taskId, teamData) => {
    try {
      await updateTask(taskId, teamData);
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...teamData } : t));
      loadTasks();
    } catch (err) {
      console.error('Error saving task team:', err);
    }
  };

  const [deleteTaskModal, setDeleteTaskModal] = useState({ isOpen: false, taskId: null, taskTitle: '' });

  const handleDeleteClick = (task, e) => {
    if (e) e.stopPropagation();
    setDeleteTaskModal({
      isOpen: true,
      taskId: task.id,
      taskTitle: task.title
    });
  };

  const handleConfirmDeleteTask = async () => {
    if (!deleteTaskModal.taskId) return;
    try {
      await deleteTask(deleteTaskModal.taskId);
      setDeleteTaskModal({ isOpen: false, taskId: null, taskTitle: '' });
      loadTasks();
    } catch (err) {
      console.error('Error deleting task:', err);
      setDeleteTaskModal({ isOpen: false, taskId: null, taskTitle: '' });
    }
  };

  const handleMoveTask = async (taskId, newStatus) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    try {
      await updateTaskStatus(taskId, newStatus);
    } catch (err) {
      console.error('Error updating task:', err);
      loadTasks();
    }
  };

  const totalTasks = tasks.length;
  const doneTasks = tasks.filter(t => t.status === 'Done').length;
  const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const projectDateRange = project?.startDate && project?.endDate
    ? `${new Date(project.startDate).toLocaleDateString('en-US')} → ${new Date(project.endDate).toLocaleDateString('en-US')} (${project.totalDays} days)`
    : project?.totalDays ? `Total ${project.totalDays} days` : null;

  const editInitial = editingTask ? {
    title: editingTask.data.title || '',
    description: editingTask.data.description || '',
    role: editingTask.data.role || '',
    priority: editingTask.data.priority || 'medium',
    assigneeId: editingTask.data.assignee?.id || defaultAssignee,
    teamMemberIds: editingTask.data.teamMemberIds || [],
    startDate: editingTask.data.startDate ? new Date(editingTask.data.startDate).toISOString().split('T')[0] : '',
    endDate: editingTask.data.endDate ? new Date(editingTask.data.endDate).toISOString().split('T')[0] : '',
    estimatedCost: editingTask.data.estimatedCost || '',
    phaseId: editingTask.data.phaseId || '',
  } : null;

  return (
    <div className="space-y-6">
      {/* PROGRESS BAR */}
      {totalTasks > 0 && (
        <div className="card-clean p-4">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-sub uppercase tracking-wider">Delivery Progress</span>
              {project?.modelType && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-accent-soft text-accent border border-accent/20">
                  Model: {project.modelType}
                </span>
              )}
            </div>
            <span className="text-xs font-bold text-ink font-mono">{progress}% complete</span>
          </div>
          <div className="h-1.5 bg-bg rounded-full overflow-hidden">
            <div className="h-full bg-accent rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
          <div className="flex justify-between text-[10px] text-sub mt-2 font-semibold uppercase tracking-wider font-mono">
            <span>{doneTasks}/{totalTasks} tasks done</span>
            <span>{tasks.filter(t => t.status === 'InProgress').length} Active</span>
          </div>
        </div>
      )}

      {/* CONTROL ROW */}
      <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => { setShowCreateForm(!showCreateForm); setEditingTask(null); }}
            className="btn-primary flex-1 sm:flex-none"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Task
          </button>

          <input
            type="text"
            placeholder="Search tasks..."
            className="input-field w-52"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />

          <select
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value)}
            className="input-field w-auto cursor-pointer"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {COLUMNS.map(col => (
            <div key={col.id} className={`px-2 py-0.5 rounded-md font-mono ${col.badgeBg}`}>
              {tasks.filter(t => t.status === col.id).length} {col.label}
            </div>
          ))}
        </div>
      </div>

      {/* CREATE FORM */}
      {showCreateForm && !editingTask && (
        <TaskForm
          initial={{ ...EMPTY_TASK, assigneeId: defaultAssignee }}
          userList={userList}
          phases={phases}
          onSubmit={handleCreate}
          onCancel={() => setShowCreateForm(false)}
          submitLabel="Create"
          title="Create New Task"
          projectDateRange={projectDateRange}
        />
      )}

      {/* EDIT FORM */}
      {editingTask && (
        <TaskForm
          initial={editInitial}
          userList={userList}
          phases={phases}
          onSubmit={handleEdit}
          onCancel={() => setEditingTask(null)}
          submitLabel="Update"
          title={`Edit: ${editingTask.data.title}`}
          projectDateRange={projectDateRange}
        />
      )}

      {/* KANBAN COLUMNS */}
      {loading ? (
        <div className="bg-surface rounded-xl border border-border p-20 flex flex-col items-center justify-center">
          <Loader2 className="w-6 h-6 text-accent animate-spin mb-2" />
          <p className="text-sub text-xs font-semibold">Updating board...</p>
        </div>
      ) : (
        <div className="flex overflow-x-auto snap-x snap-mandatory md:grid md:grid-cols-4 gap-3.5 pb-2 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0">
          {COLUMNS.map((col) => {
            const colTasks = tasks.filter(t => {
              const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase());
              const matchesPriority = priorityFilter === 'all' || (t.priority || 'medium') === priorityFilter;
              const matchesStatus = col.statusKeys.includes(t.status) || t.status === col.id;
              return matchesStatus && matchesSearch && matchesPriority;
            });

            return (
              <div key={col.id} className={`min-w-[280px] w-[80vw] md:w-auto md:min-w-0 snap-center bg-bg/60 rounded-lg min-h-[500px] flex flex-col flex-shrink-0 md:flex-shrink`}>
                <div className="px-3 py-3 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sub text-sm uppercase tracking-wider">{col.label}</span>
                    <span className="text-sm font-semibold text-sub bg-border/40 px-1.5 rounded">{colTasks.length}</span>
                  </div>
                </div>

                <div className="p-2 space-y-2.5 flex-1 overflow-y-auto max-h-[calc(100vh-280px)] min-h-[150px]">
                  {colTasks.length === 0 ? (
                    <div className="h-28 border border-dashed border-border rounded-lg flex items-center justify-center text-sub text-sm font-semibold">
                      No tasks
                    </div>
                  ) : (
                    colTasks.map((task) => {
                      const priority = task.priority || 'medium';
                      const type = task.type || 'task';
                      const assigneeName = task.assignee?.name || 'Unassigned';
                      const assigneeInitial = assigneeName.charAt(0).toUpperCase();
                      const subtaskCount = task.subtasks?.length || 0;
                      const completedSubtasks = task.subtasks?.filter(s => s.completed || s.done).length || 0;
                      const issueKey = task.key || `VU-${(task.id || '').toString().slice(-4).toUpperCase() || '101'}`;

                      const coAssigneeIds = task.teamMemberIds || [];
                      const coAssignees = userList.filter(u => coAssigneeIds.includes(u.id || u.userId) && (u.id || u.userId) !== task.assigneeId);
                      const totalTeamCount = 1 + coAssignees.length;

                      return (
                        <div
                          key={task.id}
                          onClick={() => setTaskDetailModal({ isOpen: true, task })}
                          className="jira-card p-3 group space-y-3"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="font-semibold text-ink text-sm leading-snug group-hover:text-accent-hover transition-colors line-clamp-2">
                              {task.title}
                            </h4>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={(e) => { e.stopPropagation(); setEditingTask({ id: task.id, data: task }); setShowCreateForm(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                className="p-1 rounded text-sub hover:text-ink hover:bg-accent-soft transition-colors"
                                title="Edit Task"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={(e) => handleDeleteClick(task, e)}
                                className="p-1 rounded text-sub hover:text-danger hover:bg-danger-soft transition-colors"
                                title="Delete Task"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <div className="flex items-center justify-between mt-3 text-xs text-sub font-medium">
                            <div className="flex items-center gap-1.5">
                              <IssueTypeIcon type={type} className="w-3.5 h-3.5" />
                              <span className="text-[11px] hover:underline cursor-pointer">{issueKey}</span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              {subtaskCount > 0 && (
                                <span className="inline-flex items-center gap-1 bg-surface px-1.5 rounded">
                                  <CheckSquare className="w-3.5 h-3.5" />
                                  <span className="text-[10px]">{completedSubtasks}/{subtaskCount}</span>
                                </span>
                              )}
                              <PriorityIcon priority={priority} className="w-4 h-4" />
                              <div className="w-6 h-6 rounded-full bg-accent text-white font-bold text-[10px] flex items-center justify-center shrink-0 shadow-sm" title={`Assignee: ${assigneeName}`}>
                                {assigneeInitial}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    }))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteTaskModal.isOpen && (
        <div className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-xl border border-border p-5 max-w-sm w-full space-y-4 shadow-xl">
            <h4 className="font-bold text-ink text-sm">Confirm Task Deletion</h4>
            <p className="text-xs text-sub">
              Are you sure you want to delete <span className="font-bold text-ink">"{deleteTaskModal.taskTitle}"</span>?
            </p>
            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => setDeleteTaskModal({ isOpen: false, taskId: null, taskTitle: '' })}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteTask}
                className="btn-danger"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TASK TEAM MANAGEMENT MODAL */}
      <TaskTeamModal
        isOpen={taskTeamModal.isOpen}
        task={taskTeamModal.task}
        userList={userList}
        onClose={() => setTaskTeamModal({ isOpen: false, task: null })}
        onSaveTaskTeam={handleSaveTaskTeam}
      />

      {/* TASK DETAIL MODAL (NEW SCREEN 6) */}
      <TaskDetailModal
        isOpen={taskDetailModal.isOpen}
        task={taskDetailModal.task}
        userList={userList}
        isPM={isPM}
        projectId={project?.id}
        onClose={() => setTaskDetailModal({ isOpen: false, task: null })}
        onTaskUpdated={loadTasks}
      />
    </div>
  );
}
