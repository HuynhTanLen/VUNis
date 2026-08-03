import { useState, useEffect } from 'react';
import { getTasksByProject, createTask, updateTask, updateTaskStatus, deleteTask } from '../../services/taskService';
import { Kanban, Plus, Loader2, Pencil, Trash2, X, Check, CheckSquare, AlertCircle, Bookmark, CircleDot, Flame, ArrowUp, ArrowDown, Minus, Users, UserPlus } from 'lucide-react';
import { getProjectMembers } from '../../services/projectService';
import TaskDetailModal from './TaskDetailModal';

const COLUMNS = [
  { id: 'TODO', label: 'TO DO', statusKeys: ['TODO', 'Todo', 'todo'], color: 'border-t-sub', badgeBg: 'bg-bg text-sub border border-border' },
  { id: 'IN_PROGRESS', label: 'IN PROGRESS', statusKeys: ['IN_PROGRESS', 'InProgress', 'in_progress'], color: 'border-t-accent', badgeBg: 'bg-accent-soft text-accent border border-accent/20' },
  { id: 'REVIEW', label: 'IN REVIEW', statusKeys: ['REVIEW', 'Review', 'review'], color: 'border-t-warning', badgeBg: 'bg-warning-soft text-warning border border-warning/20' },
  { id: 'DONE', label: 'DONE', statusKeys: ['DONE', 'Done', 'done'], color: 'border-t-success', badgeBg: 'bg-success-soft text-success border border-success/20' },
];

