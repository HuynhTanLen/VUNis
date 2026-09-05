import { useState, useEffect } from 'react';
import { getSprintsByProject, createSprint, completeSprint, startSprint } from '../../services/sprintService';
import { Rocket, Plus, CheckCircle2, PlayCircle, Calendar, Loader2, X } from 'lucide-react';
import Toast from '../ui/Toast';

export default function SprintManager({ projectId }) {
    const [sprints, setSprints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [name, setName] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [completeModal, setCompleteModal] = useState({ isOpen: false, sprintId: null, sprintName: '' });
    const [startingSprintId, setStartingSprintId] = useState(null);
    const [toast, setToast] = useState(null);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    useEffect(() => {
        loadSprints();
    }, [projectId]);

    const loadSprints = async () => {
        try {
            setLoading(true);
            const data = await getSprintsByProject(projectId);
            setSprints(data);
        } catch (error) {
            console.error("Error fetching Sprints:", error);
            showToast('Failed to load sprints.', 'error');
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
            showToast('Sprint created successfully.');
        } catch (error) {
            console.error("Error creating Sprint:", error);
            showToast(error?.response?.data?.message || 'Failed to create sprint.', 'error');
        }
    };

    const handleStartSprint = async (sprint) => {
        try {
            setStartingSprintId(sprint.id);
            await startSprint(sprint.id);
            loadSprints();
            showToast(`Sprint "${sprint.name}" started.`);
        } catch (error) {
            console.error("Error starting Sprint:", error);
            showToast(error?.response?.data?.message || 'Failed to start sprint.', 'error');
        } finally {
            setStartingSprintId(null);
        }
    };

    const handleConfirmComplete = async () => {
        if (!completeModal.sprintId) return;
        try {
            await completeSprint(completeModal.sprintId);
            setCompleteModal({ isOpen: false, sprintId: null, sprintName: '' });
            loadSprints();
            showToast('Sprint marked as completed.');
        } catch (error) {
            console.error("Error completing Sprint:", error);
            showToast(error?.response?.data?.message || 'Failed to complete sprint.', 'error');
            setCompleteModal({ isOpen: false, sprintId: null, sprintName: '' });
        }
    };

    if (loading) {
        return (
            <div className="card-clean p-16 flex flex-col items-center justify-center">
                <Loader2 className="w-6 h-6 text-accent animate-spin mb-2" />
                <p className="text-sub text-xs font-medium uppercase tracking-wider">Loading Sprints...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 relative">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-surface p-5 border-b border-border">
                <div>
                    <h3 className="text-xl font-semibold text-ink">
                        Backlog & Sprints
                    </h3>
                    <p className="text-sm text-sub mt-1">Manage your team's agile backlog and active sprints</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="btn-secondary flex items-center gap-1.5 shrink-0"
                >
                    <Plus className="w-4 h-4" />
                    <span>Create Sprint</span>
                </button>
            </div>

            {showForm && (
                <div className="card-clean p-5 space-y-4">
                    <div className="flex items-center justify-between border-b border-border pb-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-ink">Create New Sprint</h4>
                        <button onClick={() => setShowForm(false)} className="text-sub hover:text-ink transition-colors focus:outline-none focus:ring-2 focus:ring-accent/20 rounded-md p-1">
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <form onSubmit={handleCreate} className="space-y-4">
                        <div>
                            <label className="label-field">Sprint Name</label>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g., Sprint 1 - UI/UX Design & Registration API"
                                className="input-field"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="label-field">Start Date</label>
                                <input type="date" required value={startDate} onChange={(e) => setStartDate(e.target.value)} className="input-field font-mono" />
                            </div>
                            <div>
                                <label className="label-field">Estimated End Date</label>
                                <input type="date" required value={endDate} onChange={(e) => setEndDate(e.target.value)} className="input-field font-mono" />
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
                            <button type="submit" className="btn-primary">Save Sprint</button>
                        </div>
                    </form>
                </div>
            )}

            {sprints.length === 0 ? (
                <div className="card-clean p-12 text-center text-sub">
                    <Rocket className="w-8 h-8 text-sub mx-auto mb-2" />
                    <p className="text-xs font-semibold uppercase tracking-wider text-ink">No Sprints Yet</p>
                    <p className="text-xs mt-1">Click "Create Sprint" above to start your first development cycle.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {sprints.map((sprint) => {
                        const status = sprint.status || 'PLANNING';
                        const isPlanning = status === 'PLANNING';
                        const isActive = status === 'ACTIVE';
                        const isCompleted = status === 'COMPLETED' || status === 'CLOSED';
                        const STATUS_BADGE = {
                            PLANNING: 'bg-bg text-sub border border-border',
                            ACTIVE: 'bg-accent-soft text-accent',
                            COMPLETED: 'bg-success-soft text-success',
                            CLOSED: 'bg-success-soft text-success',
                        };
                        const STATUS_LABEL = { PLANNING: 'Planning', ACTIVE: 'Active', COMPLETED: 'Completed', CLOSED: 'Closed' };
                        return (
                            <div key={sprint.id} className="bg-surface rounded-md border border-border p-4 space-y-4">
                                <div className="flex items-start justify-between gap-3 border-b border-border pb-3">
                                    <div className="flex items-center gap-3">
                                        <h4 className="text-sm font-semibold text-ink">{sprint.name}</h4>
                                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${STATUS_BADGE[status] || STATUS_BADGE.PLANNING}`}>
                                            {STATUS_LABEL[status] || status}
                                        </span>
                                    </div>

                                    {isPlanning && (
                                        <button
                                            onClick={() => handleStartSprint(sprint)}
                                            disabled={startingSprintId === sprint.id}
                                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-accent border border-accent/30 rounded-lg hover:bg-accent-soft transition-colors focus:outline-none focus:ring-2 focus:ring-accent/20 shrink-0 disabled:opacity-50"
                                        >
                                            {startingSprintId === sprint.id
                                                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                : <PlayCircle className="w-3.5 h-3.5" />}
                                            <span>Start</span>
                                        </button>
                                    )}
                                    {isActive && (
                                        <button
                                            onClick={() => setCompleteModal({ isOpen: true, sprintId: sprint.id, sprintName: sprint.name })}
                                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-success border border-success/30 rounded-lg hover:bg-success-soft transition-colors focus:outline-none focus:ring-2 focus:ring-success/20 shrink-0"
                                        >
                                            <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                                            <span>Complete</span>
                                        </button>
                                    )}
                                </div>

                                <div className="flex flex-wrap items-center gap-4 text-xs text-sub pt-2 border-t border-border">
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="w-3.5 h-3.5 text-sub" />
                                        <span>
                                            {new Date(sprint.startDate).toLocaleDateString('en-US')} - {new Date(sprint.endDate).toLocaleDateString('en-US')}
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
                                <h3 className="text-sm font-bold text-ink">Confirm Sprint Completion</h3>
                                <p className="text-xs text-sub mt-1">
                                    Are you sure you want to complete "{completeModal.sprintName}"? The sprint status will change to "Completed".
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                            <button
                                onClick={() => setCompleteModal({ isOpen: false, sprintId: null, sprintName: '' })}
                                className="btn-secondary text-xs px-4 py-2"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmComplete}
                                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-success text-white text-xs font-semibold rounded-lg hover:bg-success/90 focus:outline-none focus:ring-2 focus:ring-success/40 transition-colors"
                            >
                                Complete Sprint
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
}
