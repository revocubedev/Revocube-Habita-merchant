import {
  useEffect,
  useId,
  useRef,
  useState,
  type InputHTMLAttributes,
} from 'react';
import { createPortal } from 'react-dom';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

type DatePickerProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'value'
> & { value?: string };
type View = 'days' | 'months' | 'years';
const months = Array.from({ length: 12 }, (_, month) =>
  new Date(2026, month, 1).toLocaleDateString('en-GB', { month: 'long' })
);
const weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const dateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
const parseDate = (value: string) => new Date(`${value}T12:00:00`);

export default function DatePicker({
  value = '',
  className,
  style,
  disabled,
  readOnly,
  min,
  max,
  ...props
}: DatePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const id = useId();
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<View>('days');
  const [cursor, setCursor] = useState(() =>
    value ? parseDate(value) : new Date()
  );
  const [position, setPosition] = useState({
    top: 0,
    left: 0,
    width: 320,
    maxHeight: 368,
  });
  const minimum = typeof min === 'string' ? min : undefined;
  const maximum = typeof max === 'string' ? max : undefined;
  const allowed = (date: Date) =>
    (!minimum || dateKey(date) >= minimum) &&
    (!maximum || dateKey(date) <= maximum);
  const today = dateKey(new Date());
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const yearStart = Math.floor(year / 12) * 12;
  const monthStart = new Date(year, month, 1);
  const dates = Array.from(
    { length: 42 },
    (_, index) => new Date(year, month, index - monthStart.getDay() + 1)
  );

  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => {
      if (
        !popupRef.current?.contains(event.target as Node) &&
        !triggerRef.current?.contains(event.target as Node)
      )
        setOpen(false);
    };
    const close = (event: Event) => {
      if (!popupRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', outside);
    window.addEventListener('resize', close);
    window.addEventListener('scroll', close, true);
    return () => {
      document.removeEventListener('pointerdown', outside);
      window.removeEventListener('resize', close);
      window.removeEventListener('scroll', close, true);
    };
  }, [open]);

  const expand = () => {
    if (
      disabled ||
      readOnly ||
      !triggerRef.current ||
      triggerRef.current.matches(':disabled')
    )
      return;
    const rect = triggerRef.current.getBoundingClientRect();
    const width = Math.min(320, window.innerWidth - 24);
    const below = window.innerHeight - rect.bottom - 12;
    const above = rect.top - 12;
    const height = Math.min(368, window.innerHeight - 24);
    setPosition({
      top:
        below >= height
          ? rect.bottom + 6
          : above >= below
            ? Math.max(12, rect.top - height - 6)
            : Math.max(12, window.innerHeight - height - 12),
      left: Math.max(12, Math.min(rect.left, window.innerWidth - width - 12)),
      width,
      maxHeight: height,
    });
    const initial = value ? parseDate(value) : new Date();
    setCursor(
      minimum && dateKey(initial) < minimum
        ? parseDate(minimum)
        : maximum && dateKey(initial) > maximum
          ? parseDate(maximum)
          : initial
    );
    setView('days');
    setOpen(true);
  };
  const choose = (next: string) => {
    const input = inputRef.current;
    if (!input) return;
    Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      'value'
    )?.set?.call(input, next);
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
    setOpen(false);
    triggerRef.current?.focus();
  };
  const shift = (direction: number) => {
    setCursor(
      new Date(
        year +
          (view === 'years'
            ? direction * 12
            : view === 'months'
              ? direction
              : 0),
        month + (view === 'days' ? direction : 0),
        1
      )
    );
  };
  const handleKey = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape' && open) {
      event.preventDefault();
      event.stopPropagation();
      setOpen(false);
      triggerRef.current?.focus();
      return;
    }
    if (event.key === 'Tab' && open) {
      setOpen(false);
      triggerRef.current?.focus();
      return;
    }
    if (event.target !== triggerRef.current) return;
    if (event.key.startsWith('Arrow')) {
      event.preventDefault();
      if (!open) {
        expand();
        return;
      }
      setView('days');
      const offset =
        { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[
          event.key
        ] ?? 0;
      const next = new Date(year, month, cursor.getDate() + offset);
      if (allowed(next)) setCursor(next);
    } else if ((event.key === 'Enter' || event.key === ' ') && open) {
      event.preventDefault();
      if (allowed(cursor)) choose(dateKey(cursor));
    } else if ((event.key === 'PageUp' || event.key === 'PageDown') && open) {
      event.preventDefault();
      shift(event.key === 'PageUp' ? -1 : 1);
    }
  };

  const navClass =
    'flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-text/30';
  return (
    <span className="relative block w-full min-w-0">
      <input
        {...props}
        ref={inputRef}
        type="date"
        value={value}
        min={min}
        max={max}
        disabled={disabled}
        readOnly={readOnly}
        tabIndex={-1}
        aria-hidden="true"
        className="sr-only"
        onInvalid={(event) => {
          event.preventDefault();
          triggerRef.current?.focus();
          expand();
        }}
      />
      <button
        type="button"
        ref={triggerRef}
        disabled={disabled}
        aria-disabled={readOnly}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        aria-label={
          props['aria-label'] ??
          (value
            ? `Choose date, ${parseDate(value).toLocaleDateString('en-GB', { dateStyle: 'long' })}`
            : 'Choose date')
        }
        style={style}
        className={cn(
          'flex min-h-11 w-full items-center justify-between gap-3 rounded-xl border border-border bg-card px-3.5 py-2.5 text-left text-sm text-foreground transition-colors hover:border-brand-text/40 focus:outline-none focus:ring-2 focus:ring-brand-text/20 disabled:cursor-not-allowed disabled:opacity-50',
          !value && 'text-muted-foreground',
          className
        )}
        onClick={() => (open ? setOpen(false) : expand())}
        onKeyDown={handleKey}
      >
        <span>
          {value
            ? parseDate(value).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })
            : (props.placeholder ?? 'Select a date')}
        </span>
        <CalendarDays
          aria-hidden="true"
          className="h-4 w-4 shrink-0 text-muted-foreground"
        />
      </button>
      {open &&
        createPortal(
          <div
            ref={popupRef}
            id={id}
            role="dialog"
            aria-label="Choose date"
            style={position}
            className="fixed z-[200] overflow-y-auto overscroll-contain rounded-2xl border border-border bg-card p-3 text-foreground shadow-xl"
            onKeyDown={handleKey}
          >
            <div className="mb-3 flex items-center justify-between gap-2">
              <button
                type="button"
                aria-label={
                  view === 'days' ? 'Previous month' : 'Previous years'
                }
                className={navClass}
                onClick={() => shift(-1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <div
                aria-live="polite"
                className="flex items-center gap-1 text-sm font-semibold"
              >
                <button
                  type="button"
                  className="rounded-lg px-2 py-1.5 hover:bg-muted"
                  onClick={() => setView(view === 'months' ? 'days' : 'months')}
                >
                  {months[month]}
                </button>
                <button
                  type="button"
                  className="rounded-lg px-2 py-1.5 hover:bg-muted"
                  onClick={() => setView(view === 'years' ? 'days' : 'years')}
                >
                  {view === 'years' ? `${yearStart}–${yearStart + 11}` : year}
                </button>
              </div>
              <button
                type="button"
                aria-label={view === 'days' ? 'Next month' : 'Next years'}
                className={navClass}
                onClick={() => shift(1)}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            {view === 'days' ? (
              <>
                <div className="mb-1 grid grid-cols-7 text-center text-xs font-medium text-muted-foreground">
                  {weekdays.map((day) => (
                    <span key={day} className="py-1">
                      {day}
                    </span>
                  ))}
                </div>
                <div
                  role="group"
                  aria-label={`${months[month]} ${year}`}
                  className="grid grid-cols-7 gap-1"
                >
                  {dates.map((date) => {
                    const key = dateKey(date);
                    return (
                      <button
                        type="button"
                        key={key}
                        aria-label={date.toLocaleDateString('en-GB', {
                          dateStyle: 'full',
                        })}
                        aria-pressed={key === value}
                        aria-current={key === today ? 'date' : undefined}
                        disabled={!allowed(date)}
                        onClick={() => choose(key)}
                        className={cn(
                          'flex h-8 items-center justify-center rounded-lg text-sm transition-colors hover:bg-brand-light hover:text-brand-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-text/30 disabled:cursor-not-allowed disabled:opacity-25',
                          date.getMonth() !== month &&
                            'text-muted-foreground/60',
                          key === today &&
                            'font-semibold ring-1 ring-inset ring-brand-text/40',
                          key === dateKey(cursor) &&
                            key !== value &&
                            'bg-muted',
                          key === value &&
                            'bg-brand-text font-medium text-white hover:bg-brand-text/90 hover:text-white'
                        )}
                      >
                        {date.getDate()}
                      </button>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {Array.from({ length: 12 }, (_, index) => {
                  const label =
                    view === 'months'
                      ? months[index].slice(0, 3)
                      : String(yearStart + index);
                  const active =
                    view === 'months'
                      ? index === month
                      : yearStart + index === year;
                  return (
                    <button
                      type="button"
                      key={label}
                      className={cn(
                        'rounded-lg px-2 py-3 text-sm hover:bg-brand-light hover:text-brand-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-text/30',
                        active && 'bg-brand-light font-medium text-brand-text'
                      )}
                      onClick={() => {
                        setCursor(
                          new Date(
                            view === 'years' ? yearStart + index : year,
                            view === 'months' ? index : month,
                            1
                          )
                        );
                        setView(view === 'years' ? 'months' : 'days');
                        requestAnimationFrame(() =>
                          popupRef.current
                            ?.querySelector<HTMLButtonElement>('button')
                            ?.focus()
                        );
                      }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            )}
            <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
              <button
                type="button"
                disabled={!value || props.required}
                onClick={() => choose('')}
                className="rounded-lg px-2 py-1.5 text-xs text-muted-foreground hover:bg-muted disabled:opacity-40"
              >
                Clear
              </button>
              <button
                type="button"
                disabled={!allowed(new Date())}
                onClick={() => choose(today)}
                className="rounded-lg bg-brand-light px-3 py-1.5 text-xs font-medium text-brand-text hover:bg-brand-text/10 disabled:opacity-40"
              >
                Today
              </button>
            </div>
          </div>,
          document.body
        )}
    </span>
  );
}
