import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose }) {
  if (!message) return null;

  const styleMap = {
    success: {
      container: 'bg-white border-emerald-200 text-slate-800 shadow-xl shadow-emerald-900/5',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
      bar: 'bg-emerald-600'
    },
    error: {
      container: 'bg-white border-rose-200 text-slate-800 shadow-xl shadow-rose-900/5',
      icon: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />,
      bar: 'bg-rose-600'
    },
    info: {
      container: 'bg-white border-blue-200 text-slate-800 shadow-xl shadow-blue-900/5',
      icon: <Info className="w-5 h-5 text-blue-600 shrink-0" />,
      bar: 'bg-blue-600'
    }
  };

  const style = styleMap[type] || styleMap.success;

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 max-w-md w-[90vw] animate-in fade-in zoom-in-95 slide-in-from-top-4 duration-200">
      <div className={`p-4 rounded-xl border flex items-center justify-between gap-3 relative overflow-hidden backdrop-blur-md ${style.container}`}>
        <div className={`absolute left-0 top-0 bottom-0 w-1 ${style.bar}`} />
        
        <div className="flex items-center gap-3 pl-1 min-w-0">
          {style.icon}
          <p className="text-xs font-semibold text-slate-800 leading-snug truncate">{message}</p>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
