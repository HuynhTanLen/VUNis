import { useState, useEffect } from 'react';
import { getProjects, createProject, delProject, updProject } from '../../services/projectService';
import Toast from '../ui/Toast';
import { 
  FolderPlus, Trash2, Calendar, ShieldCheck, 
  Loader2, Clock, Layers, Filter, CheckCircle2, AlertCircle, X
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const STATUS_OPTIONS = [
  { code: 'active',  label: 'Đang thực hiện' },
  { code: 'paused',  label: 'Tạm dừng' },
  { code: 'done',    label: 'Hoàn thành' },
];

const STATUS_LABEL = { active: 'Đang thực hiện', paused: 'Tạm dừng', done: 'Hoàn thành' };

export default function ProjectDashboard({ onSelectProject }) {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [filter, setFilter] = useState('all');
  const [editingStatus, setEditingStatus] = useState(null);

  const [newProject, setNewProject] = useState({
    name: '', 
    description: '', 
    budget: '', 
    durationWeeks: '', 
    durationUnit: 'weeks',
    startDate: new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0], 
    priority: 'Medium'
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
      console.error('Lỗi lấy dự án:', err);
    } finally {
      setLoading(false);
    }
  };

  const convertWeeksToDurationAndUnit = (weeks) => {
    if (!weeks) return { duration: '', unit: 'weeks' };
    const totalDays = Math.round(Number(weeks) * 7);
    
    if (totalDays % 90 === 0 && totalDays > 0) {
      return { duration: totalDays / 90, unit: 'quarters' };
    }
    if (totalDays % 30 === 0 && totalDays > 0) {
      return { duration: totalDays / 30, unit: 'months' };
    }
    if (totalDays % 7 === 0 && totalDays > 0) {
      return { duration: totalDays / 7, unit: 'weeks' };
    }
    return { duration: totalDays, unit: 'days' };
  };

  const handleStartEdit = (project) => {
    const { duration, unit } = convertWeeksToDurationAndUnit(project.durationWeeks);
    setEditDurationUnit(unit);
    setEditProject({
      id: project.id,
      data: {
        ...project,
        durationWeeks: duration
      }
    });
    setShowForm(false);
  };

  const formatDuration = (weeks) => {
    if (!weeks) return 'Chưa đặt thời gian';
    const totalDays = Math.round(Number(weeks) * 7);

    if (totalDays < 7) {
      return `${totalDays} ngày`;
    }
    if (totalDays % 30 === 0) {
      const months = totalDays / 30;
      return `${months} tháng (${totalDays} ngày)`;
    }
    if (totalDays % 7 === 0) {
      const w = totalDays / 7;
      return `${w} tuần (${totalDays} ngày)`;
    }
    return `${totalDays} ngày`;
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createProject({
        name: newProject.name,
        description: newProject.description,
        scale: newProject.scale || 'Vừa (5-15 người)',
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
        priority: newProject.priority || 'Medium'
      });
      setNewProject({ 
        name: '', 
        description: '', 
        scale: 'Vừa (5-15 người)',
        budget: 0, 
        durationWeeks: '', 
        durationUnit: 'weeks', 
        startDate: new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0], 
        priority: 'Medium' 
      });
      setShowForm(false);
      loadProjects();
      showToast('Tạo dự án thành công! Bạn đã được gán vai trò PM.');
    } catch (err) {
      showToast(err?.response?.data?.message || 'Tạo dự án thất bại!', 'error');
    }
  };

  const handleUpdateProject = async (e) => {
    e.preventDefault();
    try {
      await updProject(editProject.id, {
        name: editProject.data.name,
        description: editProject.data.description,
        scale: editProject.data.scale,
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
        status: editProject.data.status
      });
      setEditProject(null);
      loadProjects();
      showToast('Cập nhật dự án thành công!');
    } catch (err) {
      showToast(err?.response?.data?.message || 'Cập nhật thất bại!', 'error');
    }
  };

  const [deleteProjectModal, setDeleteProjectModal] = useState({ isOpen: false, projectId: null, projectName: '' });

  const handleDelClick = (project, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setDeleteProjectModal({
      isOpen: true,
      projectId: project.id,
      projectName: project.name
    });
  };

  const handleConfirmDeleteProject = async () => {
    if (!deleteProjectModal.projectId) return;
    try {
      await delProject(deleteProjectModal.projectId);
      setDeleteProjectModal({ isOpen: false, projectId: null, projectName: '' });
      loadProjects();
      showToast('Đã xóa dự án thành công.');
    } catch (err) {
      showToast('Xóa dự án thất bại!', 'error');
      setDeleteProjectModal({ isOpen: false, projectId: null, projectName: '' });
    }
  };

  const [editingPriority, setEditingPriority] = useState(null);

  const handleUpdateStatus = async (projectId, newStatus) => {
    try {
      await updProject(projectId, { status: newStatus });
      setEditingStatus(null);
      setProjects(prev => prev.map(p =>
        p.id === projectId ? { ...p, status: newStatus } : p
      ));
      showToast(`Đã cập nhật trạng thái: ${STATUS_LABEL[newStatus] || newStatus}`);
    } catch (err) {
      showToast('Cập nhật trạng thái thất bại: ' + (err?.response?.data?.message || err.message), 'error');
    }
  };

  const handleUpdatePriority = async (projectId, newPriority) => {
    try {
      await updProject(projectId, { priority: newPriority });
      setEditingPriority(null);
      setProjects(prev => prev.map(p =>
        p.id === projectId ? { ...p, priority: newPriority } : p
      ));
      showToast('Đã cập nhật mức độ ưu tiên');
    } catch (err) {
      showToast('Cập nhật ưu tiên thất bại: ' + (err?.response?.data?.message || err.message), 'error');
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

  const filteredProjects = filter === 'all'
    ? projects
    : projects.filter(p => normalizeStatus(p.status) === filter);

  return (
    <section className="space-y-6 max-w-6xl mx-auto w-full px-4 py-6 md:px-8 md:py-10" aria-labelledby="dashboard-title">

      {/* HEADER & BRIEF */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 id="dashboard-title" className="text-xl font-bold text-ink tracking-tight">
            Dự án & Không gian làm việc
          </h1>
          <p className="text-xs text-sub mt-1 font-normal leading-relaxed">
            Xem danh sách, quản lý tiến độ dự án, cấu trúc ngân sách và phân phối nhiệm vụ nhóm.
          </p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setEditProject(null); }}
          className="btn-primary w-full sm:w-auto"
        >
          <FolderPlus className="w-4 h-4" />
          Tạo dự án mới
        </button>
      </header>

      {/* BENTO GRID METRICS (F-PATTERN DESIGN) */}
      <section aria-label="Các chỉ số trạng thái dự án" className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Cell 1: Total & Active Projects — LARGE BENTO CELL (Top-Left Priority) */}
        <div 
          onClick={() => setFilter(filter === 'active' ? 'all' : 'active')}
          className={`md:col-span-2 bg-surface rounded-xl border p-6 shadow-sm transition-colors cursor-pointer flex flex-col justify-between ${
            filter === 'active' ? 'border-accent ring-1 ring-accent/30' : 'border-border hover:border-accent/40'
          }`}
        >
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold text-sub uppercase tracking-wider">Tổng Quan Tiến Độ</span>
              <div className="flex items-baseline gap-3 mt-1">
                <span className="text-3xl font-extrabold text-ink font-mono">{projects.length}</span>
                <span className="text-xs text-sub font-mono">Dự án tổng cộng</span>
              </div>
            </div>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-accent-soft text-accent border border-accent/20">
              Đang chạy: <strong className="font-mono ml-1">{countActive}</strong>
            </span>
          </div>

          <div className="mt-6 space-y-2">
            <div className="flex justify-between text-xs font-medium text-sub">
              <span>Phân bổ trạng thái</span>
              <span className="font-mono">
                {projects.length > 0 ? Math.round((countActive / projects.length) * 100) : 0}% đang thực hiện
              </span>
            </div>
            <div className="h-2 bg-bg rounded-full overflow-hidden flex">
              <div 
                className="bg-accent h-full transition-all duration-300"
                style={{ width: `${projects.length > 0 ? (countActive / projects.length) * 100 : 0}%` }}
                title="Đang thực hiện"
              />
              <div 
                className="bg-warning h-full transition-all duration-300"
                style={{ width: `${projects.length > 0 ? (countPaused / projects.length) * 100 : 0}%` }}
                title="Tạm dừng"
              />
              <div 
                className="bg-success h-full transition-all duration-300"
                style={{ width: `${projects.length > 0 ? (countDone / projects.length) * 100 : 0}%` }}
                title="Hoàn thành"
              />
            </div>
          </div>
        </div>

        {/* Cell 2 & 3: Smaller Bento Cards */}
        <div className="space-y-4 flex flex-col justify-between">
          
          {/* Tạm dừng Card */}
          <div 
            onClick={() => setFilter(filter === 'paused' ? 'all' : 'paused')}
            className={`bg-surface rounded-xl border p-4 shadow-sm transition-colors cursor-pointer flex items-center justify-between ${
              filter === 'paused' ? 'border-warning ring-1 ring-warning/30' : 'border-border hover:border-warning/40'
            }`}
          >
            <div>
              <span className="text-[10px] font-bold text-sub uppercase tracking-wider">Tạm Dừng</span>
              <h3 className="text-xl font-bold text-warning font-mono mt-0.5">{loading ? '...' : countPaused}</h3>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-warning-soft text-warning border border-warning/20">
              Cần xem xét
            </span>
          </div>

          {/* Hoàn thành Card */}
          <div 
            onClick={() => setFilter(filter === 'done' ? 'all' : 'done')}
            className={`bg-surface rounded-xl border p-4 shadow-sm transition-colors cursor-pointer flex items-center justify-between ${
              filter === 'done' ? 'border-success ring-1 ring-success/30' : 'border-border hover:border-success/40'
            }`}
          >
            <div>
              <span className="text-[10px] font-bold text-sub uppercase tracking-wider">Hoàn Thành</span>
              <h3 className="text-xl font-bold text-success font-mono mt-0.5">{loading ? '...' : countDone}</h3>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-success-soft text-success border border-success/20">
              Đã nghiệm thu
            </span>
          </div>

        </div>

      </section>

      {/* CREATE FORM CARD */}
      {showForm && (
        <section aria-label="Biểu mẫu khởi tạo dự án" className="bg-surface rounded-xl border border-border p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h2 className="font-bold text-ink text-xs uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent" />
              Khởi tạo dự án mới
            </h2>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-accent-soft text-accent border border-accent/20">
              Bạn sẽ là PM dự án
            </span>
          </div>

          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="label-field">Tên dự án *</label>
                <input
                  placeholder="VD: Nâng cấp Hệ thống Bán hàng Mobile"
                  required
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  className="input-field font-semibold"
                />
              </div>
              <div className="space-y-1">
                <label className="label-field">Quy mô dự án</label>
                <select
                  value={newProject.scale || 'Vừa (5-15 người)'}
                  onChange={(e) => setNewProject({ ...newProject, scale: e.target.value })}
                  className="input-field font-semibold"
                >
                  <option value="Nhỏ (1-5 người)">Nhỏ (1 - 5 thành viên)</option>
                  <option value="Vừa (5-15 người)">Vừa (5 - 15 thành viên)</option>
                  <option value="Lớn (15-50 người)">Lớn (15 - 50 thành viên)</option>
                  <option value="Doanh nghiệp (>50 người)">Doanh nghiệp (Trên 50 thành viên)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="label-field">Mô tả mục tiêu dự án</label>
              <textarea
                placeholder="Mô tả tóm tắt mục tiêu và phạm vi dự án..."
                value={newProject.description}
                rows={2}
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                className="input-field resize-none leading-relaxed"
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="label-field">Thời hạn dự án</label>
                <div className="flex gap-2">
                  <input
                    type="number" min={1} max={260}
                    placeholder="Số lượng..."
                    value={newProject.durationWeeks}
                    onChange={(e) => setNewProject({ ...newProject, durationWeeks: e.target.value })}
                    className="flex-1 input-field font-mono"
                  />
                  <select
                    value={newProject.durationUnit}
                    onChange={(e) => setNewProject({ ...newProject, durationUnit: e.target.value })}
                    className="px-3 py-2 bg-bg border border-border rounded-lg text-xs text-ink font-semibold focus:outline-none focus:border-accent"
                  >
                    <option value="days">Ngày</option>
                    <option value="weeks">Tuần</option>
                    <option value="months">Tháng</option>
                    <option value="quarters">Quý</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="label-field">Ngày bắt đầu dự kiến</label>
                <input
                  type="date"
                  value={newProject.startDate}
                  onChange={(e) => setNewProject({ ...newProject, startDate: e.target.value })}
                  className="input-field font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="label-field">Mức độ ưu tiên</label>
                <select
                  value={newProject.priority}
                  onChange={(e) => setNewProject({ ...newProject, priority: e.target.value })}
                  className="input-field font-semibold"
                >
                  <option value="Low">Thấp</option>
                  <option value="Medium">Trung bình</option>
                  <option value="High">Cao</option>
                </select>
              </div>
            </div>
            
            <div className="flex gap-2.5 pt-4 border-t border-border">
              <button 
                type="submit" 
                className="btn-primary"
              >
                Khởi tạo dự án
              </button>
              <button 
                type="button" 
                onClick={() => setShowForm(false)} 
                className="btn-secondary"
              >
                Hủy bỏ
              </button>
            </div>
          </form>
        </section>
      )}

      {/* EDIT PROJECT FORM */}
      {editProject && (
        <section aria-label="Biểu mẫu chỉnh sửa dự án" className="bg-surface rounded-xl border border-warning/30 p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h2 className="font-bold text-ink text-xs uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-warning" />
              Chỉnh sửa: {editProject.data.name}
            </h2>
            <button onClick={() => setEditProject(null)} className="text-sub hover:text-ink text-xs font-bold transition-colors">✕ Đóng</button>
          </div>
          <form onSubmit={handleUpdateProject} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="label-field">Tên dự án *</label>
                <input required value={editProject.data.name}
                  onChange={e => setEditProject(p => ({ ...p, data: { ...p.data, name: e.target.value } }))}
                  className="input-field font-semibold" />
              </div>
              <div className="space-y-1">
                <label className="label-field">Quy mô dự án</label>
                <select
                  value={editProject.data.scale || 'Vừa (5-15 người)'}
                  onChange={e => setEditProject(p => ({ ...p, data: { ...p.data, scale: e.target.value } }))}
                  className="input-field font-semibold"
                >
                  <option value="Nhỏ (1-5 người)">Nhỏ (1 - 5 thành viên)</option>
                  <option value="Vừa (5-15 người)">Vừa (5 - 15 thành viên)</option>
                  <option value="Lớn (15-50 người)">Lớn (15 - 50 thành viên)</option>
                  <option value="Doanh nghiệp (>50 người)">Doanh nghiệp (Trên 50 thành viên)</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="label-field">Thời hạn dự án</label>
                <div className="flex gap-2">
                  <input
                    type="number" min={1} max={260}
                    value={editProject.data.durationWeeks || ''}
                    onChange={e => setEditProject(p => ({ ...p, data: { ...p.data, durationWeeks: e.target.value } }))}
                    className="flex-1 input-field font-mono"
                  />
                  <select
                    value={editDurationUnit}
                    onChange={(e) => setEditDurationUnit(e.target.value)}
                    className="px-3 py-2 bg-bg border border-border rounded-lg text-xs text-ink font-semibold focus:outline-none focus:border-accent"
                  >
                    <option value="days">Ngày</option>
                    <option value="weeks">Tuần</option>
                    <option value="months">Tháng</option>
                    <option value="quarters">Quý</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="label-field">Ngày bắt đầu</label>
                <input type="date" value={editProject.data.startDate ? new Date(editProject.data.startDate).toISOString().split('T')[0] : ''}
                  onChange={e => setEditProject(p => ({ ...p, data: { ...p.data, startDate: e.target.value } }))}
                  className="input-field font-mono" />
              </div>
              <div className="space-y-1">
                <label className="label-field">Mức ưu tiên</label>
                <select value={editProject.data.priority || 'Medium'}
                  onChange={e => setEditProject(p => ({ ...p, data: { ...p.data, priority: e.target.value } }))}
                  className="input-field font-semibold">
                  <option value="Low">Thấp</option>
                  <option value="Medium">Trung bình</option>
                  <option value="High">Cao</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="label-field">Trạng thái</label>
                <select value={editProject.data.status || 'active'}
                  onChange={e => setEditProject(p => ({ ...p, data: { ...p.data, status: e.target.value } }))}
                  className="input-field font-semibold">
                  <option value="active">Đang thực hiện</option>
                  <option value="paused">Tạm dừng</option>
                  <option value="done">Hoàn thành</option>
                </select>
              </div>
            </div>
            <div className="space-y-1">
              <label className="label-field">Mô tả</label>
              <textarea rows={2} value={editProject.data.description || ''}
                onChange={e => setEditProject(p => ({ ...p, data: { ...p.data, description: e.target.value } }))}
                className="input-field resize-none leading-relaxed" />
            </div>
            <div className="flex gap-2.5 pt-4 border-t border-border">
              <button type="submit" className="btn-primary">
                Cập nhật dự án
              </button>
              <button type="button" onClick={() => setEditProject(null)} className="btn-secondary">
                Hủy bỏ
              </button>
            </div>
          </form>
        </section>
      )}

      {/* FILTER BAR */}
      <nav className="flex items-center gap-3 flex-wrap pb-1" aria-label="Bộ lọc danh sách dự án">
        <span className="text-xs font-semibold text-sub uppercase tracking-wider flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" /> Bộ lọc:
        </span>
        <div className="flex bg-bg p-1 rounded-lg border border-border">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
              filter === 'all'
                ? 'bg-surface text-accent shadow-sm'
                : 'text-sub hover:text-ink'
            }`}
          >
            Tất cả
          </button>
          {STATUS_OPTIONS.map(({ code, label }) => (
            <button
              key={code}
              onClick={() => setFilter(code)}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                filter === code
                  ? 'bg-surface text-accent shadow-sm'
                  : 'text-sub hover:text-ink'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <span className="ml-auto text-xs text-sub font-mono">{filteredProjects.length} dự án</span>
      </nav>

      {/* PROJECTS LIST GRID */}
      {loading ? (
        <div className="text-center py-20 bg-surface rounded-2xl border border-border">
          <Loader2 className="w-7 h-7 text-accent animate-spin mx-auto mb-3" />
          <p className="text-sub text-xs font-bold tracking-wider uppercase">Đang đồng bộ dữ liệu dự án...</p>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border rounded-2xl bg-surface">
          <Layers className="w-10 h-10 text-sub/50 mx-auto mb-3" />
          <p className="text-ink font-bold text-xs uppercase tracking-wider">Không tìm thấy dự án nào</p>
          <p className="text-sub text-[11px] mt-1 font-medium">Bấm nút "Tạo dự án mới" để bắt đầu khởi tạo kế hoạch làm việc.</p>
        </div>
      ) : (
        <section aria-label="Danh sách các dự án hiện có" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((project) => {
            const status = (project.status || 'active').toLowerCase();
            const priority = (project.priority || 'medium').toLowerCase();

            return (
              <article
                key={project.id}
                onClick={() => onSelectProject(project)}
                className="bg-surface rounded-xl border border-border p-5 md:p-6 shadow-sm hover:border-accent transition-colors duration-150 cursor-pointer group relative flex flex-col justify-between space-y-4 min-h-[215px]"
              >
                <div className="flex items-start justify-between gap-3 pb-2.5 border-b border-border">
                  <div className="space-y-1 flex-1 min-w-0">
                    <h3 className="text-base font-bold text-ink group-hover:text-accent transition-colors truncate">
                      {project.name}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 bg-surface border border-border rounded-lg p-0.5">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleStartEdit(project); }}
                      className="p-1 text-sub hover:text-warning hover:bg-warning-soft rounded transition-colors"
                      title="Chỉnh sửa"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelClick(project, e); }}
                      className="p-1 text-sub hover:text-danger hover:bg-danger-soft rounded transition-colors"
                      title="Xóa"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-sub text-xs font-normal line-clamp-2 leading-relaxed min-h-[36px] py-0.5">
                  {project.description || 'Chưa cập nhật mô tả phạm vi công việc dự án.'}
                </p>

                <div className="flex items-center justify-between gap-2 py-2.5 border-t border-b border-border my-1" onClick={(e) => e.stopPropagation()}>
                  <div>
                    {(() => {
                      const ownerId = project.owner && typeof project.owner === 'object' ? project.owner.id : project.owner;
                      const isPM = project.userRole === 'Project Manager' || (ownerId && user && ownerId.toString() === user.id?.toString());
                      const normalizedPriority = (priority === 'high' || priority === 'urgent') ? 'High' : priority === 'low' ? 'Low' : 'Medium';

                      return (
                        <select
                          value={normalizedPriority}
                          onChange={(e) => isPM && handleUpdatePriority(project.id, e.target.value)}
                          disabled={!isPM}
                          className={`text-[11px] font-bold px-3 py-1 rounded-md border cursor-pointer transition-colors outline-none appearance-none ${
                            normalizedPriority === 'High'
                              ? 'text-danger bg-danger-soft border-danger/20'
                              : normalizedPriority === 'Low'
                              ? 'text-sub bg-bg border-border'
                              : 'text-warning bg-warning-soft border-warning/20'
                          }`}
                        >
                          <option value="High" className="text-danger bg-surface font-bold">Ưu tiên Cao</option>
                          <option value="Medium" className="text-warning bg-surface font-bold">Ưu tiên Vừa</option>
                          <option value="Low" className="text-sub bg-surface font-bold">Ưu tiên Thấp</option>
                        </select>
                      );
                    })()}
                  </div>

                  <div>
                    {(() => {
                      const ownerId = project.owner && typeof project.owner === 'object' ? project.owner.id : project.owner;
                      const isPM = project.userRole === 'Project Manager' || (ownerId && user && ownerId.toString() === user.id?.toString());
                      const normalizedStatus = (status === 'paused' || status === 'on_hold') ? 'paused' : (status === 'done' || status === 'completed') ? 'done' : 'active';

                      return (
                        <select
                          value={normalizedStatus}
                          onChange={(e) => isPM && handleUpdateStatus(project.id, e.target.value)}
                          disabled={!isPM}
                          className={`text-[11px] font-bold px-3 py-1 rounded-md border cursor-pointer transition-colors outline-none appearance-none ${
                            normalizedStatus === 'paused'
                              ? 'text-warning bg-warning-soft border-warning/20'
                              : normalizedStatus === 'done'
                              ? 'text-success bg-success-soft border-success/20'
                              : 'text-accent bg-accent-soft border-accent/20'
                          }`}
                        >
                          <option value="active" className="text-accent bg-surface font-bold">Đang thực hiện</option>
                          <option value="paused" className="text-warning bg-surface font-bold">Tạm dừng</option>
                          <option value="done" className="text-success bg-surface font-bold">Hoàn thành</option>
                        </select>
                      );
                    })()}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 mt-auto border-t border-border text-xs text-sub font-medium">
                  <div className="flex items-center gap-1.5 font-mono">
                    <Clock className="w-3.5 h-3.5 text-sub" />
                    <span>{formatDuration(project.durationWeeks)}</span>
                  </div>
                  <div className="flex items-center gap-1 text-ink font-semibold">
                    <span>Quy mô:</span>
                    <span>{project.scale || 'Vừa (5-15 người)'}</span>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}

      {/* CENTER CONFIRMATION MODAL FOR PROJECT DELETION */}
      {deleteProjectModal.isOpen && (
        <div className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl border border-border shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-danger-soft text-danger border border-danger/20 shrink-0">
                <Trash2 className="w-5 h-5 text-danger" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-ink">Xác nhận xóa dự án</h3>
                <p className="text-xs text-sub mt-1 leading-relaxed">
                  Bạn có chắc chắn muốn xóa dự án "{deleteProjectModal.projectName}"? Thao tác này sẽ xóa toàn bộ dữ liệu công việc liên quan.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
              <button
                onClick={() => setDeleteProjectModal({ isOpen: false, projectId: null, projectName: '' })}
                className="btn-secondary text-xs px-4 py-2"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleConfirmDeleteProject}
                className="btn-danger text-xs px-4 py-2"
              >
                Xóa vĩnh viễn
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </section>
  );
}
