// The product's own subject matter, drawn literally: a schedule ruler (MS Project's
// Gantt axis) carrying three phase bars (Jira-style work-in-progress), a milestone
// diamond, a "today" cursor, and a title block — the vocabulary of a real technical
// drawing, not an abstract orbit shape borrowed from a generic template.
const PHASE_ROWS = [
  { label: 'PLAN', x1: 76, x2: 170, y: 28, color: 'var(--color-accent)' },
  { label: 'BUILD', x1: 96, x2: 230, y: 64, color: 'var(--color-task)' },
  { label: 'SHIP', x1: 150, x2: 262, y: 100, color: 'var(--color-success)' },
];
const TICKS = [76, 110, 144, 178, 212, 246, 280];

function ScheduleGraphic() {
  return (
    <svg width="300" height="176" viewBox="0 0 300 176" className="overflow-visible" aria-hidden="true">
      <rect x="0.5" y="0.5" width="299" height="175" fill="none" stroke="var(--color-border)" strokeWidth="1" />

      <text x="12" y="16" fill="var(--color-sub)" style={{ fontSize: 8, fontFamily: 'var(--font-mono)', letterSpacing: '0.12em' }}>SCHEDULE</text>

      {/* today cursor, drawn first so bars sit on top of it */}
      <line x1="178" y1="14" x2="178" y2="146" stroke="var(--color-ink)" strokeWidth="1" strokeDasharray="2 3" opacity="0.5" />
      <path d="M 173 14 L 183 14 L 178 20 Z" fill="var(--color-ink)" opacity="0.6" />
      <text x="178" y="10" textAnchor="middle" fill="var(--color-ink)" style={{ fontSize: 7, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em' }} opacity="0.6">TODAY</text>

      {PHASE_ROWS.map((row) => (
        <g key={row.label}>
          <text x="20" y={row.y + 10} fill="var(--color-sub)" style={{ fontSize: 8, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{row.label}</text>
          <rect x={row.x1} y={row.y} width={row.x2 - row.x1} height="14" rx="1" fill={row.color} />
        </g>
      ))}
      {/* milestone diamond at the end of the last bar */}
      <path d="M 262 107 L 268 113 L 262 119 L 256 113 Z" fill="var(--color-ink)" />

      <line x1="76" y1="138" x2="280" y2="138" stroke="var(--color-border)" strokeWidth="1" />
      {TICKS.map((x, i) => (
        <g key={x}>
          <line x1={x} y1="134" x2={x} y2="140" stroke="var(--color-border)" strokeWidth="1" />
          <text x={x} y="150" textAnchor="middle" fill="var(--color-dim)" style={{ fontSize: 7, fontFamily: 'var(--font-mono)' }}>W{i + 1}</text>
        </g>
      ))}

      <text x="288" y="168" textAnchor="end" fill="var(--color-dim)" style={{ fontSize: 7, fontFamily: 'var(--font-mono)', letterSpacing: '0.08em' }}>VUNIS · GANTT-01</text>
    </svg>
  );
}

export default function AuthLayout({ eyebrow, title, subtitle, children, footer, wide = false }) {
  return (
    <div className="min-h-[100dvh] bg-bg font-sans text-ink antialiased">
      <div className="max-w-[1360px] mx-auto px-6 md:px-12 lg:px-16">

        {/* header */}
        <header className="flex items-center justify-between pt-8 md:pt-10">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-accent flex items-center justify-center text-white font-black text-[11px]">VU</div>
            <span className="text-sm font-bold text-ink tracking-tight">VUNIS</span>
          </div>
          <span className="hidden sm:block text-[10px] font-mono text-sub uppercase tracking-[0.2em]">Enterprise Workspace</span>
        </header>

        {/* body: asymmetric grid, nothing centered */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-12 gap-y-14 mt-12 md:mt-20 pb-16">

          {/* editorial visual zone — 7/12, left aligned */}
          <div className="lg:col-span-7 xl:col-span-8">
            {eyebrow && (
              <span className="text-[10px] font-mono font-semibold text-accent uppercase tracking-[0.2em]">
                {eyebrow}
              </span>
            )}
            <h1 className="text-[2.1rem] md:text-[2.6rem] leading-[1.08] font-bold text-ink tracking-tight mt-3 max-w-lg">
              Plan like MS Project.<br />Ship like Jira.
            </h1>
            <p className="text-sm text-sub leading-relaxed mt-4 max-w-sm">
              One workspace for Gantt schedules, sprint boards, and everything in between — from kickoff to delivery.
            </p>

            <div className="mt-10 md:mt-14 flex items-end gap-8">
              <ScheduleGraphic />
              <dl className="hidden md:grid grid-cols-1 gap-3 pb-2">
                {[
                  ['Kanban', 'Real-time task board'],
                  ['Gantt', 'Waterfall · Agile · V-Model scheduling'],
                  ['RBAC', 'System & project-level permissions'],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-baseline gap-3 border-t border-border pt-2 first:border-0 first:pt-0">
                    <dt className="text-[11px] font-mono font-bold text-ink w-14 shrink-0">{k}</dt>
                    <dd className="text-xs text-sub">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          {/* form zone — 5/12, offset down, thin rule divider instead of a hard split */}
          <div className="lg:col-span-5 xl:col-span-4 lg:border-l lg:border-border lg:pl-10 xl:pl-14 lg:pt-6">
            <div className={wide ? 'max-w-md' : 'max-w-xs'}>
              <h2 className="text-lg font-bold text-ink tracking-tight">{title}</h2>
              {subtitle && <p className="text-xs text-sub mt-1.5 leading-relaxed">{subtitle}</p>}

              <div className="mt-7">
                {children}
              </div>

              {footer && <p className="text-xs text-sub mt-7">{footer}</p>}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
