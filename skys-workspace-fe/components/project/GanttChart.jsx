import { useState, useEffect } from 'react';
import { getGanttData, getProjectTotalCost } from '../../services/projectService';
import { BarChart3, Loader2, ChevronDown, ChevronRight, DollarSign, Layers, AlertCircle } from 'lucide-react';

const STATUS_CONFIG = {
  TODO:        { bar: 'bg-accent',   badge: 'bg-accent-soft text-accent border-accent/20',   label: 'To Do' },
  IN_PROGRESS: { bar: 'bg-warning',  badge: 'bg-warning-soft text-warning border-warning/20', label: 'In Progress' },
  REVIEW:      { bar: 'bg-warning',  badge: 'bg-warning-soft text-warning border-warning/20', label: 'Review' },
  DONE:        { bar: 'bg-success',  badge: 'bg-success-soft text-success border-success/20', label: 'Completed' },
  // Alias lowercase variants from backend
  Todo:        { bar: 'bg-accent',   badge: 'bg-accent-soft text-accent border-accent/20',   label: 'To Do' },
  InProgress:  { bar: 'bg-warning',  badge: 'bg-warning-soft text-warning border-warning/20', label: 'In Progress' },
  Done:        { bar: 'bg-success',  badge: 'bg-success-soft text-success border-success/20', label: 'Completed' },
};

const PHASE_COLORS = [
  'bg-violet-500', 'bg-blue-500', 'bg-cyan-500',
  'bg-teal-500', 'bg-emerald-500', 'bg-amber-500'
];

const MODEL_LABELS = {
  WATERFALL:    'Waterfall',
  AGILE_SCRUM:  'Agile / Scrum',
  KANBAN:       'Kanban',
  V_MODEL:      'V-Model',
  SPIRAL_MODEL: 'Spiral Model',
};

/** Calculate Gantt bar position and width based on 14-day timeline */
function getBarStyle(startDate, endDate, days) {
  if (!startDate || !endDate) return { display: 'none' };
  const start = new Date(startDate);
  const end   = new Date(endDate);
  const timelineStart = days[0];
  const timelineEnd   = days[days.length - 1];
  
  // Timeline end of day
  const timelineEndMs = timelineEnd.getTime() + 86400000 - 1;

  // If task falls entirely outside timeline
  if (end.getTime() < timelineStart.getTime() || start.getTime() > timelineEndMs) {
    return { display: 'none' };
  }

  const totalMs = timelineEndMs - timelineStart.getTime() + 1;

  // Actual position relative to timeline start
  const barStart = start.getTime() - timelineStart.getTime();
  const barEnd   = end.getTime() - timelineStart.getTime() + 86400000;

  // Clip bar to visible area
  const visibleStart = Math.max(0, barStart);
  const visibleEnd = Math.min(totalMs, barEnd);

  const leftPct  = (visibleStart / totalMs) * 100;
  const widthPct = ((visibleEnd - visibleStart) / totalMs) * 100;

  return { left: `${leftPct}%`, width: `${widthPct}%` };
}

