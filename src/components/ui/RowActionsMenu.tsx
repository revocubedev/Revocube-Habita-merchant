import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface RowActionItem {
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  danger?: boolean;
  disabled?: boolean;
}

/** One line inside a row menu. Use it directly when you need custom state (e.g. a delete that shows "Deleting..."). */
export const RowAction = ({
  children,
  className,
  danger,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { danger?: boolean }) => (
  <button
    type="button"
    role="menuitem"
    className={cn(
      'w-full text-left px-3 py-2 text-sm hover:bg-muted rounded flex items-center gap-2 disabled:opacity-50',
      className
    )}
    style={danger ? { color: '#f30100' } : undefined}
    {...props}
  >
    {children}
  </button>
);

interface RowActionsMenuProps {
  items?: RowActionItem[];
  /** Pass nodes instead of `items` when a row needs custom behaviour. */
  children?: React.ReactNode | ((close: () => void) => React.ReactNode);
  /** aria-label for the three-dots button. */
  label?: string;
  /** Preferred panel width in px. */
  panelWidth?: number;
  /** Which edge of the button the panel lines up with. */
  align?: 'left' | 'right';
  triggerClassName?: string;
  panelClassName?: string;
}

const GAP = 6;
const EDGE = 8;

/**
 * Three-dots row menu.
 *
 * The panel is portalled to <body> and positioned with `position: fixed`, so it is
 * never clipped by the table's scroll container and it flips above the button when
 * there is no room below it.
 */
const RowActionsMenu = ({
  items,
  children,
  label = 'Row actions',
  panelWidth = 176,
  align = 'right',
  triggerClassName,
  panelClassName,
}: RowActionsMenuProps) => {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const place = () => {
    const trigger = triggerRef.current;
    const panel = panelRef.current;
    if (!trigger || !panel) return;

    const rect = trigger.getBoundingClientRect();
    const height = panel.offsetHeight;
    const width = panel.offsetWidth;

    const spaceBelow = window.innerHeight - rect.bottom - GAP;
    const fitsBelow = spaceBelow >= height;
    const top = fitsBelow
      ? rect.bottom + GAP
      : Math.max(EDGE, rect.top - height - GAP);

    let left = align === 'right' ? rect.right - width : rect.left;
    left = Math.min(Math.max(left, EDGE), Math.max(EDGE, window.innerWidth - width - EDGE));

    setPos({ top, left });
  };

  useLayoutEffect(() => {
    if (!open) {
      setPos(null);
      return;
    }
    place();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (triggerRef.current?.contains(target)) return; // the button's own onClick toggles
      if (panelRef.current?.contains(target)) return;
      setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    const reposition = () => place();

    document.addEventListener('mousedown', onPointerDown, true);
    document.addEventListener('keydown', onKeyDown);
    window.addEventListener('scroll', reposition, true);
    window.addEventListener('resize', reposition);

    return () => {
      document.removeEventListener('mousedown', onPointerDown, true);
      document.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('scroll', reposition, true);
      window.removeEventListener('resize', reposition);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'inline-flex w-8 h-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-text/30',
          triggerClassName
        )}
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>

      {open &&
        createPortal(
          <div
            ref={panelRef}
            role="menu"
            className={cn(
              'fixed z-[120] bg-card border border-border rounded-lg shadow-lg p-1',
              panelClassName
            )}
            style={{
              width: panelWidth,
              top: pos?.top ?? -9999,
              left: pos?.left ?? -9999,
              visibility: pos ? 'visible' : 'hidden',
              fontFamily: 'Poppins, sans-serif',
              borderColor: '#e3e3e3',
              borderRadius: 8,
            }}
            onMouseDown={(event) => event.stopPropagation()}
          >
            {(() => {
              const content =
                typeof children === 'function' ? children(() => setOpen(false)) : children;
              return (
                content ??
                items?.map((item) => (
                  <RowAction
                    key={item.label}
                    danger={item.danger}
                    disabled={item.disabled}
                    onClick={() => {
                      setOpen(false);
                      item.onClick?.();
                    }}
                  >
                    {item.icon}
                    {item.label}
                  </RowAction>
                ))
              );
            })()}
          </div>,
          document.body
        )}
    </>
  );
};

export default RowActionsMenu;