const PRIORITIES = [
  { value: 'urgent', label: 'Khẩn cấp', color: 'text-danger bg-danger-soft border-danger/20', icon: Flame },
  { value: 'high', label: 'Cao', color: 'text-warning bg-warning-soft border-warning/20', icon: ArrowUp },
  { value: 'medium', label: 'Trung bình', color: 'text-accent bg-accent-soft border-accent/20', icon: Minus },
  { value: 'low', label: 'Thấp', color: 'text-sub bg-bg border-border', icon: ArrowDown },
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

const EMPTY_TASK = { title: '', role: '', priority: 'medium', assigneeId: '', teamMemberIds: [], startDate: '', endDate: '', estimatedCost: '' };

function TaskForm({ initial, userList, onSubmit, onCancel, submitLabel = 'Lưu', title = 'Khởi tạo công việc', projectDateRange }) {
  const [form, setForm] = useState(initial || EMPTY_TASK);
  const [error, setError] = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await onSubmit(form);
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra');
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
            <label className="label-field">Tên nhiệm vụ *</label>
            <input placeholder="VD: Thiết kế mô hình cơ sở dữ liệu" required value={form.title}
              onChange={e => set('title', e.target.value)} className="input-field" />
          </div>

          <div className="space-y-1">
            <label className="label-field">Độ ưu tiên</label>
            <select value={form.priority || 'medium'} onChange={e => set('priority', e.target.value)} className="input-field">
              {PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </div>

          <div className="space-y-1">
            <label className="label-field">Vai trò chuyên môn</label>
            <select value={form.role} onChange={e => set('role', e.target.value)} className="input-field">
              <option value="">Chọn vai trò</option>
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <div className="space-y-1">
            <label className="label-field">Trưởng nhóm nhiệm vụ (Main Lead) *</label>
            <select value={form.assigneeId} onChange={e => set('assigneeId', e.target.value)} className="input-field" required>
              {userList.length === 0
                ? <option value="">(Chưa có thành viên dự án)</option>
                : userList.map(u => <option key={u.id || u.userId} value={u.userId || u.user?.id || u.id}>{u.name || u.user?.name || u.email} ({u.role || 'Member'})</option>)
              }
            </select>
          </div>

          <div className="space-y-1">
            <label className="label-field">Chi phí ước tính (VND)</label>
            <input type="number" placeholder="VD: 5000000" value={form.estimatedCost}
              onChange={e => set('estimatedCost', e.target.value)} className="input-field font-mono" />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="label-field">Ngày bắt đầu</label>
              <input type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} className="input-field font-mono" />
            </div>
            <div className="space-y-1">
              <label className="label-field">Ngày kết thúc</label>
              <input type="date" value={form.endDate} onChange={e => set('endDate', e.target.value)} className="input-field font-mono" />
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-border space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold text-ink uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-accent" />
              Phân công Nhóm thực hiện Nhiệm vụ này
            </label>
            <span className="text-[10px] text-sub font-mono bg-bg px-2 py-0.5 rounded border border-border">
              {(form.teamMemberIds?.length || 0) + (form.assigneeId ? 1 : 0)} người tham gia
            </span>
          </div>

          <p className="text-[10px] text-sub font-normal">
            Chọn các thành viên phối hợp cùng thực hiện công việc này:
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
                    <span className="text-[9px] bg-accent text-white px-1 rounded font-bold">Trưởng nhóm</span>
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
            Hủy
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
              Quản lý Nhóm Nhiệm Vụ
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
            👑 Trưởng nhóm phụ trách chính (Main Lead)
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
            <span>Thành viên phối hợp trong nhóm (<span className="font-mono">{teamMemberIds.length + (assigneeId ? 1 : 0)}</span> người)</span>
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
                    {isLead ? <span className="bg-accent text-white px-1.5 py-0.5 rounded text-[9px]">Trưởng nhóm</span> : isMember ? '✓ Đã chọn' : '+ Thêm'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-2 pt-2 border-t border-border">
          <label className="text-[11px] font-bold text-ink uppercase tracking-wider flex items-center gap-1">
            <CheckSquare className="w-3.5 h-3.5 text-accent" />
            Phân công công việc nhỏ trong nhóm (<span className="font-mono">{subtasks.length}</span>)
          </label>

          <form onSubmit={handleAddSubtask} className="flex gap-2">
            <input
              type="text"
              placeholder="VD: Thiết kế UI, Code API..."
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
              + Thêm
            </button>
          </form>

          <div className="max-h-28 overflow-y-auto space-y-1.5 pr-1">
            {subtasks.length === 0 ? (
              <p className="text-[11px] text-sub italic text-center py-2">Chưa có công việc con nào được giao cho nhóm</p>
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
                        👤 {assignedUser?.name || 'Chưa gán'}
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
            Hủy
          </button>
          <button onClick={handleSave} className="btn-primary">
            Lưu thay đổi nhóm
          </button>
        </div>

      </div>
    </div>
  );
}

export default function KanbanBoard({ projectId, project }) {
  const [tasks, setTasks] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [userList, setUserList] = useState([]);
  const [defaultAssignee, setDefaultAssignee] = useState('');
  const [taskTeamModal, setTaskTeamModal] = useState({ isOpen: false, task: null });
  const [taskDetailModal, setTaskDetailModal] = useState({ isOpen: false, task: null });

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [tasksData, usersData] = await Promise.all([
          getTasksByProject(projectId),
          getProjectMembers(projectId)
        ]);

        setTasks(tasksData);
        setUserList(usersData);
        if (usersData.length > 0) {
          setDefaultAssignee(usersData[0].id || usersData[0].userId);
        }
      } catch (err) {
        console.error('Lỗi tải dữ liệu Kanban:', err);
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
      console.error('Lỗi lấy task:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (form) => {
    await createTask({ ...form, projectId, assigneeId: form.assigneeId || defaultAssignee });
    setShowCreateForm(false);
    loadTasks();
  };

  const handleEdit = async (form) => {
    await updateTask(editingTask.id, {
      title: form.title,
      role: form.role,
      priority: form.priority,
      assigneeId: form.assigneeId,
      teamMemberIds: form.teamMemberIds || [],
      startDate: form.startDate || null,
      endDate: form.endDate || null,
      estimatedCost: form.estimatedCost !== '' ? Number(form.estimatedCost) : 0,
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
      console.error('Lỗi lưu nhóm nhiệm vụ:', err);
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
      console.error('Lỗi xóa công việc:', err);
      setDeleteTaskModal({ isOpen: false, taskId: null, taskTitle: '' });
    }
  };

  const handleMoveTask = async (taskId, newStatus) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    try {
      await updateTaskStatus(taskId, newStatus);
    } catch (err) {
      console.error('Lỗi cập nhật:', err);
      loadTasks();
    }
  };

  const totalTasks = tasks.length;
  const doneTasks = tasks.filter(t => t.status === 'Done').length;
  const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const projectDateRange = project?.startDate && project?.endDate
    ? `${new Date(project.startDate).toLocaleDateString('vi-VN')} → ${new Date(project.endDate).toLocaleDateString('vi-VN')} (${project.totalDays} ngày)`
    : project?.totalDays ? `Tổng ${project.totalDays} ngày` : null;

  const editInitial = editingTask ? {
    title: editingTask.data.title || '',
    role: editingTask.data.role || '',
    priority: editingTask.data.priority || 'medium',
    assigneeId: editingTask.data.assignee?.id || defaultAssignee,
    teamMemberIds: editingTask.data.teamMemberIds || [],
    startDate: editingTask.data.startDate ? new Date(editingTask.data.startDate).toISOString().split('T')[0] : '',
    endDate: editingTask.data.endDate ? new Date(editingTask.data.endDate).toISOString().split('T')[0] : '',
    estimatedCost: editingTask.data.estimatedCost || '',
  } : null;

  return (
    <div className="space-y-6">
      {/* PROGRESS BAR */}
      {totalTasks > 0 && (
        <div className="card-clean p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[11px] font-bold text-sub uppercase tracking-wider">Tiến trình bàn giao</span>
            <span className="text-xs font-bold text-ink font-mono">{progress}% hoàn thành</span>
          </div>
          <div className="h-1.5 bg-bg rounded-full overflow-hidden">
            <div className="h-full bg-accent rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
          <div className="flex justify-between text-[10px] text-sub mt-2 font-semibold uppercase tracking-wider font-mono">
            <span>{doneTasks}/{totalTasks} công việc xong</span>
            <span>{tasks.filter(t => t.status === 'InProgress').length} Đang chạy</span>
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
            Thêm nhiệm vụ
          </button>

          <input
            type="text"
            placeholder="Tìm kiếm công việc..."
            className="input-field w-52"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />

          <select
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value)}
            className="input-field w-auto cursor-pointer"
          >
            <option value="all">Tất cả độ ưu tiên</option>
            <option value="urgent">Khẩn cấp</option>
            <option value="high">Cao</option>
            <option value="medium">Trung bình</option>
            <option value="low">Thấp</option>
          </select>
        </div>

        <div className="flex items-center gap-2 text-[10px] font-bold overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
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
          onSubmit={handleCreate}
          onCancel={() => setShowCreateForm(false)}
          submitLabel="Khởi tạo"
          title="Khởi tạo công việc"
          projectDateRange={projectDateRange}
        />
      )}

      {/* EDIT FORM */}
      {editingTask && (
        <TaskForm
          initial={editInitial}
          userList={userList}
          onSubmit={handleEdit}
          onCancel={() => setEditingTask(null)}
          submitLabel="Cập nhật"
          title={`Chỉnh sửa: ${editingTask.data.title}`}
          projectDateRange={projectDateRange}
        />
      )}

      {/* KANBAN COLUMNS */}
      {loading ? (
        <div className="bg-surface rounded-xl border border-border p-20 flex flex-col items-center justify-center">
          <Loader2 className="w-6 h-6 text-accent animate-spin mb-2" />
          <p className="text-sub text-xs font-semibold">Đang cập nhật bảng công việc...</p>
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
              <div key={col.id} className={`min-w-[260px] w-[80vw] md:w-auto md:min-w-0 snap-center bg-bg/50 rounded-xl border border-border border-t-2 ${col.color} min-h-[420px] flex flex-col flex-shrink-0 md:flex-shrink`}>
                <div className="px-3.5 py-2.5 bg-surface border-b border-border flex items-center justify-between shrink-0 rounded-t-xl">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-ink text-xs uppercase tracking-wider">{col.label}</span>
                    <span className={`text-[11px] font-bold font-mono px-2 py-0.5 rounded-full ${col.badgeBg}`}>{colTasks.length}</span>
                  </div>
                </div>

                <div className="p-2 space-y-2.5 flex-1 overflow-y-auto max-h-[calc(100vh-280px)] min-h-[150px]">
                  {colTasks.length === 0 ? (
                    <div className="h-28 border border-dashed border-border rounded-lg flex items-center justify-center text-sub text-xs font-semibold">
                      Chưa có nhiệm vụ
                    </div>
                  ) : (
                    colTasks.map((task) => {
                      const priorityObj = PRIORITIES.find(p => p.value === (task.priority || 'medium')) || PRIORITIES[2];
                      const PriorityIcon = priorityObj.icon;
                      const assigneeName = task.assignee?.name || 'Chưa phân công';
                      const assigneeInitial = assigneeName.charAt(0).toUpperCase();
                      const subtaskCount = task.subtasks?.length || 0;
                      const completedSubtasks = task.subtasks?.filter(s => s.completed || s.done).length || 0;
                      const issueKey = task.key || `KS-${(task.id || '').toString().slice(-4).toUpperCase() || '101'}`;

                      const coAssigneeIds = task.teamMemberIds || [];
                      const coAssignees = userList.filter(u => coAssigneeIds.includes(u.id || u.userId) && (u.id || u.userId) !== task.assigneeId);
                      const totalTeamCount = 1 + coAssignees.length;

                      return (
                        <div
                          key={task.id}
                          onClick={() => setTaskDetailModal({ isOpen: true, task })}
                          className="bg-surface rounded-lg border border-border p-3 shadow-sm hover:shadow transition-all duration-150 group space-y-2.5 cursor-pointer"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[11px] font-bold font-mono text-accent">
                                {issueKey}
                              </span>
                            </div>

                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={(e) => { e.stopPropagation(); setEditingTask({ id: task.id, data: task }); setShowCreateForm(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                className="p-1 rounded text-sub hover:text-ink hover:bg-accent-soft transition-colors"
                                title="Sửa công việc"
                              >
                                <Pencil className="w-3 h-3" />
                              </button>
                              <button
                                onClick={(e) => handleDeleteClick(task, e)}
                                className="p-1 rounded text-sub hover:text-danger hover:bg-danger-soft transition-colors"
                                title="Xóa"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          <h4 className="font-bold text-ink text-xs leading-snug group-hover:text-accent transition-colors">
                            {task.title}
                          </h4>

                          <div className="pt-1 flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => setTaskTeamModal({ isOpen: true, task })}
                              className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-accent-soft hover:bg-accent-soft/80 border border-accent/20 text-accent text-[10px] font-bold transition-colors cursor-pointer"
                              title="Bấm để cấu hình nhóm thực hiện nhiệm vụ này"
                            >
                              <Users className="w-3 h-3 text-accent" />
                              <span>Nhóm (<strong className="font-mono">{totalTeamCount}</strong>)</span>
                            </button>

                            <div className="flex -space-x-1.5 overflow-hidden shrink-0">
                              <div className="w-6 h-6 rounded-full bg-accent text-white font-bold text-[10px] flex items-center justify-center ring-2 ring-surface" title={`Trưởng nhóm: ${assigneeName}`}>
                                {assigneeInitial}
                              </div>
                              {coAssignees.map(ca => (
                                <div key={ca.id || ca.userId} className="w-6 h-6 rounded-full bg-success text-white font-bold text-[10px] flex items-center justify-center ring-2 ring-surface" title={`Thành viên phối hợp: ${ca.name || ca.email}`}>
                                  {(ca.name || ca.email || 'M').charAt(0).toUpperCase()}
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-[10px] pt-1 border-t border-border">
                            <div className="flex items-center gap-1.5">
                              <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-[10px] font-semibold ${priorityObj.color}`}>
                                <PriorityIcon className="w-3 h-3" />
                                {priorityObj.label}
                              </span>

                              {subtaskCount > 0 && (
                                <span className="inline-flex items-center gap-1 text-sub font-mono font-semibold bg-bg px-1.5 py-0.5 rounded border border-border">
                                  <CheckSquare className="w-3 h-3 text-sub" />
                                  {completedSubtasks}/{subtaskCount}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="pt-2 border-t border-border flex items-center justify-between gap-1" onClick={(e) => e.stopPropagation()}>
                            <span className="text-[10px] font-bold text-sub uppercase">Chuyển:</span>
                            <div className="flex gap-1 overflow-x-auto">
                              {COLUMNS.map(targetCol => (
                                targetCol.id !== task.status && (
                                  <button
                                    key={targetCol.id}
                                    onClick={() => handleMoveTask(task.id, targetCol.id)}
                                    className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-bg hover:bg-accent-soft hover:text-accent text-sub transition-colors"
                                  >
                                    → {targetCol.label}
                                  </button>
                                )
                              ))}
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
            <h4 className="font-bold text-ink text-sm">Xác nhận xóa công việc</h4>
            <p className="text-xs text-sub">
              Bạn có chắc chắn muốn xóa <span className="font-bold text-ink">"{deleteTaskModal.taskTitle}"</span> không?
            </p>
            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => setDeleteTaskModal({ isOpen: false, taskId: null, taskTitle: '' })}
                className="btn-secondary"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmDeleteTask}
                className="btn-danger"
              >
                Xóa
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
        onClose={() => setTaskDetailModal({ isOpen: false, task: null })}
        onTaskUpdated={loadTasks}
      />
    </div>
  );
}