/** Phase Row (expandable/collapsible) */
function PhaseRow({ phase, colorClass, days, isPM, expandedPhases, togglePhase }) {
  const isExpanded = expandedPhases.has(phase.id);
  const barStyle = getBarStyle(phase.startDate, phase.endDate, days);
  const taskCount = (phase.tasks || []).length;
  const doneCount = (phase.tasks || []).filter(t => t.status === 'DONE' || t.status === 'Done').length;

  return (
    <>
      {/* Phase header row */}
      <tr
        className="hover:bg-accent-soft/20 transition-colors cursor-pointer group"
        onClick={() => togglePhase(phase.id)}
      >
        <td className="w-52 shrink-0 px-4 py-3 border-r border-border">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-sm shrink-0 ${colorClass}`} />
            <div className="min-w-0">
              <p className="text-xs font-bold text-ink truncate">{phase.name}</p>
              <p className="text-[10px] text-sub font-mono">
                {taskCount > 0 ? `${doneCount}/${taskCount} tasks` : 'No tasks'}
              </p>
            </div>
          </div>
        </td>
        <td className="w-28 shrink-0 px-3 py-3 border-r border-border">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-bg border border-border text-sub">
            <Layers className="w-2.5 h-2.5" />
            Phase
          </span>
        </td>
        <td className="w-20 shrink-0 px-3 py-3 border-r border-border text-center">
          <button className="text-sub group-hover:text-accent transition-colors">
            {isExpanded
              ? <ChevronDown className="w-4 h-4" />
              : <ChevronRight className="w-4 h-4" />}
          </button>
        </td>
        {isPM && (
          <td className="w-32 shrink-0 px-3 py-3 border-r border-border text-right">
            <span className="text-[10px] font-mono text-sub">
              {phase.estimatedCost > 0 ? `${phase.estimatedCost.toLocaleString('en-US')} VND` : '—'}
            </span>
          </td>
        )}
        <td className="px-3 py-3">
          <div className="relative w-full h-6 rounded overflow-hidden">
            <div className="absolute inset-0 flex border border-border bg-bg rounded">
              {days.map((_, i) => (
                <div key={i} className="flex-1 border-r border-border/30 last:border-r-0"></div>
              ))}
            </div>
            <div
              className={`absolute top-0 bottom-0 ${colorClass} rounded flex items-center justify-end pr-1.5 transition-all duration-500 shadow-sm`}
              style={barStyle}
            >
              {phase.phasePct > 0 && (
                <span className="text-[9px] font-bold text-white whitespace-nowrap z-10">{phase.phasePct}%</span>
              )}
            </div>
          </div>
        </td>
      </tr>

      {/* Task child rows (drill-down) */}
      {isExpanded && (phase.tasks || []).map(task => {
        const sc = STATUS_CONFIG[task.status] || STATUS_CONFIG.Todo;
        const taskBar = getBarStyle(task.startDate, task.endDate, days);
        return (
          <tr key={task.id} className="hover:bg-accent-soft/10 transition-colors bg-bg/50">
            <td className="w-52 shrink-0 px-4 py-2.5 border-r border-border pl-9">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full shrink-0 ${sc.bar}`} />
                <span className="text-xs font-medium text-ink truncate">{task.name}</span>
              </div>
            </td>
            <td className="w-28 shrink-0 px-3 py-2.5 border-r border-border">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${sc.badge}`}>
                {sc.label}
              </span>
            </td>
            <td className="w-20 shrink-0 px-3 py-2.5 border-r border-border">
              {task.assignee?.name ? (
                <span className="text-[10px] text-sub truncate">{task.assignee.name}</span>
              ) : (
                <span className="text-[10px] text-sub/50">—</span>
              )}
            </td>
            {isPM && (
              <td className="w-32 shrink-0 px-3 py-2.5 border-r border-border text-right">
                <span className="text-[10px] font-mono text-sub">
                  {task.estimatedCost > 0 ? `${task.estimatedCost.toLocaleString('en-US')} VND` : '—'}
                </span>
              </td>
            )}
            <td className="px-3 py-2.5">
              <div className="relative w-full h-5 rounded overflow-hidden">
                <div className="absolute inset-0 flex border border-border bg-bg/50 rounded">
                  {days.map((_, i) => (
                    <div key={i} className="flex-1 border-r border-border/30 last:border-r-0"></div>
                  ))}
                </div>
                <div
                  className={`absolute top-0 bottom-0 ${sc.bar} rounded-r flex items-center px-2 transition-all duration-500 shadow-sm`}
                  style={taskBar}
                >
                  <span className="text-[9px] font-semibold text-white whitespace-nowrap z-10">{sc.label}</span>
                </div>
              </div>
            </td>
          </tr>
        );
      })}
    </>
  );
}

/** Orphan Task Row (not in any phase) */
function OrphanTaskRow({ task, days, isPM }) {
  const sc = STATUS_CONFIG[task.status] || STATUS_CONFIG.Todo;
  const taskBar = getBarStyle(task.startDate, task.endDate, days);
  return (
    <tr className="hover:bg-accent-soft/20 transition-colors">
      <td className="w-52 shrink-0 px-4 py-3 border-r border-border">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full shrink-0 ${sc.bar}`} />
          <span className="text-xs font-semibold text-ink truncate">{task.name}</span>
        </div>
      </td>
      <td className="w-28 shrink-0 px-3 py-3 border-r border-border">
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${sc.badge}`}>
          {sc.label}
        </span>
      </td>
      <td className="w-20 shrink-0 px-3 py-3 border-r border-border">
        {task.assignee?.name ? (
          <span className="text-[10px] text-sub truncate">{task.assignee.name}</span>
        ) : <span className="text-[10px] text-sub/50">—</span>}
      </td>
      {isPM && (
        <td className="w-32 shrink-0 px-3 py-3 border-r border-border text-right">
          <span className="text-[10px] font-mono text-sub">
            {task.estimatedCost > 0 ? `${task.estimatedCost.toLocaleString('en-US')} VND` : '—'}
          </span>
        </td>
      )}
      <td className="px-3 py-3">
        <div className="relative w-full h-5 rounded overflow-hidden">
          <div className="absolute inset-0 flex border border-border bg-bg/50 rounded">
            {days.map((_, i) => (
              <div key={i} className="flex-1 border-r border-border/30 last:border-r-0"></div>
            ))}
          </div>
          <div
            className={`absolute top-0 bottom-0 ${sc.bar} rounded-r flex items-center px-2 transition-all duration-500 shadow-sm`}
            style={taskBar}
          >
            <span className="text-[9px] font-semibold text-white whitespace-nowrap z-10">{sc.label}</span>
          </div>
        </div>
      </td>
    </tr>
  );
}

export default function GanttChart({ projectId, isPM = false }) {
  const [ganttData, setGanttData] = useState(null);
  const [costData, setCostData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedPhases, setExpandedPhases] = useState(new Set());
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const [data, cost] = await Promise.all([
          getGanttData(projectId),
          isPM ? getProjectTotalCost(projectId) : Promise.resolve(null)
        ]);
        setGanttData(data);
        setCostData(cost);
        // Default to expand all phases
        if (data?.phases?.length) {
          setExpandedPhases(new Set(data.phases.map(p => p.id)));
        }
      } catch (err) {
        console.error('Error loading Gantt data:', err);
        setError('Unable to load Gantt chart data.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [projectId]);

  const togglePhase = (phaseId) => {
    setExpandedPhases(prev => {
      const next = new Set(prev);
      next.has(phaseId) ? next.delete(phaseId) : next.add(phaseId);
      return next;
    });
  };

  // Calculate totals from data
  const phases = ganttData?.phases || [];
  const orphanTasks = ganttData?.orphanTasks || [];

  // Timeline auto-adjusts to project dates instead of fixed 14 days
  let startTimelineDate = new Date();
  let endTimelineDate = new Date();
  endTimelineDate.setDate(endTimelineDate.getDate() + 14);

  if (ganttData?.startDate && ganttData?.endDate) {
    startTimelineDate = new Date(ganttData.startDate);
    endTimelineDate = new Date(ganttData.endDate);
  } else if (phases.length > 0) {
    let minDate = new Date(8640000000000000);
    let maxDate = new Date(-8640000000000000);
    
    phases.forEach(p => {
      if (p.startDate) minDate = new Date(Math.min(minDate, new Date(p.startDate)));
      if (p.endDate) maxDate = new Date(Math.max(maxDate, new Date(p.endDate)));
    });
    
    if (minDate < new Date(8640000000000000)) startTimelineDate = minDate;
    if (maxDate > new Date(-8640000000000000)) endTimelineDate = maxDate;
  }

  // Ensure minimum 14-day timeline if start >= end
  if (startTimelineDate >= endTimelineDate) {
    endTimelineDate = new Date(startTimelineDate);
    endTimelineDate.setDate(endTimelineDate.getDate() + 14);
  }

  const daysLength = Math.max(1, Math.round((endTimelineDate.getTime() - startTimelineDate.getTime()) / 86400000)) + 1;
  const MAX_DAYS = 365; // Limit to 1 year to avoid lag
  const actualDaysLength = Math.min(daysLength, MAX_DAYS);

  const days = Array.from({ length: actualDaysLength }, (_, i) => {
    const d = new Date(startTimelineDate);
    d.setDate(d.getDate() + i);
    return d;
  });


  const allTasks = [...phases.flatMap(p => p.tasks || []), ...orphanTasks];
  const totalTasks = allTasks.length;
  const doneTasks  = allTasks.filter(t => t.status === 'DONE' || t.status === 'Done').length;
  const inProgress = allTasks.filter(t => ['IN_PROGRESS', 'InProgress', 'REVIEW', 'Review'].includes(t.status)).length;
  const todo       = allTasks.filter(t => t.status === 'TODO' || t.status === 'Todo').length;

  return (
    <div className="space-y-5">

      {/* SUMMARY CARD */}
      <section className="card-clean p-5 space-y-4" aria-label="Gantt Chart Overview">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
          <div>
            <h3 className="text-xs font-semibold text-ink uppercase tracking-wider flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-accent" />
              Gantt Chart Progress
              {ganttData?.modelType && (
                <span className="ml-1 px-2 py-0.5 text-[10px] font-bold rounded-full bg-accent-soft text-accent border border-accent/20">
                  {MODEL_LABELS[ganttData.modelType] || ganttData.modelType}
                </span>
              )}
            </h3>
            {ganttData?.startDate && ganttData?.endDate && (
              <p className="text-[11px] text-sub font-mono mt-0.5">
                {new Date(ganttData.startDate).toLocaleDateString('en-US')} → {new Date(ganttData.endDate).toLocaleDateString('en-US')}
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-4">
            {[
              { label: 'To Do',   count: todo,       color: 'bg-accent' },
              { label: 'In Progress',  count: inProgress, color: 'bg-warning' },
              { label: 'Completed',count: doneTasks,  color: 'bg-success' },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${item.color}`} />
                <span className="text-xs font-medium text-sub">{item.label} (<span className="font-mono">{item.count}</span>)</span>
              </div>
            ))}
          </div>
        </div>

        {totalTasks > 0 && (
          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px] text-sub font-medium">
              <span>Overall Progress</span>
              <span className="font-mono">{doneTasks}/{totalTasks} tasks completed</span>
            </div>
            <div className="h-2 bg-bg rounded-full overflow-hidden flex">
              <div className="bg-success h-full transition-all duration-500" style={{ width: `${totalTasks > 0 ? (doneTasks / totalTasks) * 100 : 0}%` }} />
              <div className="bg-warning h-full transition-all duration-500" style={{ width: `${totalTasks > 0 ? (inProgress / totalTasks) * 100 : 0}%` }} />
              <div className="bg-accent h-full transition-all duration-500" style={{ width: `${totalTasks > 0 ? (todo / totalTasks) * 100 : 0}%` }} />
            </div>
          </div>
        )}

        {/* Total Project Cost - PM ONLY */}
        {isPM && costData && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-border">
            <div className="flex items-center gap-2 p-3 bg-bg rounded-lg border border-border">
              <DollarSign className="w-4 h-4 text-accent shrink-0" />
              <div>
                <p className="text-[10px] font-bold text-sub uppercase tracking-wider">Actual Cost (History)</p>
                <p className="text-sm font-bold text-ink font-mono">{costData.totalActualCost.toLocaleString('en-US')} VND</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-bg rounded-lg border border-border">
              <DollarSign className="w-4 h-4 text-warning shrink-0" />
              <div>
                <p className="text-[10px] font-bold text-sub uppercase tracking-wider">Estimated Cost</p>
                <p className="text-sm font-bold text-ink font-mono">{costData.totalEstimatedCost.toLocaleString('en-US')} VND</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-bg rounded-lg border border-border">
              <DollarSign className="w-4 h-4 text-success shrink-0" />
              <div>
                <p className="text-[10px] font-bold text-sub uppercase tracking-wider">Actual cost (Task)</p>
                <p className="text-sm font-bold text-ink font-mono">{costData.totalActualTaskCost.toLocaleString('en-US')} VND</p>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* GANTT TABLE */}
      <section className="card-clean overflow-hidden" aria-label="Gantt Chart Table">
        {loading ? (
          <div className="text-center py-16">
            <Loader2 className="w-6 h-6 text-accent animate-spin mx-auto mb-2" />
            <p className="text-sub text-xs font-medium uppercase tracking-wider">Calculating Gantt Chart...</p>
          </div>
        ) : error ? (
          <div className="text-center py-16 text-danger">
            <AlertCircle className="w-8 h-8 mx-auto mb-2" />
            <p className="text-xs font-semibold">{error}</p>
          </div>
        ) : (phases.length === 0 && orphanTasks.length === 0) ? (
          <div className="text-center py-16 text-sub">
            <p className="font-semibold text-xs uppercase tracking-wider text-ink">Empty Gantt Chart</p>
            <p className="text-xs mt-1">Please create tasks in the Kanban Board.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse" style={{ minWidth: `max(1000px, ${days.length * 45 + 400}px)` }} role="grid" aria-label="Gantt Chart">
              {/* Table Header */}
              <thead>
                <tr className="bg-bg border-b border-border">
                  <th scope="col" className="w-52 shrink-0 px-4 py-3 text-[10px] font-bold text-sub uppercase tracking-wider text-left border-r border-border">
                    Task / Phase
                  </th>
                  <th scope="col" className="w-28 shrink-0 px-3 py-3 text-[10px] font-bold text-sub uppercase tracking-wider text-left border-r border-border">
                    Status
                  </th>
                  <th scope="col" className="w-20 shrink-0 px-3 py-3 text-[10px] font-bold text-sub uppercase tracking-wider text-left border-r border-border">
                    Assignee
                  </th>
                  {isPM && (
                    <th scope="col" className="w-32 shrink-0 px-3 py-3 text-[10px] font-bold text-sub uppercase tracking-wider text-right border-r border-border">
                      Cost (VND)
                    </th>
                  )}
                  <th scope="col" className="px-3 py-0">
                    {/* Day headers */}
                    <div className="flex">
                      {days.map((day, i) => (
                        <div
                          key={i}
                          className={`flex-1 py-2 text-center text-[9px] font-medium border-r border-border/50 flex flex-col justify-center font-mono ${
                            day.getDay() === 0 || day.getDay() === 6
                              ? 'text-danger bg-danger-soft/30'
                              : i === 0
                              ? 'text-accent bg-accent-soft/50'
                              : 'text-sub'
                          }`}
                        >
                          <span>{day.getDate()}/{day.getMonth() + 1}</span>
                          <span className="text-[8px] mt-0.5 opacity-60">
                            {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][day.getDay()]}
                          </span>
                        </div>
                      ))}
                    </div>
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-border">
                {/* Phases (Waterfall) */}
                {phases.map((phase, idx) => (
                  <PhaseRow
                    key={phase.id}
                    phase={phase}
                    colorClass={PHASE_COLORS[idx % PHASE_COLORS.length]}
                    days={days}
                    isPM={isPM}
                    expandedPhases={expandedPhases}
                    togglePhase={togglePhase}
                  />
                ))}

                {/* Orphan tasks */}
                {orphanTasks.length > 0 && (
                  <>
                    {phases.length > 0 && (
                      <tr>
                        <td colSpan={isPM ? 5 : 4} className="px-4 py-2 bg-bg/80">
                          <span className="text-[10px] font-bold text-sub uppercase tracking-wider">
                            Unassigned Tasks
                          </span>
                        </td>
                      </tr>
                    )}
                    {orphanTasks.map(task => (
                      <OrphanTaskRow key={task.id} task={task} days={days} isPM={isPM} />
                    ))}
                  </>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
