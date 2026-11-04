import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export const inputCls =
  'w-full px-4 py-3 rounded-xl border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-text/20';

export function Field({ label, children, className }: { label: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <label className={cn('block', className)}>
      <span className="block text-sm font-medium mb-2 text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
  align?: 'start' | 'center';
  bodyClassName?: string;
}

const sizes = {
  sm: 'max-w-[420px]',
  md: 'max-w-[560px]',
  lg: 'max-w-[720px]',
  xl: 'max-w-[960px]',
};

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  align = 'center',
  bodyClassName = 'px-8 py-6',
}: ModalProps) => {
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Portal to body so page transforms/animations can't trap the fixed overlay.
  return createPortal(
    <div
      className={cn(
        'fixed inset-0 z-[100] flex justify-center overflow-y-auto px-6',
        align === 'center' ? 'items-center py-10' : 'items-start py-16'
      )}
      style={{ fontFamily: 'Poppins, sans-serif', backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={cn('w-full bg-card text-card-foreground rounded-2xl border border-border shadow-lg', sizes[size])}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-8 py-5 border-b border-border">
          <h2 className="font-semibold text-[16px] text-foreground">{title}</h2>
          {showCloseButton && (
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-muted hover:bg-border flex items-center justify-center transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>
        <div className={bodyClassName}>{children}</div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;
