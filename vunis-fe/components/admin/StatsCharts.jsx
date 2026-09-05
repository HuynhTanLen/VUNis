'use client';

import { useMemo } from 'react';
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend,
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  BarChart, Bar,
} from 'recharts';
import Card from '../ui/Card';
import { TrendingUp, PieChart as PieIcon, BarChart3 } from 'lucide-react';

const ROLE_COLORS = {
  SUPER_ADMIN: 'var(--color-epic)',
  USER_ADMIN: 'var(--color-accent)',
  GROUPS_ADMIN: 'var(--color-task)',
  SERVICE_ADMIN: 'var(--color-warning)',
  HELP_DESK_ADMIN: 'var(--color-story)',
  USER: 'var(--color-sub)',
};

const STATUS_COLORS = {
  ACTIVE: 'var(--color-success)',
  COMPLETED: 'var(--color-accent)',
  ON_HOLD: 'var(--color-warning)',
  CANCELLED: 'var(--color-danger)',
};

const ROLE_LABEL = { USER: 'Member' };
const roleLabel = (r) => ROLE_LABEL[r] || r;

function ChartCard({ icon: Icon, title, subtitle, children, empty }) {
  return (
    <Card className="flex flex-col">
      <div className="flex items-center gap-2 mb-1">
        <div className="p-1.5 bg-accent-soft text-accent rounded-lg border border-accent/20">
          <Icon className="w-3.5 h-3.5" />
        </div>
        <h3 className="text-sm font-bold text-ink">{title}</h3>
      </div>
      {subtitle && <p className="text-xs text-sub mb-3">{subtitle}</p>}
      {empty ? (
        <div className="flex-1 min-h-[220px] flex items-center justify-center text-xs text-sub">
          No data to display yet.
        </div>
      ) : (
        <div className="mt-2">{children}</div>
      )}
    </Card>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface border border-border rounded-lg px-3 py-2 text-xs">
      {label && <p className="font-semibold text-ink mb-1">{label}</p>}
      {payload.map((p) => (
        <p key={p.dataKey || p.name} className="text-sub flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full inline-block" style={{ background: p.color || p.fill }} />
          <span className="font-medium text-ink">{p.name}</span>: {p.value}
        </p>
      ))}
    </div>
  );
}

/**
 * Client-side computed statistics dashboard for the admin console.
 * Derives all series from the users/projects lists already loaded by the page,
 * so no extra API calls are required.
 */
export default function StatsCharts({ users = [], projects = [], canViewAllProjects = false, systemRoles = [] }) {
  const roleData = useMemo(() => {
    const counts = {};
    for (const u of users) {
      const r = u.role || 'USER';
      counts[r] = (counts[r] || 0) + 1;
    }
    return systemRoles
      .map((r) => ({ name: roleLabel(r), key: r, value: counts[r] || 0 }))
      .filter((d) => d.value > 0);
  }, [users, systemRoles]);

  const statusData = useMemo(() => {
    const counts = { Online: 0, Offline: 0, Suspended: 0 };
    for (const u of users) {
      const isSuspended = u.status === 'suspended' || u.isBlocked;
      if (isSuspended) counts.Suspended += 1;
      else if (u.isOnline) counts.Online += 1;
      else counts.Offline += 1;
    }
    return [
      { name: 'Online', value: counts.Online, color: 'var(--color-success)' },
      { name: 'Offline', value: counts.Offline, color: 'var(--color-accent)' },
      { name: 'Suspended', value: counts.Suspended, color: 'var(--color-danger)' },
    ].filter((d) => d.value > 0);
  }, [users]);

  const growthData = useMemo(() => {
    const now = new Date();
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleDateString('en-US', { month: 'short' }), users: 0 });
    }
    const byKey = Object.fromEntries(months.map((m) => [m.key, m]));
    for (const u of users) {
      if (!u.createdAt) continue;
      const d = new Date(u.createdAt);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (byKey[key]) byKey[key].users += 1;
    }
    let running = 0;
    return months.map((m) => {
      running += m.users;
      return { label: m.label, 'New users': m.users, 'Cumulative': running };
    });
  }, [users]);

  const projectStatusData = useMemo(() => {
    const counts = {};
    for (const p of projects) {
      const s = p.status || 'ACTIVE';
      counts[s] = (counts[s] || 0) + 1;
    }
    return Object.entries(counts).map(([status, value]) => ({ name: status, value, color: STATUS_COLORS[status] || 'var(--color-sub)' }));
  }, [projects]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
      <ChartCard icon={TrendingUp} title="User Growth" subtitle="New sign-ups over the last 6 months" empty={users.length === 0}>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={growthData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-accent)" stopOpacity={0.35} />
                <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--color-sub)' }} axisLine={{ stroke: 'var(--color-border)' }} tickLine={false} />
            <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: 'var(--color-sub)' }} axisLine={false} tickLine={false} width={28} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="Cumulative" stroke="var(--color-accent)" strokeWidth={2} fill="url(#colorCumulative)" />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard icon={PieIcon} title="Users by System Role" subtitle="Distribution of accounts across roles" empty={roleData.length === 0}>
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie data={roleData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={2}>
              {roleData.map((d) => (
                <Cell key={d.key} fill={ROLE_COLORS[d.key] || 'var(--color-sub)'} stroke="#FFFFFF" strokeWidth={2} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              layout="vertical"
              align="right"
              verticalAlign="middle"
              iconType="circle"
              wrapperStyle={{ fontSize: 11, color: 'var(--color-sub)' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard icon={PieIcon} title="Account Status" subtitle="Online, offline, and suspended accounts" empty={statusData.length === 0}>
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={2}>
              {statusData.map((d) => (
                <Cell key={d.name} fill={d.color} stroke="#FFFFFF" strokeWidth={2} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              layout="vertical"
              align="right"
              verticalAlign="middle"
              iconType="circle"
              wrapperStyle={{ fontSize: 11, color: 'var(--color-sub)' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>

      {canViewAllProjects && (
        <ChartCard icon={BarChart3} title="Projects by Status" subtitle="All projects across the system" empty={projectStatusData.length === 0}>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={projectStatusData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--color-sub)' }} axisLine={{ stroke: 'var(--color-border)' }} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: 'var(--color-sub)' }} axisLine={false} tickLine={false} width={28} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--color-bg)' }} />
              <Bar dataKey="value" name="Projects" radius={[6, 6, 0, 0]}>
                {projectStatusData.map((d) => (
                  <Cell key={d.name} fill={d.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      )}
    </div>
  );
}
