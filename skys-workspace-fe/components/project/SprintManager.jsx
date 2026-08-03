import { useState, useEffect } from 'react';
import { getSprintsByProject, createSprint, completeSprint } from '../../services/sprintService';
import { Rocket, Plus, CheckCircle2, Calendar, Clock, Loader2, Sparkles, AlertCircle, X } from 'lucide-react';

export default function SprintManager({ projectId }) {
    const [sprints, setSprints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [name, setName] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [completeModal, setCompleteModal] = useState({ isOpen: false, sprintId: null, sprintName: '' });

    useEffect(() => {
        loadSprints();
    }, [projectId]);

    const loadSprints = async () => {
        try {
            setLoading(true);
            const data = await getSprintsByProject(projectId);
            setSprints(data);
        } catch (error) {
            console.error("Lỗi lấy danh sách Sprint:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await createSprint(projectId, { name, startDate, endDate });
            setShowForm(false);
            setName('');
            setStartDate('');
            setEndDate('');
            loadSprints();
        } catch (error) {
            console.error("Lỗi tạo Sprint:", error);
        }
    };

    const handleConfirmComplete = async () => {
        if (!completeModal.sprintId) return;
        try {
            await completeSprint(completeModal.sprintId);
            setCompleteModal({ isOpen: false, sprintId: null, sprintName: '' });
            loadSprints();
        } catch (error) {
            console.error("Lỗi cập nhật Sprint:", error);
            setCompleteModal({ isOpen: false, sprintId: null, sprintName: '' });
        }
    };

    if (loading) {
        return (
            <div className="card-clean p-16 flex flex-col items-center justify-center">
                <Loader2 className="w-6 h-6 text-accent animate-spin mb-2" />
                <p className="text-sub text-xs font-medium uppercase tracking-wider">Đang tải danh sách Sprint...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 relative">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-surface p-5 rounded-xl border border-border shadow-sm">
                <div>
                    <h3 className="text-sm font-bold text-ink flex items-center gap-2">
                        <Rocket className="w-4 h-4 text-accent" />
                        Quản lý Sprint & Chu kỳ phát triển
                    </h3>
                    <p className="text-xs text-sub mt-1">Chia nhỏ dự án thành các đợt phát triển ngắn hạn (Agile/Scrum)</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="btn-primary flex items-center gap-1.5 shrink-0"
                >
                    <Plus className="w-4 h-4" />
                    <span>Tạo Sprint mới</span>
                </button>
            </div>

            {showForm && (
                <div className="card-clean p-5 space-y-4">
                    <div className="flex items-center justify-between border-b border-border pb-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-ink">Tạo chu kỳ Sprint mới</h4>
                        <button onClick={() => setShowForm(false)} className="text-sub hover:text-ink transition-colors focus:outline-none focus:ring-2 focus:ring-accent/20 rounded-md p-1">
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <form onSubmit={handleCreate} className="space-y-4">
                        <div>
                            <label className="label-field">Tên Sprint</label>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Ví dụ: Sprint 1 - Thiết kế UI/UX & API Đăng ký"
                                className="input-field"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="label-field">Ngày bắt đầu</label>
                                <input type="date" required value={startDate} onChange={(e) => setStartDate(e.target.value)} className="input-field font-mono" />
                            </div>
                            <div>
                                <label className="label-field">Ngày kết thúc dự kiến</label>
                                <input type="date" required value={endDate} onChange={(e) => setEndDate(e.target.value)} className="input-field font-mono" />
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Hủy</button>
                            <button type="submit" className="btn-primary">Lưu Sprint</button>
                        </div>
                    </form>
                </div>
            )}

            {sprints.length === 0 ? (
                <div className="card-clean p-12 text-center text-sub">
                    <Rocket className="w-8 h-8 text-sub mx-auto mb-2" />
                    <p className="text-xs font-semibold uppercase tracking-wider text-ink">Chưa có Sprint nào</p>
                    <p className="text-xs mt-1">Bấm nút "Tạo Sprint mới" ở trên để bắt đầu đợt phát triển đầu tiên.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {sprints.map((sprint) => {
                        const isCompleted = sprint.status === 'Completed';
                        return (
                            <div key={sprint.id} className="card-clean p-5 space-y-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                                            isCompleted ? 'bg-success-soft text-success border-success/20' : 'bg-accent-soft text-accent border-accent/20'
                                        }`}>
                                            {isCompleted ? 'Hoàn thành' : 'Đang diễn ra'}
                                        </span>
                                        <h4 className="text-sm font-bold text-ink mt-2">{sprint.name}</h4>
                                    </div>

                                    {!isCompleted && (
                                        <button
                                            onClick={() => setCompleteModal({ isOpen: true, sprintId: sprint.id, sprintName: sprint.name })}
                                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-success border border-success/30 rounded-lg hover:bg-success-soft transition-colors focus:outline-none focus:ring-2 focus:ring-success/20 shrink-0"
                                        >
                                            <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                                            <span>Hoàn tất</span>
                                        </button>
                                    )}
                                </div>

                                <div className="flex flex-wrap items-center gap-4 text-xs text-sub pt-2 border-t border-border">
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="w-3.5 h-3.5 text-sub" />
                                        <span className="font-mono">
                                            {new Date(sprint.startDate).toLocaleDateString('vi-VN')} - {new Date(sprint.endDate).toLocaleDateString('vi-VN')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {completeModal.isOpen && (
                <div className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-surface rounded-2xl border border-border shadow-xl max-w-md w-full p-6 space-y-4">
                        <div className="flex items-start gap-3">
                            <div className="p-2.5 rounded-xl bg-success-soft text-success border border-success/20 shrink-0">
                                <CheckCircle2 className="w-5 h-5 text-success" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-ink">Xác nhận hoàn tất Sprint</h3>
                                <p className="text-xs text-sub mt-1">
                                    Bạn có chắc chắn muốn kết thúc "{completeModal.sprintName}"? Trạng thái Sprint sẽ chuyển thành "Hoàn thành".
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                            <button
                                onClick={() => setCompleteModal({ isOpen: false, sprintId: null, sprintName: '' })}
                                className="btn-secondary text-xs px-4 py-2"
                            >
                                Hủy bỏ
                            </button>
                            <button
                                onClick={handleConfirmComplete}
                                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-success text-white text-xs font-semibold rounded-lg hover:bg-success/90 focus:outline-none focus:ring-2 focus:ring-success/40 transition-colors"
                            >
                                Hoàn tất Sprint
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
