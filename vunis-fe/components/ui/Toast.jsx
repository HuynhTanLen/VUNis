import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose }) {
  if (!message) return null;

  const styleMap = {
    success: {
      container: 'bg-surface border-success/20 text-ink shadow-lg',
      icon: <CheckCircle2 className="w-5 h-5 text-success shrink-0" />,
      bar: 'bg-success'
    },
    error: {
      container: 'bg-surface border-danger/20 text-ink shadow-lg',
      icon: <AlertCircle className="w-5 h-5 text-danger shrink-0" />,
      bar: 'bg-danger'
    },
    info: {
      container: 'bg-surface border-accent/20 text-ink shadow-lg',
      icon: <Info className="w-5 h-5 text-accent shrink-0" />,
      bar: 'bg-accent'
    }
  };

  const style = styleMap[type] || styleMap.success;

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 max-w-md w-[90vw]">
      <div className={`p-4 rounded-xl border flex items-center justify-between gap-3 relative overflow-hidden ${style.container}`}>
        <div className={`absolute left-0 top-0 bottom-0 w-1 ${style.bar}`} />
        
        <div className="flex items-center gap-3 pl-1 min-w-0">
          {style.icon}
          <p className="text-xs font-semibold text-ink leading-snug truncate">{message}</p>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-sub hover:text-ink hover:bg-accent-soft transition-colors focus:outline-none focus:ring-2 focus:ring-accent/20 shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
