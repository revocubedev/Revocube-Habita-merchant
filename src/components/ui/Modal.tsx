import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

const openPanels: (HTMLDivElement | null)[] = [];
let scrollLocks = 0;
let originalOverflow = '';
function lockScroll() {
  if (scrollLocks++ === 0) {
    originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  }
  return () => {
    if (--scrollLocks === 0) document.body.style.overflow = originalOverflow;
  };
}

export const inputCls =
  'w-full px-3.5 py-2.5 rounded-xl border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-text/20';

export function Field({
  label,
  children,
  className,
}: {
  label: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn('block', className)}>
      <span className="block text-sm font-medium mb-1.5 text-muted-foreground">
        {label}
      </span>
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
  presentation = 'modal',
  closeIcon,
  bodyClassName = 'px-6 py-5',
  variant = 'modal',
}: ModalProps) => {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  const isDrawer = variant === 'drawer' || presentation === 'drawer';
  useEffect(() => {
    if (!isOpen) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const release = lockScroll();
    const panel = panelRef.current;
    const frame = requestAnimationFrame(() => panel?.focus());
    const onKey = (e: KeyboardEvent) => {
      if (openPanels[openPanels.length - 1] !== panel) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopImmediatePropagation();
        closeRef.current();
      }
      if (e.key === 'Tab' && panel) {
        const items = Array.from(
          panel.querySelectorAll<HTMLElement>(
            'button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href], [tabindex="0"]'
          )
        ).filter((el) => el.getClientRects().length > 0);
        const first = items[0];
        const last = items[items.length - 1];
        if (!first) {
          e.preventDefault();
          panel.focus();
        } else if (
          e.shiftKey &&
          (document.activeElement === first || document.activeElement === panel)
        ) {
          e.preventDefault();
          last.focus();
        } else if (
          !e.shiftKey &&
          (document.activeElement === last || document.activeElement === panel)
        ) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    openPanels.push(panel);
    document.addEventListener('keydown', onKey);
    return () => {
      cancelAnimationFrame(frame);
      openPanels.splice(openPanels.indexOf(panel), 1);
      release();
      document.removeEventListener('keydown', onKey);
      previousFocus?.focus();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Portal to body so page transforms/animations can't trap the fixed overlay.
  return createPortal(
    <div
      className={cn(
        'fixed inset-0 z-[100] flex overflow-y-auto',
        isDrawer ? 'justify-end' : 'justify-center px-4 sm:px-6',
        isDrawer
          ? 'items-start'
          : align === 'center'
            ? 'items-center py-6'
            : 'items-start py-10'
      )}
      style={{
        fontFamily: 'Poppins, sans-serif',
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
      }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={cn(
          'outline-none w-full flex flex-col bg-card text-card-foreground shadow-lg',
          isDrawer
            ? 'h-dvh max-w-[640px] border-l border-border'
            : [
                'max-h-[calc(100vh-3rem)] rounded-2xl border border-border',
                sizes[size],
              ]
        )}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div
          className={cn(
            'flex items-center justify-between border-b border-border shrink-0',
            'px-6 py-4'
          )}
        >
          <h2
            id={titleId}
            className={cn('text-foreground', 'font-semibold text-base')}
          >
            {title}
          </h2>
          {showCloseButton && (
            <button
              type="button"
              onClick={onClose}
              className={cn(
                'rounded-full hover:bg-border flex items-center justify-center transition-colors',
                'w-9 h-9 bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-text'
              )}
              aria-label="Close"
            >
              {closeIcon ?? <X className="w-4 h-4 text-muted-foreground" />}
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
};

export default Modal;
