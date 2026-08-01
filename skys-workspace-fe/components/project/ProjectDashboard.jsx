// Reading this as: Project Management Workspace for team collaborators, with a calm, high-density light minimalist language, leaning toward Tailwind UI + Geist/Outfit + fluid glassmorphism accents.
// DESIGN_VARIANCE: 5, MOTION_INTENSITY: 4, VISUAL_DENSITY: 7

import { useState, useEffect } from 'react';
import { getProjects, createProject, delProject, updProject } from '../../services/projectService';
import Toast from '../ui/Toast';
import { 
  FolderPlus, Trash2, Calendar, ShieldCheck, 
  Loader2, Clock, Layers
} from 'lucide-react';

const STATUS_OPTIONS = [
  { code: 'active',  label: 'Đang thực hiện' },
  { code: 'paused',  label: 'Tạm dừng' },
  { code: 'done',    label: 'Hoàn thành' },
];

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

import { useAuth } from '../../hooks/useAuth';

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
  
  const [editProject, setEditProject] = useState(null); // {id, data}
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

  const getExpectedEndDate = (startDateStr, duration, unit = 'weeks') => {
    if (!startDateStr || !duration || isNaN(duration) || duration <= 0) return null;
    const start = new Date(startDateStr);
    if (isNaN(start.getTime())) return null;
    const end = new Date(start);
    
    const num = Number(duration);
    if (unit === 'days') {
      end.setDate(end.getDate() + num);
    } else if (unit === 'weeks') {
      end.setDate(end.getDate() + num * 7);
    } else if (unit === 'months') {
      end.setMonth(end.getMonth() + num);
    } else if (unit === 'quarters') {
      end.setMonth(end.getMonth() + num * 3);
    }
    
    return end.toLocaleDateString('vi-VN');
  };

  const getDaysCount = (duration, unit) => {
    const num = Number(duration);
    if (unit === 'days') return num;
    if (unit === 'weeks') return num * 7;
    if (unit === 'months') return num * 30;
    if (unit === 'quarters') return num * 90;
    return 0;
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
        durationWeeks: duration // Gán số lượng đã được quy đổi ngược thành số nguyên đẹp
      }
    });
    setShowForm(false);
  };

  const formatDuration = (weeks) => {
    if (!weeks) return 'Chưa đặt thời gian';
    const totalDays = Math.round(Number(weeks) * 7);

    // Nếu dưới 7 ngày -> chỉ hiển thị số ngày
    if (totalDays < 7) {
      return `${totalDays} ngày`;
    }

    // Nếu chẵn tháng -> hiển thị số tháng
    if (totalDays % 30 === 0) {
      const months = totalDays / 30;
      return `${months} tháng (${totalDays} ngày)`;
    }

    // Nếu chẵn tuần -> hiển thị số tuần
    if (totalDays % 7 === 0) {
      const w = totalDays / 7;
      return `${w} tuần (${totalDays} ngày)`;
    }

    // Nếu lẻ ngày (ví dụ 10 ngày) -> chỉ hiển thị số ngày
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

  // KPI Calculations
  const countActive = projects.filter(p => normalizeStatus(p.status) === 'active').length;
  const countPaused = projects.filter(p => normalizeStatus(p.status) === 'paused').length;
  const countDone   = projects.filter(p => normalizeStatus(p.status) === 'done').length;

  const filteredProjects = filter === 'all'
    ? projects
    : projects.filter(p => normalizeStatus(p.status) === filter);

  return (
    <section className="space-y-6 max-w-6xl mx-auto w-full px-4 py-6 md:px-8 md:py-10" aria-labelledby="dashboard-title">

      {/* HEADER & BRIEF */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 id="dashboard-title" className="text-xl font-bold text-slate-900 tracking-tight">
            Dự án & Không gian làm việc
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-normal leading-relaxed">
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

      {/* BENTO GRID METRICS */}
      <section aria-label="Các chỉ số trạng thái dự án" className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { code: 'active', label: 'Đang thực hiện', value: countActive, topBorder: 'border-t-2 border-indigo-600', desc: 'Dự án đang triển khai', textColor: 'text-indigo-600' },
          { code: 'paused', label: 'Tạm dừng', value: countPaused, topBorder: 'border-t-2 border-amber-500', desc: 'Dự án đang chờ duyệt', textColor: 'text-amber-600' },
          { code: 'done', label: 'Hoàn thành', value: countDone, topBorder: 'border-t-2 border-emerald-600', desc: 'Dự án đã hoàn tất', textColor: 'text-emerald-600' },
        ].map((stat) => {
          const isFilteringThis = filter === stat.code;
          return (
            <div
              key={stat.code}
              onClick={() => setFilter(filter === stat.code ? 'all' : stat.code)}
              className={`bg-white rounded-xl border p-5 shadow-sm transition-all duration-200 cursor-pointer ${stat.topBorder} ${
                isFilteringThis ? 'border-indigo-500 shadow-md ring-1 ring-indigo-500' : 'border-slate-200/80 hover:border-slate-300 hover:shadow-md'
              }`}
            >
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{stat.label}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  stat.code === 'active' ? 'bg-indigo-50 text-indigo-700' :
                  stat.code === 'paused' ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'
                }`}>
                  ● {stat.desc}
                </span>
              </div>
              <div className="text-3xl font-bold text-slate-900 tracking-tight">
                {loading ? '...' : stat.value}
              </div>
            </div>
          );
        })}
      </section>

      {/* CREATE FORM CARD */}
      {showForm && (
        <section aria-label="Biểu mẫu khởi tạo dự án" className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="font-bold text-slate-900 text-xs uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-600" />
              Khởi tạo dự án mới
            </h2>
            <span className="badge-soft badge-soft-indigo">
              Bạn sẽ là PM dự án
            </span>
          </div>

          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tên dự án *</label>
                <input
                  placeholder="VD: Nâng cấp Hệ thống Bán hàng Mobile"
                  required
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  className="input-enterprise font-semibold"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Quy mô dự án</label>
                <select
                  value={newProject.scale || 'Vừa (5-15 người)'}
                  onChange={(e) => setNewProject({ ...newProject, scale: e.target.value })}
                  className="input-enterprise font-semibold"
                >
                  <option value="Nhỏ (1-5 người)">Nhỏ (1 - 5 thành viên)</option>
                  <option value="Vừa (5-15 người)">Vừa (5 - 15 thành viên)</option>
                  <option value="Lớn (15-50 người)">Lớn (15 - 50 thành viên)</option>
                  <option value="Doanh nghiệp (>50 người)">Doanh nghiệp (Trên 50 thành viên)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Mô tả mục tiêu dự án</label>
              <textarea
                placeholder="Mô tả tóm tắt mục tiêu và phạm vi dự án..."
                value={newProject.description}
                rows={2}
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                className="input-enterprise resize-none leading-relaxed"
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Thời hạn dự án</label>
                <div className="flex gap-2">
                  <input
                    type="number" min={1} max={260}
                    placeholder="Số lượng..."
                    value={newProject.durationWeeks}
                    onChange={(e) => setNewProject({ ...newProject, durationWeeks: e.target.value })}
                    className="flex-1 input-enterprise"
                  />
                  <select
                    value={newProject.durationUnit}
                    onChange={(e) => setNewProject({ ...newProject, durationUnit: e.target.value })}
                    className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 font-semibold focus:outline-none focus:border-indigo-500"
                  >
                    <option value="days">Ngày</option>
                    <option value="weeks">Tuần</option>
                    <option value="months">Tháng</option>
                    <option value="quarters">Quý</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Ngày bắt đầu dự kiến</label>
                <input
                  type="date"
                  value={newProject.startDate}
                  onChange={(e) => setNewProject({ ...newProject, startDate: e.target.value })}
                  className="input-enterprise"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Mức độ ưu tiên</label>
                <select
                  value={newProject.priority}
                  onChange={(e) => setNewProject({ ...newProject, priority: e.target.value })}
                  className="input-enterprise font-semibold"
                >
                  <option value="Low">Thấp</option>
                  <option value="Medium">Trung bình</option>
                  <option value="High">Cao</option>
                </select>
              </div>
            </div>
            
            <div className="flex gap-2.5 pt-4 border-t border-slate-100">
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
        <section aria-label="Biểu mẫu chỉnh sửa dự án" className="bg-white rounded-xl border border-amber-200/80 p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="font-bold text-slate-900 text-xs uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Chỉnh sửa: {editProject.data.name}
            </h2>
            <button onClick={() => setEditProject(null)} className="text-slate-400 hover:text-slate-700 text-xs font-bold">✕ Đóng</button>
          </div>
          <form onSubmit={handleUpdateProject} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tên dự án *</label>
                <input required value={editProject.data.name}
                  onChange={e => setEditProject(p => ({ ...p, data: { ...p.data, name: e.target.value } }))}
                  className="input-enterprise" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Quy mô dự án</label>
                <select
                  value={editProject.data.scale || 'Vừa (5-15 người)'}
                  onChange={e => setEditProject(p => ({ ...p, data: { ...p.data, scale: e.target.value } }))}
                  className="input-enterprise font-semibold"
                >
                  <option value="Nhỏ (1-5 người)">Nhỏ (1 - 5 thành viên)</option>
                  <option value="Vừa (5-15 người)">Vừa (5 - 15 thành viên)</option>
                  <option value="Lớn (15-50 người)">Lớn (15 - 50 thành viên)</option>
                  <option value="Doanh nghiệp (>50 người)">Doanh nghiệp (Trên 50 thành viên)</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Thời hạn dự án</label>
                <div className="flex gap-2">
                  <input
                    type="number" min={1} max={260}
                    value={editProject.data.durationWeeks || ''}
                    onChange={e => setEditProject(p => ({ ...p, data: { ...p.data, durationWeeks: e.target.value } }))}
                    className="flex-1 input-enterprise"
                  />
                  <select
                    value={editDurationUnit}
                    onChange={(e) => setEditDurationUnit(e.target.value)}
                    className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 font-semibold focus:outline-none focus:border-indigo-500"
                  >
                    <option value="days">Ngày</option>
                    <option value="weeks">Tuần</option>
                    <option value="months">Tháng</option>
                    <option value="quarters">Quý</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Ngày bắt đầu</label>
                <input type="date" value={editProject.data.startDate ? new Date(editProject.data.startDate).toISOString().split('T')[0] : ''}
                  onChange={e => setEditProject(p => ({ ...p, data: { ...p.data, startDate: e.target.value } }))}
                  className="input-enterprise" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Mức ưu tiên</label>
                <select value={editProject.data.priority || 'Medium'}
                  onChange={e => setEditProject(p => ({ ...p, data: { ...p.data, priority: e.target.value } }))}
                  className="input-enterprise font-semibold">
                  <option value="Low">Thấp</option>
                  <option value="Medium">Trung bình</option>
                  <option value="High">Cao</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Trạng thái</label>
                <select value={editProject.data.status || 'active'}
                  onChange={e => setEditProject(p => ({ ...p, data: { ...p.data, status: e.target.value } }))}
                  className="input-enterprise font-semibold">
                  <option value="active">Đang thực hiện</option>
                  <option value="paused">Tạm dừng</option>
                  <option value="done">Hoàn thành</option>
                </select>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Mô tả</label>
              <textarea rows={2} value={editProject.data.description || ''}
                onChange={e => setEditProject(p => ({ ...p, data: { ...p.data, description: e.target.value } }))}
                className="input-enterprise resize-none leading-relaxed" />
            </div>
            <div className="flex gap-2.5 pt-4 border-t border-slate-100">
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
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Bộ lọc dự án:</span>
        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200/60">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
              filter === 'all'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Tất cả
          </button>
          {STATUS_OPTIONS.map(({ code, label }) => (
            <button
              key={code}
              onClick={() => setFilter(code)}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                filter === code
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <span className="ml-auto text-xs text-slate-400 font-medium">{filteredProjects.length} dự án</span>
      </nav>

      {/* PROJECTS LIST GRID */}
      {loading ? (
        <div className="text-center py-20 bg-white/50 backdrop-blur-md rounded-2xl border border-slate-200/60">
          <Loader2 className="w-7 h-7 text-indigo-600 animate-spin mx-auto mb-3" />
          <p className="text-slate-500 text-xs font-bold tracking-wider uppercase">Đang đồng bộ dữ liệu dự án...</p>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-slate-300 rounded-2xl bg-white/40 backdrop-blur-md">
          <Layers className="w-10 h-10 text-slate-350 mx-auto mb-3" />
          <p className="text-slate-650 font-bold text-xs uppercase tracking-wider">Không tìm thấy dự án nào</p>
          <p className="text-slate-455 text-[11px] mt-1 font-medium">Bấm nút "Tạo dự án mới" để bắt đầu khởi tạo kế hoạch làm việc.</p>
        </div>
      ) : (
        <section aria-label="Danh sách các dự án hiện có" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((project) => {
            const status = (project.status || 'active').toLowerCase();
            const priority = (project.priority || 'medium').toLowerCase();
            const projectKey = project.key || `PRJ-${(project.id || '').toString().slice(-4).toUpperCase()}`;

            return (
              <article
                key={project.id}
                onClick={() => onSelectProject(project)}
                className="bg-white rounded-xl border-2 border-slate-300 p-5 md:p-6 shadow-sm hover:border-indigo-600 hover:shadow-md transition-all duration-150 cursor-pointer group relative flex flex-col justify-between space-y-4 min-h-[215px]"
              >
                {/* Header: Title + Action Buttons */}
                <div className="flex items-start justify-between gap-3 pb-2.5 border-b-2 border-slate-200">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                      {project.name}
                    </h3>
                  </div>

                  {/* Actions overlay */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 bg-white border border-slate-300 rounded-lg p-0.5 shadow-2xs">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleStartEdit(project); }}
                      className="p-1 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors"
                      title="Chỉnh sửa"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelClick(project, e); }}
                      className="p-1 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                      title="Xóa"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Description */}
                <p className="text-slate-600 text-xs font-normal line-clamp-2 leading-relaxed min-h-[36px] py-0.5">
                  {project.description || 'Chưa cập nhật mô tả phạm vi công việc dự án.'}
                </p>

                {/* Native Badge Selectors (Priority & Status - Sharp 2px Borders) */}
                <div className="flex items-center justify-between gap-2 py-2.5 border-t-2 border-b-2 border-slate-200 my-1" onClick={(e) => e.stopPropagation()}>
                  
                  {/* Priority Select */}
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
                          className={`text-[11px] font-bold px-3 py-1 rounded-md border-2 cursor-pointer transition-colors outline-none appearance-none ${
                            normalizedPriority === 'High'
                              ? 'text-rose-700 bg-rose-50 border-rose-300 hover:bg-rose-100'
                              : normalizedPriority === 'Low'
                              ? 'text-slate-700 bg-slate-100 border-slate-300 hover:bg-slate-200'
                              : 'text-amber-800 bg-amber-50 border-amber-300 hover:bg-amber-100'
                          }`}
                        >
                          <option value="High" className="text-rose-700 bg-white font-bold">Ưu tiên Cao</option>
                          <option value="Medium" className="text-amber-800 bg-white font-bold">Ưu tiên Vừa</option>
                          <option value="Low" className="text-slate-700 bg-white font-bold">Ưu tiên Thấp</option>
                        </select>
                      );
                    })()}
                  </div>

                  {/* Status Select */}
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
                          className={`text-[11px] font-bold px-3 py-1 rounded-md border-2 cursor-pointer transition-colors outline-none appearance-none ${
                            normalizedStatus === 'paused'
                              ? 'text-amber-800 bg-amber-50 border-amber-300 hover:bg-amber-100'
                              : normalizedStatus === 'done'
                              ? 'text-blue-700 bg-blue-50 border-blue-300 hover:bg-blue-100'
                              : 'text-emerald-700 bg-emerald-50 border-emerald-300 hover:bg-emerald-100'
                          }`}
                        >
                          <option value="active" className="text-emerald-700 bg-white font-bold">Đang thực hiện</option>
                          <option value="paused" className="text-amber-800 bg-white font-bold">Tạm dừng</option>
                          <option value="done" className="text-blue-700 bg-white font-bold">Hoàn thành</option>
                        </select>
                      );
                    })()}
                  </div>
                </div>

                {/* Footer Info: Duration & Scale */}
                <div className="flex items-center justify-between pt-3 mt-auto border-t-2 border-slate-200 text-xs text-slate-600 font-medium">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>{formatDuration(project.durationWeeks)}</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-800 font-bold">
                    <span>Quy mô:</span>
                    <span className="text-slate-900">{project.scale || 'Vừa (5-15 người)'}</span>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}

      {/* CENTER CONFIRMATION MODAL FOR PROJECT DELETION */}
      {deleteProjectModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 shrink-0">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">Xác nhận xóa dự án</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Bạn có chắc chắn muốn xóa dự án "{deleteProjectModal.projectName}"? Thao tác này sẽ xóa toàn bộ dữ liệu công việc liên quan.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setDeleteProjectModal({ isOpen: false, projectId: null, projectName: '' })}
                className="btn-secondary-clean text-xs px-4 py-2"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleConfirmDeleteProject}
                className="btn-primary-clean bg-rose-600 hover:bg-rose-700 text-xs px-4 py-2"
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
