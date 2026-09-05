import { useState, useEffect } from 'react';
import { getProjectPhases, createPhase, updatePhase, deletePhase, seedProjectPhases } from '../../services/phaseService';
import { Loader2, Plus, Sparkles, CheckCircle2 } from 'lucide-react';
import Toast from '../ui/Toast';
import PhaseFormModal from './PhaseFormModal';

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : null;
const fmtCost = (c) => c > 0 ? `${c.toLocaleString('en-US')} VND` : null;

/**
 * V-Model: development phases descend on the left, each one mirrored by its
 * corresponding verification/test phase ascending on the right, meeting at
 * "Coding" — the classic V shape. Pairing is purely positional (phase i <-> phase n-1-i),
 * so it works for any phase count, not just the 9-phase default template.
 */
export default function VModelDiagram({ projectId, isPM }) {
  const [phases, setPhases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [editingPhase, setEditingPhase] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const showToast = (message, type = 'success') => { setToast({ message, type }); setTimeout(() => setToast(null), 3000); };

  const load = async () => {
    try {
      setLoading(true);
      const data = await getProjectPhases(projectId);
      setPhases(data.sort((a, b) => a.order - b.order));
    } catch (err) {
      showToast('Failed to load phases.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [projectId]);

  const handleSeed = async () => {
    setSeeding(true);
    try {
      await seedProjectPhases(projectId);
      showToast('Default V-Model phases generated.');
      load();
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to generate phases.', 'error');
    } finally {
      setSeeding(false);
    }
  };

  const handleSave = async (data) => {
    if (editingPhase) await updatePhase(editingPhase.id, data);
    else await createPhase(data);
    showToast(editingPhase ? 'Phase updated.' : 'Phase added.');
    load();
  };

  const handleDelete = async (id) => {
    await deletePhase(id);
    showToast('Phase deleted.');
    load();
    return true;
  };

  if (loading) {
    return (
      <div className="card-clean p-16 flex flex-col items-center justify-center">
        <Loader2 className="w-6 h-6 text-accent animate-spin mb-2" />
        <p className="text-sub text-xs font-medium uppercase tracking-wider">Loading V-Model...</p>
      </div>
    );
  }

  if (phases.length === 0) {
    return (
      <div className="card-clean p-12 text-center text-sub space-y-3">
        <p className="text-ink font-semibold text-sm">No phases yet</p>
        <p className="text-xs max-w-sm mx-auto">A V-Model project pairs each development phase with its own verification phase (Requirements &harr; Acceptance Testing, Design &harr; System Testing...), meeting at Coding.</p>
        {isPM && (
          <button onClick={handleSeed} disabled={seeding} className="btn-primary mx-auto disabled:opacity-50">
            <Sparkles className="w-4 h-4" /> {seeding ? 'Generating...' : 'Generate V-Model Phases'}
          </button>
        )}
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </div>
    );
  }

  const n = phases.length;
  const pairCount = Math.floor(n / 2);
  const hasVertex = n % 2 === 1;
  const rows = pairCount + (hasVertex ? 1 : 0);
  const rowHeight = 108;
  const svgHeight = Math.max(1, rows - 1) * rowHeight + 140;
  const leftX = 18, rightX = 82, centerX = 50;

  // Build positioned list: { phase, side: 'left'|'right'|'vertex', x%, y }
  const positioned = [];
  for (let i = 0; i < pairCount; i++) {
    const y = 60 + i * rowHeight;
    positioned.push({ phase: phases[i], side: 'left', x: leftX, y });
    positioned.push({ phase: phases[n - 1 - i], side: 'right', x: rightX, y });
  }
  if (hasVertex) {
    positioned.push({ phase: phases[pairCount], side: 'vertex', x: centerX, y: 60 + pairCount * rowHeight });
  }

  const isDone = (p) => p.endDate && new Date(p.endDate) < new Date();

  return (
    <div className="space-y-4">
      <div className="card-clean p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-ink">V-Model Roadmap</h3>
          <p className="text-xs text-sub mt-0.5">Every development phase is mirrored by its own verification phase, meeting at Coding.</p>
        </div>
        {isPM && (
          <button onClick={() => setShowAdd(true)} className="btn-secondary shrink-0">
            <Plus className="w-4 h-4" /> Add Phase
          </button>
        )}
      </div>

      <div className="card-clean p-6 overflow-x-auto">
        <div className="relative mx-auto" style={{ minWidth: 640, maxWidth: 820, height: svgHeight }}>
          <svg viewBox={`0 0 100 ${svgHeight}`} preserveAspectRatio="none" className="absolute inset-0 w-full h-full overflow-visible">
            {/* left descending diagonal */}
            <polyline
              points={Array.from({ length: pairCount + (hasVertex ? 1 : 0) }, (_, i) => `${leftX},${60 + i * rowHeight}`).concat(hasVertex ? [`${centerX},${60 + pairCount * rowHeight}`] : []).join(' ')}
              fill="none" stroke="var(--color-sub)" strokeOpacity="0.55" strokeWidth="1"
            />
            {/* right ascending diagonal */}
            <polyline
              points={Array.from({ length: pairCount + (hasVertex ? 1 : 0) }, (_, i) => `${rightX},${60 + i * rowHeight}`).concat(hasVertex ? [`${centerX},${60 + pairCount * rowHeight}`] : []).join(' ')}
              fill="none" stroke="var(--color-sub)" strokeOpacity="0.55" strokeWidth="1"
            />
            {/* dashed pairing lines */}
            {Array.from({ length: pairCount }, (_, i) => (
              <line key={i} x1={leftX} y1={60 + i * rowHeight} x2={rightX} y2={60 + i * rowHeight} stroke="var(--color-accent)" strokeWidth="0.3" strokeDasharray="1.5 1.5" opacity="0.35" />
            ))}
          </svg>

          {positioned.map(({ phase, side, x, y }, idx) => {
            const done = isDone(phase);
            return (
              <button
                key={phase.id}
                onClick={() => isPM && setEditingPhase(phase)}
                className={`absolute w-[220px] -translate-x-1/2 text-left bg-surface border rounded-lg p-3 transition-all ${
                  side === 'vertex' ? 'border-accent ring-1 ring-accent/30' : 'border-border hover:border-accent/50'
                } ${isPM ? 'cursor-pointer' : 'cursor-default'}`}
                style={{ left: `${x}%`, top: y }}
              >
                <div className="flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${done ? 'bg-success' : side === 'vertex' ? 'bg-accent' : side === 'left' ? 'bg-task' : 'bg-epic'}`} />
                  <span className="text-[10px] font-mono font-bold text-sub uppercase tracking-wider">
                    {side === 'vertex' ? 'Build' : side === 'left' ? 'Development' : 'Verification'}
                  </span>
                  {done && <CheckCircle2 className="w-3 h-3 text-success ml-auto" />}
                </div>
                <p className="text-xs font-bold text-ink mt-1 truncate">{phase.name}</p>
                <div className="flex items-center gap-2 mt-1 text-[10px] text-sub font-mono">
                  {fmtDate(phase.startDate) && fmtDate(phase.endDate) && <span>{fmtDate(phase.startDate)} → {fmtDate(phase.endDate)}</span>}
                  {fmtCost(phase.estimatedCost) && <span>· {fmtCost(phase.estimatedCost)}</span>}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {editingPhase && (
        <PhaseFormModal phase={editingPhase} onSave={handleSave} onDelete={handleDelete} onClose={() => setEditingPhase(null)} />
      )}
      {showAdd && (
        <PhaseFormModal projectId={projectId} nextOrder={phases.length + 1} onSave={handleSave} onClose={() => setShowAdd(false)} />
      )}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
