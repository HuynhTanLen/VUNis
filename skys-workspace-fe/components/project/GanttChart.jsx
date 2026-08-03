import { useState, useEffect } from 'react';
import { getTasksByProject } from '../../services/taskService';
import { BarChart3, Loader2 } from 'lucide-react';

const STATUS_COLORS = {
  Todo:       { bar: 'bg-accent', badge: 'bg-accent-soft text-accent border-accent/20' },
  InProgress: { bar: 'bg-warning', badge: 'bg-warning-soft text-warning border-warning/20' },
  Done:       { bar: 'bg-success', badge: 'bg-success-soft text-success border-success/20' },
};

const STATUS_LABELS = {
  Todo: 'Cần làm',
  InProgress: 'Đang làm',
  Done: 'Hoàn thành',
};

export default function GanttChart({ projectId }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await getTasksByProject(projectId);
        setTasks(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [projectId]);

  const today = new Date();
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    return d;
  });

  const getBarWidth = (status) => {
    if (status === 'Done') return '100%';
    if (status === 'InProgress') return '55%';
    return '15%';
  };

  const totalTasks = tasks.length;
  const doneTasks  = tasks.filter(t => t.status === 'Done').length;
  const inProgress = tasks.filter(t => t.status === 'InProgress').length;
  const todo       = tasks.filter(t => t.status === 'Todo').length;

  return (
    <div className="space-y-5">
      <div className="card-clean p-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
          <h3 className="text-xs font-semibold text-ink uppercase tracking-wider flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4 text-accent" />
            Biểu đồ tiến độ Gantt
          </h3>
          <div className="flex flex-wrap gap-4">
            {[
              { label: `Cần làm`, count: todo, color: 'bg-accent' },
              { label: `Đang làm`, count: inProgress, color: 'bg-warning' },
              { label: `Hoàn thành`, count: doneTasks, color: 'bg-success' },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${item.color}`} />
                <span className="text-xs font-medium text-sub">{item.label} (<span className="font-mono">{item.count}</span>)</span>
              </div>
            ))}
          </div>
        </div>

        {totalTasks > 0 && (
          <div className="mt-4">
            <div className="h-1.5 bg-bg rounded-full overflow-hidden">
              <div
                className="h-full bg-accent rounded-full transition-all duration-500"
                style={{ width: `${Math.round((doneTasks / totalTasks) * 100)}%` }}
              />
            </div>
            <p className="text-xs text-sub font-medium mt-2">
              <span className="font-mono">{doneTasks}/{totalTasks}</span> công việc đã hoàn thành (<span className="font-mono">{Math.round((doneTasks / totalTasks) * 100)}%</span>)
            </p>
          </div>
        )}
      </div>

      <div className="card-clean overflow-hidden">
        {loading ? (
          <div className="text-center py-16">
            <Loader2 className="w-6 h-6 text-accent animate-spin mx-auto mb-2" />
            <p className="text-sub text-xs font-medium uppercase tracking-wider">Đang tính toán sơ đồ Gantt...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-16 text-sub">
            <p className="font-semibold text-xs uppercase tracking-wider text-ink">Bảng tiến độ Gantt trống</p>
            <p className="text-xs mt-1">Vui lòng khởi tạo các nhiệm vụ tại mục Bảng Kanban.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[950px] divide-y divide-border">
              <div className="flex bg-bg border-b border-border">
                <div className="w-52 shrink-0 px-4 py-3 text-[10px] font-bold text-sub uppercase tracking-wider flex items-center">
                  Nhiệm vụ
                </div>
                <div className="w-28 shrink-0 px-3 py-3 text-[10px] font-bold text-sub uppercase tracking-wider flex items-center">
                  Trạng thái
                </div>
                <div className="w-28 shrink-0 px-3 py-3 text-[10px] font-bold text-sub uppercase tracking-wider flex items-center">
                  Vai trò
                </div>
                <div className="flex flex-1">
                  {days.map((day, i) => (
                    <div
                      key={i}
                      className={`flex-1 py-2 text-center text-[10px] font-medium border-r border-border uppercase flex flex-col justify-center font-mono ${
                        day.getDay() === 0 || day.getDay() === 6
                          ? 'text-danger bg-danger-soft/40'
                          : i === 0
                          ? 'text-accent bg-accent-soft/60'
                          : 'text-sub'
                      }`}
                    >
                      <div>{day.getDate()}/{day.getMonth() + 1}</div>
                      <div className="text-[9px] mt-0.5 opacity-60">
                        {['CN','T2','T3','T4','T5','T6','T7'][day.getDay()]}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {tasks.map((task) => {
                const sc = STATUS_COLORS[task.status] || STATUS_COLORS.Todo;
                return (
                  <div
                    key={task.id}
                    className="flex hover:bg-accent-soft/30 transition-colors"
                  >
                    <div className="w-52 shrink-0 px-4 py-3 border-r border-border flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${sc.bar}`} />
                      <span className="text-xs font-semibold text-ink truncate">{task.title}</span>
                    </div>

                    <div className="w-28 shrink-0 px-3 py-3 border-r border-border flex items-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${sc.badge}`}>
                        {STATUS_LABELS[task.status] || task.status}
                      </span>
                    </div>

                    <div className="w-28 shrink-0 px-3 py-3 border-r border-border flex items-center">
                      {task.role ? (
                        <span className="text-xs bg-bg text-sub border border-border px-2 py-0.5 rounded font-mono truncate">
                          {task.role}
                        </span>
                      ) : (
                        <span className="text-xs text-sub font-normal">—</span>
                      )}
                    </div>

                    <div className="flex-1 px-3 py-3 flex items-center">
                      <div className="relative w-full h-5 bg-bg rounded border border-border overflow-hidden">
                        <div
                          className={`h-full ${sc.bar} rounded-r flex items-center px-2 transition-all duration-500`}
                          style={{ width: getBarWidth(task.status) }}
                        >
                          <span className="text-[10px] font-semibold text-white whitespace-nowrap">
                            {STATUS_LABELS[task.status]}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
