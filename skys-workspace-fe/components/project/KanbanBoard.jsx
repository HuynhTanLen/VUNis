import { useState, useEffect } from 'react';
import { getTasksByProject, createTask, updateTask, updateTaskStatus, deleteTask } from '../../services/taskService';
import { Kanban, Plus, Loader2, Pencil, Trash2, X, Check, CheckSquare, AlertCircle, Bookmark, CircleDot, Flame, ArrowUp, ArrowDown, Minus, Users, UserPlus } from 'lucide-react';
import { getProjectMembers, addProjectMember, removeProjectMember } from '../../services/projectService';

/*
 * DESIGN: Jira Software Cloud Kanban Board.
 * Atlassian Design System (ADS) palette & Jira Issue Card layout.
 */

const COLUMNS = [
  { id: 'TODO', label: 'TO DO', statusKeys: ['TODO', 'Todo', 'todo'], color: 'border-t-slate-400', badgeBg: 'bg-slate-200/80 text-slate-700' },
  { id: 'IN_PROGRESS', label: 'IN PROGRESS', statusKeys: ['IN_PROGRESS', 'InProgress', 'in_progress'], color: 'border-t-blue-600', badgeBg: 'bg-blue-100/80 text-blue-700' },
  { id: 'REVIEW', label: 'IN REVIEW', statusKeys: ['REVIEW', 'Review', 'review'], color: 'border-t-amber-500', badgeBg: 'bg-amber-100/80 text-amber-800' },
  { id: 'DONE', label: 'DONE', statusKeys: ['DONE', 'Done', 'done'], color: 'border-t-emerald-600', badgeBg: 'bg-emerald-100/80 text-emerald-800' },
];

const ISSUE_TYPES = {
  Story: { label: 'Story', bg: 'bg-emerald-600', icon: Bookmark },
  Task:  { label: 'Task',  bg: 'bg-blue-600', icon: CheckSquare },
  Bug:   { label: 'Bug',   bg: 'bg-rose-600', icon: AlertCircle },
  Epic:  { label: 'Epic',  bg: 'bg-purple-600', icon: CircleDot },
};

