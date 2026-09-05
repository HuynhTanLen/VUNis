import { useState, useEffect } from 'react';
import { getProjectPhases, createPhase, updatePhase, deletePhase, seedProjectPhases } from '../../services/phaseService';
import { Loader2, Plus, Sparkles, CheckCircle2 } from 'lucide-react';
import Toast from '../ui/Toast';
import PhaseFormModal from './PhaseFormModal';

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : null;
const fmtCost = (c) => c > 0 ? `${c.toLocaleString('en-US')} VND` : null;
const DOT_COLORS = ['var(--color-accent)', 'var(--color-story)', 'var(--color-warning)', 'var(--color-epic)'];

/**
 * Spiral Model: each pass around the loop is one iteration (Planning -> Risk Analysis ->
 * Engineering -> Evaluation), with the radius growing every phase — later iterations sit
 * further out, exactly like the textbook spiral diagram. Position is purely index-based
 * (angle = i * 90deg, radius grows with i), so it holds for any phase count.
 */
export default function SpiralDiagram({ projectId, isPM }) {
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
      showToast('Default Spiral phases generated.');
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
        <p className="text-sub text-xs font-medium uppercase tracking-wider">Loading Spiral...</p>
      </div>
    );
  }

  if (phases.length === 0) {
    return (
      <div className="card-clean p-12 text-center text-sub space-y-3">
        <p className="text-ink font-semibold text-sm">No phases yet</p>
        <p className="text-xs max-w-sm mx-auto">A Spiral project repeats Planning &rarr; Risk Analysis &rarr; Engineering &rarr; Evaluation each iteration, growing outward one loop at a time.</p>
        {isPM && (
          <button onClick={handleSeed} disabled={seeding} className="btn-primary mx-auto disabled:opacity-50">
            <Sparkles className="w-4 h-4" /> {seeding ? 'Generating...' : 'Generate Spiral Phases'}
          </button>
        )}
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </div>
    );
  }

  const n = phases.length;
  const cx = 200, cy = 200;
  const R0 = 26;
  const dR = Math.min(30, Math.max(14, (170 - R0) / Math.max(1, n - 1)));

  const pointAt = (i) => {
    const angle = (i * 90 - 90) * (Math.PI / 180); // start pointing up
    const r = R0 + dR * i;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  };

  // Smooth spiral path through all phase positions
  let pathD = '';
  const STEPS_PER_SEGMENT = 10;
  for (let i = 0; i < n - 1; i++) {
    for (let s = 0; s <= STEPS_PER_SEGMENT; s++) {
      const t = i + s / STEPS_PER_SEGMENT;
      const angle = (t * 90 - 90) * (Math.PI / 180);
      const r = R0 + dR * t;
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      pathD += (i === 0 && s === 0 ? 'M' : 'L') + `${x.toFixed(1)},${y.toFixed(1)} `;
    }
  }

  const isDone = (p) => p.endDate && new Date(p.endDate) < new Date();

  return (
    <div className="space-y-4">
      <div className="card-clean p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-ink">Spiral Roadmap</h3>
          <p className="text-xs text-sub mt-0.5">Each loop is one iteration — risk gets reassessed and scope refined every pass.</p>
        </div>
        {isPM && (
          <button onClick={() => setShowAdd(true)} className="btn-secondary shrink-0">
            <Plus className="w-4 h-4" /> Add Phase
          </button>
        )}
      </div>

      <div className="card-clean p-6">
        <div className="flex flex-col lg:flex-row gap-6 items-center lg:items-start">
          <svg viewBox="0 0 400 400" className="w-full max-w-[360px] shrink-0 overflow-visible">
            <path d={pathD} fill="none" stroke="var(--color-sub)" strokeOpacity="0.55" strokeWidth="2.5" />
            <circle cx={cx} cy={cy} r="2.5" fill="var(--color-sub)" />
            {phases.map((phase, i) => {
              const { x, y } = pointAt(i);
              const color = DOT_COLORS[i % 4];
              const done = isDone(phase);
              return (
                <g
                  key={phase.id}
                  onClick={() => isPM && setEditingPhase(phase)}
                  className={isPM ? 'cursor-pointer' : ''}
                >
                  <circle cx={x} cy={y} r="11" fill={done ? 'var(--color-success-dark)' : color} stroke="#fff" strokeWidth="2" />
                  <text x={x} y={y + 3.5} textAnchor="middle" fontSize="9.5" fontWeight="700" fill="#fff" fontFamily="var(--font-mono)">
                    {i + 1}
                  </text>
                </g>
              );
            })}
          </svg>

          <div className="flex-1 w-full space-y-1.5">
            {phases.map((phase, i) => {
              const done = isDone(phase);
              return (
                <button
                  key={phase.id}
                  onClick={() => isPM && setEditingPhase(phase)}
                  className={`w-full flex items-center gap-3 p-2.5 rounded-lg border text-left transition-colors ${
                    isPM ? 'hover:border-accent/40 cursor-pointer' : 'cursor-default'
                  } border-border bg-bg`}
                >
                  <span
                    className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-mono font-bold text-white shrink-0"
                    style={{ background: done ? 'var(--color-success-dark)' : DOT_COLORS[i % 4] }}
                  >
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-ink truncate">{phase.name}</p>
                    <div className="flex items-center gap-2 text-[10px] text-sub font-mono">
                      {fmtDate(phase.startDate) && fmtDate(phase.endDate) && <span>{fmtDate(phase.startDate)} → {fmtDate(phase.endDate)}</span>}
                      {fmtCost(phase.estimatedCost) && <span>· {fmtCost(phase.estimatedCost)}</span>}
                    </div>
                  </div>
                  {done && <CheckCircle2 className="w-4 h-4 text-success shrink-0" />}
                </button>
              );
            })}
          </div>
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
