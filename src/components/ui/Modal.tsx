import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export const inputCls =
  'w-full px-3.5 py-2.5 rounded-xl border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-text/20';

export function Field({ label, children, className }: { label: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <label className={cn('block', className)}>
      <span className="block text-sm font-medium mb-1.5 text-muted-foreground">{label}</span>
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
  presentation?: 'modal' | 'drawer';
  closeIcon?: React.ReactNode;
  variant?: 'modal' | 'drawer';
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
  presentation = 'modal',
  closeIcon,
  bodyClassName = 'px-6 py-5',
  variant = 'modal',
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

  if (variant === 'drawer') {
    return createPortal(
      <div
        className="fixed inset-0 z-[100] flex justify-end"
        style={{ fontFamily: 'Poppins, sans-serif', backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
        role="dialog"
        aria-modal="true"
      >
        <div
          className="h-full w-full sm:max-w-[640px] flex flex-col bg-card text-card-foreground border-l border-border shadow-lg animate-in slide-in-from-right duration-300"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
            <h2 className="font-medium text-[16px] text-foreground">{title}</h2>
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
          <div className={cn('overflow-y-auto flex-1 min-h-0', bodyClassName)}>
            {children}
          </div>
        </div>
      </div>,
      document.body
    );
  }

  // Portal to body so page transforms/animations can't trap the fixed overlay.
  return createPortal(
    <div
      className={cn(
        'fixed inset-0 z-[100] flex overflow-y-auto',
        presentation === 'drawer' ? 'justify-end' : 'justify-center px-6',
        presentation === 'drawer' ? 'items-start' : align === 'center' ? 'items-center py-10' : 'items-start py-16'
        'fixed inset-0 z-[100] flex justify-center overflow-y-auto px-6',
        align === 'center' ? 'items-center py-6' : 'items-start py-10'
      )}
      style={{ fontFamily: 'Poppins, sans-serif', backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={cn('w-full bg-card text-card-foreground shadow-lg', presentation === 'drawer' ? 'h-dvh max-w-[622px] overflow-y-auto' : ['rounded-2xl border border-border', sizes[size]])}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className={cn('flex items-center justify-between px-8 border-b border-border', presentation === 'drawer' ? 'h-[50px] border-[#eaeaea]' : 'py-5')}>
          <h2 className={cn('text-foreground', presentation === 'drawer' ? 'text-sm font-medium' : 'font-semibold text-[16px]')}>{title}</h2>
        className={cn('w-full max-h-[calc(100vh-3rem)] flex flex-col bg-card text-card-foreground rounded-2xl border border-border shadow-lg', sizes[size])}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <h2 className="font-semibold text-[16px] text-foreground">{title}</h2>
          {showCloseButton && (
            <button
              type="button"
              onClick={onClose}
              className={cn('rounded-full hover:bg-border flex items-center justify-center transition-colors', presentation === 'drawer' ? 'h-[26px] w-[26px] bg-[#f6f6f6]' : 'w-9 h-9 bg-muted')}
              aria-label="Close"
            >
              {closeIcon ?? <X className="w-4 h-4 text-muted-foreground" />}
            </button>
          )}
        </div>
        <div className={cn('overflow-y-auto flex-1 min-h-0', bodyClassName)}>{children}</div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;
