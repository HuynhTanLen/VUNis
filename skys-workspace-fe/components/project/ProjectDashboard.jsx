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
        budget: newProject.budget,
        durationWeeks: newProject.durationWeeks 
          ? (
              newProject.durationUnit === 'weeks' ? Number(newProject.durationWeeks) :
              newProject.durationUnit === 'days' ? Number(newProject.durationWeeks) / 7 :
              newProject.durationUnit === 'months' ? (Number(newProject.durationWeeks) * 30) / 7 :
              (Number(newProject.durationWeeks) * 90) / 7
            )
          : undefined,
        startDate: newProject.startDate || undefined,
        priority: newProject.priority
      });
      setNewProject({ 
        name: '', 
        description: '', 
        budget: '', 
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
        budget: editProject.data.budget,
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

  const handleUpdateStatus = async (projectId, newStatus) => {
    try {
      await updProject(projectId, { status: newStatus });
      setEditingStatus(null);
      setProjects(prev => prev.map(p =>
        p.id === projectId ? { ...p, status: newStatus } : p
      ));
      showToast(`Đã cập nhật trạng thái: ${STATUS_LABEL[newStatus]}`);
    } catch (err) {
      showToast('Cập nhật trạng thái thất bại: ' + (err?.response?.data?.message || err.message), 'error');
    }
  };

  // KPI Calculations
  const countActive = projects.filter(p => (p.status || 'active') === 'active').length;
  const countPaused = projects.filter(p => p.status === 'paused').length;
  const countDone   = projects.filter(p => p.status === 'done').length;

  const filteredProjects = filter === 'all'
    ? projects
    : projects.filter(p => (p.status || 'active') === filter);

  return (
    <section className="space-y-6 max-w-6xl mx-auto w-full px-4 py-6 md:px-8 md:py-10" aria-labelledby="dashboard-title">

      {/* HEADER & BRIEF */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 id="dashboard-title" className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
            Không gian làm việc dự án
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium leading-relaxed">
            Xem danh sách, quản lý tiến độ dự án, cấu trúc ngân sách và phân phối nhiệm vụ nhóm.
          </p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setEditProject(null); }}
          className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold rounded-xl transition-all text-xs shadow-md shadow-indigo-600/10 active:scale-[0.98]"
        >
          <FolderPlus className="w-4 h-4" />
          Tạo dự án mới
        </button>
      </header>

      {/* BENTO GRID METRICS */}
      <section aria-label="Các chỉ số trạng thái dự án" className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { code: 'active', label: 'Đang thực hiện', value: countActive, color: 'bg-indigo-500', desc: 'Dự án đang triển khai', textColor: 'text-indigo-600', ringColor: 'hover:ring-indigo-200' },
          { code: 'paused', label: 'Tạm dừng', value: countPaused, color: 'bg-amber-500', desc: 'Dự án đang chờ duyệt', textColor: 'text-amber-600', ringColor: 'hover:ring-amber-200' },
          { code: 'done', label: 'Hoàn thành', value: countDone, color: 'bg-emerald-500', desc: 'Dự án đã bàn giao', textColor: 'text-emerald-600', ringColor: 'hover:ring-emerald-200' },
        ].map((stat) => {
          const isFilteringThis = filter === stat.code;
          return (
            <div
              key={stat.code}
              onClick={() => setFilter(filter === stat.code ? 'all' : stat.code)}
              className={`p-4 bg-white/70 backdrop-blur-md rounded-2xl border transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md flex flex-col justify-between h-28 hover:-translate-y-0.5 ${stat.ringColor} ${isFilteringThis ? 'ring-2 ring-indigo-600 border-transparent bg-white shadow-md' : 'border-slate-200/60'
                }`}
            >
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</span>
                <span className={`w-2 h-2 rounded-full ${stat.color} shadow-sm`} />
              </div>
              <div className="flex items-baseline justify-between mt-2">
                <div className="text-3xl font-black text-slate-900 tracking-tight">{loading ? '...' : stat.value}</div>
                <span className={`text-[10px] font-bold ${stat.textColor}`}>{stat.desc}</span>
              </div>
            </div>
          );
        })}
      </section>

      {/* CREATE FORM CARD */}
      {showForm && (
        <section aria-label="Biểu mẫu khởi tạo dự án" className="bg-white/90 backdrop-blur-md rounded-2xl border border-indigo-100 p-6 shadow-md space-y-5 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="font-bold text-slate-900 text-xs uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping" />
              Khởi tạo dự án mới
            </h2>
            <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-3 py-1 rounded-full border border-indigo-100">
              Bạn sẽ là PM dự án
            </span>
          </div>

          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tên dự án *</label>
                <input
                  placeholder="VD: Dự án phần mềm kế toán"
                  required
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-50/50 hover:bg-slate-50/80 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-450 focus:bg-white focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100 transition-all font-semibold"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Ngân sách dự kiến (VNĐ)</label>
                <input
                  type="number" min={0}
                  placeholder="VD: 50000000"
                  value={newProject.budget}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val !== '' && Number(val) < 0) return;
                    setNewProject({ ...newProject, budget: val === '' ? '' : Number(val) });
                  }}
                  className="w-full px-3 py-2.5 bg-slate-50/50 hover:bg-slate-50/80 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-450 focus:bg-white focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100 transition-all font-semibold"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Mô tả mục tiêu</label>
              <textarea
                placeholder="Mô tả tóm tắt mục tiêu dự án..."
                value={newProject.description}
                rows={2}
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50/50 hover:bg-slate-50/80 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-450 focus:bg-white focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100 transition-all resize-none font-semibold leading-relaxed"
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Thời hạn dự án</label>
                <div className="flex gap-2">
                  <input
                    type="number" min={1} max={260}
                    placeholder="Nhập số lượng..."
                    value={newProject.durationWeeks}
                    onChange={(e) => setNewProject({ ...newProject, durationWeeks: e.target.value })}
                    className="flex-1 px-3 py-2.5 bg-slate-50/50 hover:bg-slate-50/80 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-450 focus:bg-white focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100 transition-all font-semibold"
                  />
                  <select
                    value={newProject.durationUnit}
                    onChange={(e) => setNewProject({ ...newProject, durationUnit: e.target.value })}
                    className="px-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs text-slate-800 font-bold focus:bg-white focus:outline-none focus:border-indigo-400 transition-all"
                  >
                    <option value="days">Ngày</option>
                    <option value="weeks">Tuần</option>
                    <option value="months">Tháng</option>
                    <option value="quarters">Quý</option>
                  </select>
                </div>
                {newProject.durationWeeks > 0 && (
                  <div className="text-[9px] text-indigo-600 font-bold space-y-0.5">
                    <p>≈ {getDaysCount(newProject.durationWeeks, newProject.durationUnit)} ngày</p>
                    {newProject.startDate && (
                      <p className="text-violet-650">📅 Kết thúc dự kiến: {getExpectedEndDate(newProject.startDate, newProject.durationWeeks, newProject.durationUnit)}</p>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Ngày bắt đầu dự kiến</label>
                <input
                  type="date"
                  value={newProject.startDate}
                  onChange={(e) => setNewProject({ ...newProject, startDate: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-50/50 hover:bg-slate-50/80 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-450 focus:bg-white focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100 transition-all font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Mức độ ưu tiên</label>
                <select
                  value={newProject.priority}
                  onChange={(e) => setNewProject({ ...newProject, priority: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-50/50 hover:bg-slate-50/80 border border-slate-200 rounded-xl text-xs text-slate-850 focus:bg-white focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100 transition-all font-bold"
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
                className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-indigo-600/10 active:scale-[0.98]"
              >
                Khởi tạo dự án
              </button>
              <button 
                type="button" 
                onClick={() => setShowForm(false)} 
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
              >
                Hủy bỏ
              </button>
            </div>
          </form>
        </section>
      )}

      {/* EDIT PROJECT FORM */}
      {editProject && (
        <section aria-label="Biểu mẫu chỉnh sửa dự án" className="bg-white/90 backdrop-blur-md rounded-2xl border border-amber-100 p-6 shadow-md space-y-5">
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
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-100 transition-all font-semibold" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Ngân sách (VNĐ)</label>
                <input type="number" min={0} value={editProject.data.budget || ''}
                  onChange={e => setEditProject(p => ({ ...p, data: { ...p.data, budget: e.target.value } }))}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-100 transition-all font-semibold" />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Thời hạn dự án</label>
                <div className="flex gap-2">
                  <input
                    type="number" min={1} max={260}
                    value={editProject.data.durationWeeks || ''}
                    onChange={e => setEditProject(p => ({ ...p, data: { ...p.data, durationWeeks: e.target.value } }))}
                    className="flex-1 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-100 transition-all font-semibold"
                  />
                  <select
                    value={editDurationUnit}
                    onChange={(e) => setEditDurationUnit(e.target.value)}
                    className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-850 font-bold focus:outline-none focus:border-amber-400 transition-all"
                  >
                    <option value="days">Ngày</option>
                    <option value="weeks">Tuần</option>
                    <option value="months">Tháng</option>
                    <option value="quarters">Quý</option>
                  </select>
                </div>
                {editProject.data.durationWeeks > 0 && (
                  <div className="text-[9px] text-amber-600 font-bold space-y-0.5">
                    <p>≈ {editDurationUnit === 'weeks' ? Number(editProject.data.durationWeeks) * 7 :
                        editDurationUnit === 'days' ? Number(editProject.data.durationWeeks) :
                        editDurationUnit === 'months' ? Number(editProject.data.durationWeeks) * 30 :
                        Number(editProject.data.durationWeeks) * 90} ngày</p>
                    {editProject.data.startDate && (
                      <p className="text-orange-600">📅 Kết thúc dự kiến: {getExpectedEndDate(editProject.data.startDate, editProject.data.durationWeeks, editDurationUnit)}</p>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Ngày bắt đầu</label>
                <input type="date" value={editProject.data.startDate ? new Date(editProject.data.startDate).toISOString().split('T')[0] : ''}
                  onChange={e => setEditProject(p => ({ ...p, data: { ...p.data, startDate: e.target.value } }))}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-100 transition-all font-semibold" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Mức ưu tiên</label>
                <select value={editProject.data.priority || 'Medium'}
                  onChange={e => setEditProject(p => ({ ...p, data: { ...p.data, priority: e.target.value } }))}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-100 transition-all font-bold">
                  <option value="Low">Thấp</option>
                  <option value="Medium">Trung bình</option>
                  <option value="High">Cao</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Trạng thái</label>
                <select value={editProject.data.status || 'active'}
                  onChange={e => setEditProject(p => ({ ...p, data: { ...p.data, status: e.target.value } }))}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-100 transition-all font-bold">
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
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-100 transition-all resize-none font-semibold leading-relaxed" />
            </div>
            <div className="flex gap-2.5 pt-4 border-t border-slate-100">
              <button type="submit" className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-xl text-xs transition-all shadow-md active:scale-[0.98]">
                Cập nhật dự án
              </button>
              <button type="button" onClick={() => setEditProject(null)} className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors">
                Hủy
              </button>
            </div>
          </form>
        </section>
      )}

      {/* FILTER BAR */}
      <nav className="flex items-center gap-2 flex-wrap pb-1" aria-label="Bộ lọc danh sách dự án">
        <span className="text-[10px] font-bold text-slate-455 uppercase tracking-widest mr-1">Bộ lọc dự án:</span>
        <div className="flex bg-slate-200/50 p-1 rounded-xl border border-slate-200/40">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filter === 'all'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Tất cả
          </button>
          {STATUS_OPTIONS.map(({ code, label }) => (
            <button
              key={code}
              onClick={() => setFilter(code)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filter === code
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <span className="ml-auto text-[10px] text-slate-455 font-bold uppercase tracking-widest">{filteredProjects.length} dự án</span>
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
            const status = project.status || 'active';
            const hasBudget = project.budget !== undefined && project.budget !== null;
            return (
              <article
                key={project.id}
                onClick={() => onSelectProject(project)}
                className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/70 hover:border-indigo-200 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer group relative flex flex-col justify-between overflow-hidden shadow-2xs hover:shadow-md"
              >
                {/* Visual Accent Ribbon */}
                <div className={`h-1.5 w-full ${STATUS_DOT[status]} opacity-80`} />

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-700 transition-colors line-clamp-1 pr-14 tracking-tight leading-snug">
                        {project.name}
                      </h3>
                      <div className="absolute top-4 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleStartEdit(project); }}
                          className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 border border-transparent hover:border-amber-100 rounded-lg transition-all"
                          title="Chỉnh sửa dự án"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDelClick(project, e);
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 rounded-lg transition-all"
                          title="Xóa dự án"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className="text-slate-500 text-[11px] font-medium line-clamp-2 leading-relaxed">
                      {project.description || 'Chưa cập nhật mục tiêu và phạm vi công việc của dự án.'}
                    </p>

                    {project.priority && (
                      <span className={`inline-block text-[9px] font-black px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${
                        project.priority === 'High' ? 'bg-rose-50 text-rose-700 border-rose-100':
                        project.priority === 'Low' ? 'bg-slate-100 text-slate-600 border-slate-200':
                        'bg-indigo-50 text-indigo-700 border-indigo-100'
                      }`}>
                        {project.priority === 'High' ? 'Cao' : project.priority === 'Low' ? 'Thấp': 'Trung bình'}
                      </span>
                    )}
                  </div>

                  {/* Status update selector */}
                  <div className="pt-1" onClick={(e) => e.stopPropagation()}>
                    {(() => {
                      const ownerId = project.owner && typeof project.owner === 'object' ? project.owner.id : project.owner;
                      const isPM = project.userRole === 'Project Manager' || (ownerId && user && ownerId.toString() === user.id?.toString());

                      if (editingStatus === project.id) {
                        return (
                          <div className="flex gap-1 flex-wrap">
                            {STATUS_OPTIONS.map(({ code, label }) => (
                              <button
                                key={code}
                                onClick={() => handleUpdateStatus(project.id, code)}
                                className={`text-[9px] font-bold px-2.5 py-1 rounded-lg border transition-all ${STATUS_STYLE[code]}`}
                              >
                                {label}
                              </button>
                            ))}
                            <button
                              onClick={() => setEditingStatus(null)}
                              className="text-[9px] font-bold px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 text-slate-500"
                            >
                              Hủy
                            </button>
                          </div>
                        );
                      }

                      if (isPM) {
                        return (
                          <button
                            onClick={() => setEditingStatus(project.id)}
                            className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-3 py-1 rounded-full border ${STATUS_STYLE[status] || STATUS_STYLE.active} hover:opacity-80 transition-all shadow-3xs`}
                            title="Thay đổi trạng thái"
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[status]}`} />
                            {STATUS_LABEL[status] || 'Đang thực hiện'}
                          </button>
                        );
                      }

                      // Nếu không phải PM -> chỉ hiển thị nhãn tĩnh không cho click
                      return (
                        <span
                          className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-3 py-1 rounded-full border ${STATUS_STYLE[status] || STATUS_STYLE.active}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[status]}`} />
                          {STATUS_LABEL[status] || 'Đang thực hiện'}
                        </span>
                      );
                    })()}
                  </div>

                  {/* Metadata info */}
                  <div className="grid grid-cols-2 gap-2 pt-3.5 border-t border-slate-100 text-[10px] font-bold text-slate-455 uppercase tracking-wider">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        {formatDuration(project.durationWeeks)}
                      </span>
                    </div>
                    <div className="flex items-center justify-end gap-0.5 text-slate-700 font-extrabold">
                      {hasBudget ? (
                        <span>
                          {Number(project.budget).toLocaleString()} đ
                        </span>
                      ) : (
                        <span className="text-slate-400 font-semibold flex items-center gap-0.5 lowercase normal-case">
                          <ShieldCheck className="w-3.5 h-3.5 text-slate-350" />
                          bảo mật
                        </span>
                      )}
                    </div>
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
