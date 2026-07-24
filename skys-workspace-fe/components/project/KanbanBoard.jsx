import { useState, useEffect } from 'react';
import { getTasksByProject, createTask, updateTask, updateTaskStatus, deleteTask } from '../../services/taskService';
import { Kanban, Plus, Loader2, Pencil, Trash2, X, Check, CheckSquare, AlertCircle } from 'lucide-react';
import { getProjectMembers } from '../../services/projectService';

/*
 * DESIGN: High-density Kanban board — Premium Vercel style.
 * Features: Create Task, Edit Task, Delete Task, Move Task, Priority & Subtasks.
 */

const COLUMNS = [
  { id: 'Todo', label: 'Cần làm', color: 'border-t-blue-500', badgeBg: 'bg-blue-50 text-blue-700 border-blue-200/50' },
  { id: 'InProgress', label: 'Đang làm', color: 'border-t-amber-500', badgeBg: 'bg-amber-50 text-amber-700 border-amber-200/50' },
  { id: 'Done', label: 'Hoàn thành', color: 'border-t-emerald-500', badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200/50' },
];

const ROLES = ['Frontend Dev', 'Backend Dev', 'Designer', 'QA Tester', 'DevOps', 'Khác'];
const PRIORITIES = [
  { value: 'urgent', label: 'Khẩn cấp', color: 'bg-rose-50 text-rose-700 border-rose-200' },
  { value: 'high', label: 'Cao', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { value: 'medium', label: 'Trung bình', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { value: 'low', label: 'Thấp', color: 'bg-neutral-100 text-neutral-600 border-neutral-200' },
];

const EMPTY_TASK = { title: '', role: '', priority: 'medium', assigneeId: '', startDate: '', endDate: '', estimatedCost: '' };

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
    <div className="bg-white rounded-lg border border-neutral-350 p-4 shadow-3xs space-y-3.5 animate-fadeIn">
      <h4 className="font-bold text-neutral-900 text-xs uppercase tracking-wider">{title}</h4>
      {projectDateRange && (
        <p className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1 font-semibold">
          ⏱ Dự án: {projectDateRange}
        </p>
      )}
      <form onSubmit={handleSubmit} className="space-y-3">
        {error && (
          <div className="bg-rose-50 text-rose-700 border border-rose-100 p-2.5 rounded-lg text-xs font-bold leading-normal">{error}</div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className={labelCls}>Nhiệm vụ *</label>
            <input placeholder="VD: Viết tài liệu đặc tả API" required value={form.title}
              onChange={e => set('title', e.target.value)} className={inputCls} />
          </div>

          <div className="space-y-1">
            <label className={labelCls}>Độ ưu tiên</label>
            <select value={form.priority || 'medium'} onChange={e => set('priority', e.target.value)} className={inputCls}>
              {PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </div>

          <div className="space-y-1">
            <label className={labelCls}>Vai trò đảm nhiệm</label>
            <select value={form.role} onChange={e => set('role', e.target.value)} className={inputCls}>
              <option value="">Chọn vai trò</option>
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <div className="space-y-1">
            <label className={labelCls}>Người thực hiện</label>
            <select value={form.assigneeId} onChange={e => set('assigneeId', e.target.value)} className={inputCls} required>
              {userList.length === 0
                ? <option value="">(Không có người dùng)</option>
                : userList.map(u => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)
              }
            </select>
          </div>

          <div className="space-y-1">
            <label className={labelCls}>Chi phí ước tính (VND)</label>
            <input type="number" placeholder="VD: 5000000" value={form.estimatedCost}
              onChange={e => set('estimatedCost', e.target.value)} className={inputCls} />
          </div>

          <div className="space-y-1">
            <label className={labelCls}>Ngày bắt đầu</label>
            <input type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} className={inputCls} />
          </div>

          <div className="space-y-1">
            <label className={labelCls}>Ngày kết thúc</label>
            <input type="date" value={form.endDate} onChange={e => set('endDate', e.target.value)} className={inputCls} />
          </div>
        </div>

        <div className="flex gap-2 pt-2.5 border-t border-neutral-300">
          <button type="submit" className="px-3.5 py-1.5 bg-neutral-950 hover:bg-neutral-850 text-white font-bold rounded-lg text-xs transition-colors shadow-2xs">
            {submitLabel}
          </button>
          <button type="button" onClick={onCancel} className="px-3.5 py-1.5 bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 text-neutral-700 font-bold rounded-lg text-xs transition-colors">
            Hủy
          </button>
        </div>
      </form>
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
          setDefaultAssignee(usersData[0].id);
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
      startDate: form.startDate || null,
      endDate: form.endDate || null,
      estimatedCost: form.estimatedCost !== '' ? Number(form.estimatedCost) : 0,
    });
    setEditingTask(null);
    loadTasks();
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
            className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-3 py-2.5 sm:py-1.5 bg-neutral-950 hover:bg-neutral-850 text-white font-bold rounded-lg text-xs shadow-2xs active:scale-[0.98] transition-all cursor-pointer"
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
        <div className="bg-white rounded-lg border border-neutral-300 p-20 flex flex-col items-center justify-center">
          <Loader2 className="w-6 h-6 text-neutral-700 animate-spin mb-2" />
          <p className="text-neutral-500 text-xs font-semibold">Đang cập nhật bảng công việc...</p>
        </div>
      ) : (
        <div className="flex overflow-x-auto snap-x snap-mandatory md:grid md:grid-cols-3 gap-4 pb-2 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0">
          {COLUMNS.map((col) => {
            const colTasks = tasks.filter(t => {
              const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase());
              const matchesPriority = priorityFilter === 'all' || (t.priority || 'medium') === priorityFilter;
              return t.status === col.id && matchesSearch && matchesPriority;
            });
            return (
              <div key={col.id} className={`min-w-[280px] w-[82vw] md:w-auto md:min-w-0 snap-center bg-neutral-50/60 rounded-lg border border-neutral-300 border-t-2 ${col.color} min-h-[350px] overflow-hidden flex flex-col flex-shrink-0 md:flex-shrink`}>
                {/* Column Header */}
                <div className="px-3.5 py-2.5 bg-white border-b border-neutral-300 flex items-center justify-between shrink-0">
                  <span className="font-bold text-neutral-850 text-[11px] uppercase tracking-wider">{col.label}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${col.badgeBg}`}>{colTasks.length}</span>
                </div>

                {/* Task cards */}
                <div className="p-3.5 space-y-3 flex-1 overflow-y-auto">
                  {colTasks.length === 0 ? (
                    <div className="text-center py-10 text-neutral-400 text-[10px] font-medium uppercase tracking-wider">Trống</div>
                  ) : (
                    colTasks.map((task) => {
                      const priorityObj = PRIORITIES.find(p => p.value === (task.priority || 'medium')) || PRIORITIES[2];
                      const subtaskCount = Array.isArray(task.subtasks) ? task.subtasks.length : 0;
                      const completedSubtasks = Array.isArray(task.subtasks) ? task.subtasks.filter(s => s.completed).length : 0;

                      return (
                        <div key={task.id} className="bg-white rounded-lg border border-neutral-300 p-3 shadow-3xs hover:border-neutral-400 transition-all flex flex-col justify-between space-y-3 group">
                          <div className="flex items-start justify-between gap-2">
                            <div className="space-y-1 flex-1">
                              <span className={`inline-block text-[9px] font-extrabold px-2 py-0.5 rounded border uppercase ${priorityObj.color}`}>
                                {priorityObj.label}
                              </span>
                              <h4 className="font-bold text-neutral-900 text-xs leading-normal tracking-tight">{task.title}</h4>
                            </div>

                            {/* Edit / Delete buttons */}
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                              <button
                                onClick={() => { setEditingTask({ id: task.id, data: task }); setShowCreateForm(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                className="p-1 rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
                                title="Sửa công việc"
                              >
                                <Pencil className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => handleDeleteClick(task)}
                                className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                title="Xóa công việc"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Role & Subtask summary */}
                          <div className="flex flex-wrap gap-1.5 items-center">
                            {task.role && (
                              <span className="text-[9px] bg-neutral-50 text-neutral-600 border border-neutral-300 px-1.5 py-0.5 rounded font-mono uppercase tracking-wide font-bold">
                                {task.role}
                              </span>
                            )}
                            {subtaskCount > 0 && (
                              <span className="text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded font-semibold flex items-center gap-1">
                                <CheckSquare className="w-2.5 h-2.5" />
                                {completedSubtasks}/{subtaskCount} việc con
                              </span>
                            )}
                            {(task.startDate || task.endDate || task.estimatedCost > 0) && (
                              <div className="w-full text-[10px] text-slate-500 space-y-1 bg-slate-50 p-2 rounded-lg border border-slate-100/80">
                                {(task.startDate || task.endDate) && (
                                  <div className="flex justify-between">
                                    <span>Thời gian:</span>
                                    <span className="font-bold text-slate-700">
                                      {task.startDate ? new Date(task.startDate).toLocaleDateString('vi-VN') : '—'} → {task.endDate ? new Date(task.endDate).toLocaleDateString('vi-VN') : '—'}
                                    </span>
                                  </div>
                                )}
                                {task.estimatedCost > 0 && (
                                  <div className="flex justify-between">
                                    <span>Chi phí ước tính:</span>
                                    <span className="font-bold text-indigo-600">
                                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(task.estimatedCost)}
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}
                            {task.assignee && (
                              <div className="text-[9px] text-neutral-450 font-bold uppercase tracking-wider mt-1 flex items-center gap-1">
                                <span>Người Làm: </span>
                                <span className="text-neutral-800">{task.assignee.name}</span>
                              </div>
                            )}
                          </div>

                          {/* Move buttons */}
                          <div className="flex flex-wrap gap-1 pt-2 border-t border-neutral-100 opacity-80 group-hover:opacity-100 transition-opacity">
                            {col.id !== 'Todo' && (
                              <button onClick={() => handleMoveTask(task.id, 'Todo')} className="text-[9px] font-bold px-2 py-0.5 bg-white text-neutral-600 border border-neutral-300 hover:border-neutral-400 rounded transition-colors cursor-pointer">← Cần làm</button>
                            )}
                            {col.id !== 'InProgress' && (
                              <button onClick={() => handleMoveTask(task.id, 'InProgress')} className="text-[9px] font-bold px-2 py-0.5 bg-white text-neutral-600 border border-neutral-300 hover:border-neutral-400 rounded transition-colors cursor-pointer">Đang làm</button>
                            )}
                            {col.id !== 'Done' && (
                              <button onClick={() => handleMoveTask(task.id, 'Done')} className="text-[9px] font-bold px-2 py-0.5 bg-white text-neutral-600 border border-neutral-300 hover:border-neutral-400 rounded transition-colors cursor-pointer">Xong →</button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
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
    </div>
  );
}
