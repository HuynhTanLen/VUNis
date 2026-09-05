import { useState } from 'react';
import { X, Trash2 } from 'lucide-react';

/** Shared create/edit modal for a single ProjectPhase — used by both the V-Model and Spiral diagrams. */
export default function PhaseFormModal({ phase, projectId, nextOrder, onSave, onDelete, onClose }) {
  const isEdit = Boolean(phase);
  const [form, setForm] = useState({
    name: phase?.name || '',
    startDate: phase?.startDate ? new Date(phase.startDate).toISOString().split('T')[0] : '',
    endDate: phase?.endDate ? new Date(phase.endDate).toISOString().split('T')[0] : '',
    estimatedCost: phase?.estimatedCost || '',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({
        ...(isEdit ? {} : { projectId, order: nextOrder }),
        name: form.name,
        startDate: form.startDate || undefined,
        endDate: form.endDate || undefined,
        estimatedCost: form.estimatedCost === '' ? undefined : Number(form.estimatedCost),
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm">
      <form onSubmit={handleSubmit} className="bg-surface rounded-2xl max-w-sm w-full p-6 shadow-xl border border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-ink">{isEdit ? 'Edit Phase' : 'Add Phase'}</h3>
          <button type="button" onClick={onClose} className="p-1 text-sub hover:text-ink rounded-lg hover:bg-accent-soft transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="label-field">Phase Name *</label>
            <input required className="input-field" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. System Testing" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-field">Start Date</label>
              <input type="date" className="input-field font-mono" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} />
            </div>
            <div>
              <label className="label-field">End Date</label>
              <input type="date" className="input-field font-mono" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="label-field">Estimated Cost (VND)</label>
            <input type="number" min={0} className="input-field font-mono" value={form.estimatedCost} onChange={e => setForm({ ...form, estimatedCost: e.target.value })} placeholder="0" />
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 pt-5 mt-5 border-t border-border">
          {isEdit ? (
            <button type="button" onClick={() => onDelete(phase.id).then(onClose)} className="btn-danger text-xs px-3 py-2">
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>
          ) : <span />}
          <div className="flex items-center gap-2">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button>
          </div>
        </div>
      </form>
    </div>
  );
}
