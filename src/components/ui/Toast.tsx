import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ToastProps } from '@/types';

const Toast = ({ type, message, onClose }: ToastProps & { onClose: () => void }) => {
  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
  };

  const colors = {
    success: 'bg-success/10 border-success text-success',
    error: 'bg-danger/10 border-danger text-danger',
    warning: 'bg-warning/10 border-warning text-warning',
    info: 'bg-accent/10 border-accent text-accent',
  };

  const Icon = icons[type];

  return (
    <div className={cn(
      'flex items-center gap-3 p-4 rounded-lg border shadow-lg animate-slide-up',
      colors[type]
    )}>
      <Icon className="w-5 h-5 flex-shrink-0" />
      <p className="text-sm font-medium flex-1">{message}</p>
      <button
        onClick={onClose}
        className="p-1 rounded hover:bg-black/5 transition-colors"
        aria-label="Close toast"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Toast;