const PRIORITIES = [
  { value: 'urgent', label: 'Khẩn cấp', color: 'text-rose-600 bg-rose-50 border-rose-200', icon: Flame },
  { value: 'high', label: 'Cao', color: 'text-amber-600 bg-amber-50 border-amber-200', icon: ArrowUp },
  { value: 'medium', label: 'Trung bình', color: 'text-blue-600 bg-blue-50 border-blue-200', icon: Minus },
  { value: 'low', label: 'Thấp', color: 'text-slate-500 bg-slate-100 border-slate-200', icon: ArrowDown },
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

const inputCls = "w-full px-3 py-1.5 bg-neutral-50/50 hover:bg-neutral-50 border border-neutral-350 rounded-lg text-xs text-neutral-900 placeholder-neutral-400 focus:bg-white focus:outline-none focus:border-neutral-400 focus:ring-1 focus:ring-neutral-200 transition-all font-semibold";
const labelCls = "text-[10px] font-bold text-neutral-400 uppercase tracking-wider";

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
    <div className="bg-white rounded-xl border-2 border-slate-300 p-5 shadow-md space-y-4 animate-fadeIn">
      <div className="flex items-center justify-between border-b-2 border-slate-200 pb-2.5">
        <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">{title}</h4>
        {projectDateRange && (
          <span className="text-[10px] text-amber-800 bg-amber-50 border border-amber-300 rounded px-2 py-0.5 font-bold">
            ⏱ {projectDateRange}
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-rose-50 text-rose-700 border border-rose-200 p-2.5 rounded-lg text-xs font-bold">{error}</div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className={labelCls}>Tên nhiệm vụ *</label>
            <input placeholder="VD: Thiết kế mô hình cơ sở dữ liệu" required value={form.title}
              onChange={e => set('title', e.target.value)} className={inputCls} />
          </div>

          <div className="space-y-1">
            <label className={labelCls}>Độ ưu tiên</label>
            <select value={form.priority || 'medium'} onChange={e => set('priority', e.target.value)} className={inputCls}>
              {PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </div>

          <div className="space-y-1">
            <label className={labelCls}>Vai trò chuyên môn</label>
            <select value={form.role} onChange={e => set('role', e.target.value)} className={inputCls}>
              <option value="">Chọn vai trò</option>
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <div className="space-y-1">
            <label className={labelCls}>Trưởng nhóm nhiệm vụ (Main Lead) *</label>
            <select value={form.assigneeId} onChange={e => set('assigneeId', e.target.value)} className={inputCls} required>
              {userList.length === 0
                ? <option value="">(Chưa có thành viên dự án)</option>
                : userList.map(u => <option key={u.id || u.userId} value={u.id || u.userId}>{u.name || u.user?.name || u.email} ({u.role || 'Member'})</option>)
              }
            </select>
          </div>

          <div className="space-y-1">
            <label className={labelCls}>Chi phí ước tính (VND)</label>
            <input type="number" placeholder="VD: 5000000" value={form.estimatedCost}
              onChange={e => set('estimatedCost', e.target.value)} className={inputCls} />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className={labelCls}>Ngày bắt đầu</label>
              <input type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} className={inputCls} />
            </div>
            <div className="space-y-1">
              <label className={labelCls}>Ngày kết thúc</label>
              <input type="date" value={form.endDate} onChange={e => set('endDate', e.target.value)} className={inputCls} />
            </div>
          </div>
        </div>

        {/* TASK TEAM ASSIGNMENT (QUẢN LÝ NHÓM THỰC HIỆN NHIỆM VỤ NÀY) */}
        <div className="pt-3 border-t-2 border-slate-200 space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-indigo-600" />
              Phân công Nhóm thực hiện Nhiệm vụ này
            </label>
            <span className="text-[10px] text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
              {(form.teamMemberIds?.length || 0) + (form.assigneeId ? 1 : 0)} người tham gia
            </span>
          </div>

          <p className="text-[10px] text-slate-500 font-medium">
            Chọn các thành viên phối hợp cùng thực hiện công việc này:
          </p>

          <div className="flex flex-wrap gap-2 bg-slate-50 p-3 rounded-xl border border-slate-300 max-h-32 overflow-y-auto">
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
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
                    isLead
                      ? 'bg-indigo-100 text-indigo-900 border-indigo-400 font-extrabold cursor-default'
                      : isCoAssignee
                      ? 'bg-emerald-100 text-emerald-900 border-emerald-400 shadow-2xs'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <span className={`w-4 h-4 rounded-full text-white flex items-center justify-center text-[9px] font-bold ${
                    isLead ? 'bg-indigo-600' : isCoAssignee ? 'bg-emerald-600' : 'bg-slate-400'
                  }`}>
                    {(u.name || u.email || 'U').charAt(0).toUpperCase()}
                  </span>
                  <span>{u.name || u.email}</span>
                  {isLead ? (
                    <span className="text-[9px] bg-indigo-600 text-white px-1 rounded font-bold">Trưởng nhóm</span>
                  ) : (
                    <span className="text-[10px] font-bold">{isCoAssignee ? '✓' : '+'}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex gap-2 pt-3 border-t-2 border-slate-200 justify-end">
          <button type="button" onClick={onCancel} className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 font-bold rounded-lg text-xs transition-colors cursor-pointer">
            Hủy
          </button>
          <button type="submit" className="px-4 py-1.5 bg-slate-900 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs transition-colors shadow-sm cursor-pointer">
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl border-2 border-slate-300 p-5 max-w-lg w-full space-y-4 shadow-2xl animate-scaleUp">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b-2 border-slate-200 pb-3">
          <div>
            <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
              Quản lý Nhóm Nhiệm Vụ
            </span>
            <h3 className="font-bold text-slate-900 text-sm mt-1 truncate max-w-sm">
              👥 {task.title}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. Chọn Trưởng nhóm nhiệm vụ */}
        <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
          <label className="text-[11px] font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            👑 Trưởng nhóm phụ trách chính (Main Lead)
          </label>
          <select
            value={assigneeId}
            onChange={e => setAssigneeId(e.target.value)}
            className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-600 cursor-pointer"
          >
            {userList.map(u => (
              <option key={u.id || u.userId} value={u.id || u.userId}>
                👤 {u.name || u.user?.name || u.email} ({u.role || 'Member'})
              </option>
            ))}
          </select>
        </div>

        {/* 2. Chọn Thành viên phối hợp trong nhóm nhiệm vụ */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between">
            <span>🤝 Thành viên phối hợp trong nhóm ({teamMemberIds.length + (assigneeId ? 1 : 0)} người)</span>
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
                  className={`p-2 rounded-lg border flex items-center justify-between transition-all cursor-pointer ${
                    isLead
                      ? 'bg-indigo-50 border-indigo-300 font-bold text-indigo-900 cursor-default'
                      : isMember
                      ? 'bg-emerald-50 border-emerald-300 font-bold text-emerald-900'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={`w-6 h-6 rounded-full text-white font-bold text-[10px] flex items-center justify-center shrink-0 ${
                      isLead ? 'bg-indigo-600' : isMember ? 'bg-emerald-600' : 'bg-slate-400'
                    }`}>
                      {(u.name || u.email || 'U').charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs truncate">{u.name || u.email}</span>
                  </div>
                  <span className="text-[10px] shrink-0 font-bold">
                    {isLead ? <span className="bg-indigo-600 text-white px-1.5 py-0.5 rounded text-[9px]">Trưởng nhóm</span> : isMember ? '✓ Đã chọn' : '+ Thêm'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. Phân công công việc nhỏ (Subtasks) cho nhóm */}
        <div className="space-y-2 pt-2 border-t-2 border-slate-200">
          <label className="text-[11px] font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1">
            <CheckSquare className="w-3.5 h-3.5 text-indigo-600" />
            Phân công công việc nhỏ trong nhóm ({subtasks.length})
          </label>

          <form onSubmit={handleAddSubtask} className="flex gap-2">
            <input
              type="text"
              placeholder="VD: Thiết kế UI, Code API..."
              value={newSubtaskTitle}
              onChange={e => setNewSubtaskTitle(e.target.value)}
              className="flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none focus:border-indigo-600"
            />
            <select
              value={newSubtaskAssignee}
              onChange={e => setNewSubtaskAssignee(e.target.value)}
              className="w-36 px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800"
            >
              {userList.map(u => (
                <option key={u.id || u.userId} value={u.id || u.userId}>
                  {u.name || u.email}
                </option>
              ))}
            </select>
            <button type="submit" className="px-3 py-1.5 bg-slate-900 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs shrink-0 cursor-pointer">
              + Thêm
            </button>
          </form>

          <div className="max-h-28 overflow-y-auto space-y-1.5 pr-1">
            {subtasks.length === 0 ? (
              <p className="text-[11px] text-slate-400 italic text-center py-2">Chưa có công việc con nào được giao cho nhóm</p>
            ) : (
              subtasks.map((st, idx) => {
                const assignedUser = userList.find(u => (u.id || u.userId) === st.assigneeId);
                return (
                  <div key={st.id || idx} className="flex items-center justify-between p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <input
                        type="checkbox"
                        checked={st.completed}
                        onChange={() => handleToggleSubtask(idx)}
                        className="rounded text-indigo-600 focus:ring-0 cursor-pointer"
                      />
                      <span className={`truncate font-semibold ${st.completed ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                        {st.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] font-bold text-slate-600 bg-white border border-slate-300 px-1.5 py-0.5 rounded">
                        👤 {assignedUser?.name || 'Chưa gán'}
                      </span>
                      <button onClick={() => handleRemoveSubtask(idx)} className="text-slate-400 hover:text-rose-600 cursor-pointer">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 pt-3 border-t-2 border-slate-200">
          <button onClick={onClose} className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs cursor-pointer">
            Hủy
          </button>
          <button onClick={handleSave} className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs shadow-sm cursor-pointer">
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

  const loadMembers = async () => {
    try {
      const usersData = await getProjectMembers(projectId);
      setUserList(usersData);
      if (usersData.length > 0 && !defaultAssignee) {
        setDefaultAssignee(usersData[0].id || usersData[0].userId);
      }
    } catch (err) {
      console.error('Lỗi lấy danh sách thành viên:', err);
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

  const handleDeleteClick = (task) => {
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
    // Optimistic UI update
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
        <div className="bg-white rounded-lg border border-neutral-300 p-4 shadow-3xs">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">Tiến trình bàn giao</span>
            <span className="text-xs font-bold text-neutral-900">{progress}% hoàn thành</span>
          </div>
          <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
            <div className="h-full bg-neutral-900 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
          <div className="flex justify-between text-[10px] text-neutral-400 mt-2 font-semibold uppercase tracking-wider">
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
            className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-3.5 py-1.5 bg-neutral-950 hover:bg-neutral-850 text-white font-bold rounded-lg text-xs shadow-2xs active:scale-[0.98] transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Thêm nhiệm vụ
          </button>

          <input
            type="text"
            placeholder="Tìm kiếm công việc..."
            className="px-3 py-1.5 bg-white border border-neutral-300 rounded-lg text-xs font-semibold placeholder-neutral-400 text-neutral-900 focus:outline-none focus:border-neutral-400 transition-all w-52"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />

          <select
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value)}
            className="px-3 py-1.5 bg-white border border-neutral-300 rounded-lg text-xs font-semibold text-neutral-700 focus:outline-none focus:border-neutral-400 transition-all cursor-pointer"
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
            <div key={col.id} className={`px-2 py-0.5 rounded-md border ${col.badgeBg}`}>
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
        <div className="bg-white rounded-xl border border-slate-200 p-20 flex flex-col items-center justify-center">
          <Loader2 className="w-6 h-6 text-indigo-600 animate-spin mb-2" />
          <p className="text-slate-500 text-xs font-semibold">Đang cập nhật bảng công việc...</p>
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
              <div key={col.id} className={`min-w-[260px] w-[80vw] md:w-auto md:min-w-0 snap-center bg-slate-100/70 rounded-xl border border-slate-200/80 border-t-2 ${col.color} min-h-[420px] flex flex-col flex-shrink-0 md:flex-shrink`}>
                {/* Column Header */}
                <div className="px-3.5 py-2.5 bg-white border-b border-slate-200/80 flex items-center justify-between shrink-0 rounded-t-xl">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-700 text-xs uppercase tracking-wider">{col.label}</span>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${col.badgeBg}`}>{colTasks.length}</span>
                  </div>
                </div>

                {/* Column Body: Task Cards List */}
                <div className="p-2 space-y-2.5 flex-1 overflow-y-auto max-h-[calc(100vh-280px)] min-h-[150px]">
                  {colTasks.length === 0 ? (
                    <div className="h-28 border-2 border-dashed border-slate-200 rounded-lg flex items-center justify-center text-slate-400 text-xs font-semibold">
                      Chưa có nhiệm vụ
                    </div>
                  ) : (
                    colTasks.map((task) => {
                      const priorityObj = PRIORITIES.find(p => p.value === (task.priority || 'medium')) || PRIORITIES[2];
                      const PriorityIcon = priorityObj.icon;
                      const assigneeName = task.assignee?.name || 'Chưa phân công';
                      const assigneeInitial = assigneeName.charAt(0).toUpperCase();
                      const subtaskCount = task.subtasks?.length || 0;
                      const completedSubtasks = task.subtasks?.filter(s => s.completed).length || 0;
                      const issueKey = task.key || `KS-${(task.id || '').toString().slice(0, 4).toUpperCase()}`;

                      // Task Team Co-Assignees
                      const coAssigneeIds = task.teamMemberIds || [];
                      const coAssignees = userList.filter(u => coAssigneeIds.includes(u.id || u.userId) && (u.id || u.userId) !== task.assigneeId);
                      const totalTeamCount = 1 + coAssignees.length;

                      return (
                        <div
                          key={task.id}
                          className="bg-white rounded-lg border border-slate-200 p-3 shadow-2xs hover:shadow-md transition-all duration-150 group space-y-2.5"
                        >
                          {/* Card Top Header: Issue Key & Actions */}
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5">
                              <span className="w-4 h-4 rounded bg-indigo-600 text-white flex items-center justify-center text-[9px] font-bold" title="Jira Task">
                                ✓
                              </span>
                              <span className="text-[11px] font-bold text-indigo-600">
                                {issueKey}
                              </span>
                            </div>

                            {/* Edit / Delete buttons */}
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => { setEditingTask({ id: task.id, data: task }); setShowCreateForm(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                                title="Sửa công việc"
                              >
                                <Pencil className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => handleDeleteClick(task)}
                                className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                title="Xóa"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          {/* Task Title */}
                          <h4 className="font-bold text-slate-900 text-xs leading-snug">
                            {task.title}
                          </h4>

                          {/* Task Team Management Button directly on Card */}
                          <div className="pt-1 flex items-center justify-between">
                            <button
                              onClick={() => setTaskTeamModal({ isOpen: true, task })}
                              className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-800 text-[10px] font-bold transition-all cursor-pointer"
                              title="Bấm để cấu hình nhóm thực hiện nhiệm vụ này"
                            >
                              <Users className="w-3 h-3 text-indigo-600" />
                              <span>Quản lý nhóm ({totalTeamCount} người)</span>
                            </button>

                            {/* Task Team Avatars Stack */}
                            <div className="flex -space-x-1.5 overflow-hidden shrink-0">
                              <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center ring-2 ring-white shadow-2xs" title={`Trưởng nhóm: ${assigneeName}`}>
                                {assigneeInitial}
                              </div>
                              {coAssignees.map(ca => (
                                <div key={ca.id || ca.userId} className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center ring-2 ring-white shadow-2xs" title={`Thành viên phối hợp: ${ca.name || ca.email}`}>
                                  {(ca.name || ca.email || 'M').charAt(0).toUpperCase()}
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Priority & Subtask progress */}
                          <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-100">
                            <div className="flex items-center gap-1.5">
                              <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-[10px] font-medium ${priorityObj.color}`}>
                                <PriorityIcon className="w-3 h-3" />
                                {priorityObj.label}
                              </span>

                              {subtaskCount > 0 && (
                                <span className="inline-flex items-center gap-1 text-slate-500 font-semibold bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                                  <CheckSquare className="w-3 h-3 text-slate-400" />
                                  {completedSubtasks}/{subtaskCount}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Quick Move Status Selector */}
                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Chuyển:</span>
                            <div className="flex gap-1 overflow-x-auto">
                              {COLUMNS.map(targetCol => (
                                targetCol.id !== task.status && (
                                  <button
                                    key={targetCol.id}
                                    onClick={() => handleMoveTask(task.id, targetCol.id)}
                                    className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 transition-colors"
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
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-neutral-350 p-5 max-w-sm w-full space-y-4 shadow-xl animate-scaleUp">
            <h4 className="font-bold text-neutral-900 text-sm">Xác nhận xóa công việc</h4>
            <p className="text-xs text-neutral-600">
              Bạn có chắc chắn muốn xóa <span className="font-bold text-neutral-900">"{deleteTaskModal.taskTitle}"</span> không?
            </p>
            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => setDeleteTaskModal({ isOpen: false, taskId: null, taskTitle: '' })}
                className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold rounded-lg text-xs"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmDeleteTask}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TASK-LEVEL TEAM MANAGEMENT MODAL */}
      <TaskTeamModal
        isOpen={taskTeamModal.isOpen}
        task={taskTeamModal.task}
        userList={userList}
        onClose={() => setTaskTeamModal({ isOpen: false, task: null })}
        onSaveTaskTeam={handleSaveTaskTeam}
      />
    </div>
  );
}
