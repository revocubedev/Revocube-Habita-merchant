import {
  useEffect,
  useId,
  useRef,
  useState,
  type SelectHTMLAttributes,
} from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type Option = { value: string; label: string; disabled: boolean };

export default function Select({
  children,
  className,
  style,
  disabled,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  const nativeRef = useRef<HTMLSelectElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const id = useId();
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<Option[]>([]);
  const [active, setActive] = useState(0);
  const [selected, setSelected] = useState('');
  const [position, setPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
    maxHeight: 320,
    transform: '',
  });
  const loading = Boolean(disabled && /loading/i.test(selected));
  const typeahead = useRef({ text: '', time: 0 });

  useEffect(() => {
    const select = nativeRef.current;
    if (!select) return;
    setOptions(
      Array.from(select.options, (option) => ({
        value: option.value,
        label: option.text,
        disabled: option.disabled,
      }))
    );
    setSelected(select.selectedOptions[0]?.text ?? 'Select an option');
  }, [children, props.value]);

  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => {
      if (
        !triggerRef.current?.contains(event.target as Node) &&
        !listRef.current?.contains(event.target as Node)
      )
        setOpen(false);
    };
    const close = () => setOpen(false);
    document.addEventListener('pointerdown', outside);
    window.addEventListener('resize', close);
    const onScroll = (event: Event) => {
      if (!listRef.current?.contains(event.target as Node)) close();
    };
    window.addEventListener('scroll', onScroll, true);
    return () => {
      document.removeEventListener('pointerdown', outside);
      window.removeEventListener('resize', close);
      window.removeEventListener('scroll', onScroll, true);
    };
  }, [open]);

  useEffect(() => {
    if (open)
      document
        .getElementById(`${id}-${active}`)
        ?.scrollIntoView({ block: 'nearest' });
  }, [active, open, id]);

  const expand = () => {
    if (disabled || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const below = window.innerHeight - rect.bottom - 12;
    const openBelow =
      below >= Math.min(320, Math.max(1, options.length) * 44 + 8);
    setPosition({
      left: rect.left,
      top: openBelow ? rect.bottom + 6 : rect.top - 6,
      width: rect.width,
      maxHeight: Math.min(320, openBelow ? below : rect.top - 12),
      transform: openBelow ? '' : 'translateY(-100%)',
    });
    setActive(
      Math.max(
        0,
        options.findIndex((option) => option.value === nativeRef.current?.value)
      )
    );
    setOpen(true);
  };
  const choose = (index: number) => {
    const option = options[index];
    if (!option || option.disabled || !nativeRef.current) return;
    nativeRef.current.value = option.value;
    nativeRef.current.dispatchEvent(new Event('change', { bubbles: true }));
    setSelected(option.label);
    setOpen(false);
    triggerRef.current?.focus();
  };
  return (
    <span className="relative block min-w-0">
      <select
        {...props}
        disabled={disabled}
        ref={nativeRef}
        hidden
        tabIndex={-1}
        aria-hidden="true"
        onMouseDown={(event) => event.preventDefault()}
        onClick={(event) => {
          event.preventDefault();
          triggerRef.current?.focus();
          expand();
        }}
        onInvalid={(event) => {
          event.preventDefault();
          triggerRef.current?.focus();
          expand();
        }}
      >
        {children}
      </select>
      <button
        ref={triggerRef}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        aria-activedescendant={open ? `${id}-${active}` : undefined}
        aria-label={props['aria-label'] ?? selected}
        disabled={disabled}
        style={style}
        className={cn(
          'flex min-h-10 w-full items-center justify-between gap-3 rounded-xl border border-border bg-card px-3.5 py-2.5 text-left text-sm text-foreground transition-colors hover:border-brand-text/40 focus:outline-none focus:ring-2 focus:ring-brand-text/20 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        onClick={() => (open ? setOpen(false) : expand())}
        onKeyDown={(event) => {
          if (event.key === 'Escape' && open) {
            event.preventDefault();
            event.stopPropagation();
            setOpen(false);
          } else if (event.key === 'Tab') setOpen(false);
          else if (
            event.key === 'ArrowDown' ||
            event.key === 'ArrowUp' ||
            event.key === 'Home' ||
            event.key === 'End'
          ) {
            event.preventDefault();
            if (!open) {
              expand();
              return;
            }
            const enabled = options
              .map((option, index) => (option.disabled ? -1 : index))
              .filter((index) => index >= 0);
            if (!enabled.length) return;
            const current = enabled.indexOf(active);
            setActive(
              event.key === 'Home'
                ? enabled[0]
                : event.key === 'End'
                  ? enabled[enabled.length - 1]
                  : enabled[
                      (current +
                        (event.key === 'ArrowDown' ? 1 : -1) +
                        enabled.length) %
                        enabled.length
                    ]
            );
          } else if ((event.key === 'Enter' || event.key === ' ') && open) {
            event.preventDefault();
            choose(active);
          } else if (event.key.length === 1 && event.key !== ' ') {
            const now = Date.now();
            typeahead.current = {
              text:
                (now - typeahead.current.time < 600
                  ? typeahead.current.text
                  : '') + event.key.toLowerCase(),
              time: now,
            };
            const index = options.findIndex(
              (option) =>
                !option.disabled &&
                option.label.toLowerCase().startsWith(typeahead.current.text)
            );
            if (!open) expand();
            if (index >= 0) setActive(index);
          }
        }}
      >
        <span className="truncate">{selected || 'Select an option'}</span>
        {loading ? (
          <Loader2
            aria-hidden="true"
            className="h-4 w-4 shrink-0 animate-spin text-brand-text motion-reduce:animate-none"
          />
        ) : (
          <ChevronDown
            aria-hidden="true"
            className={cn(
              'h-4 w-4 shrink-0 text-muted-foreground transition-transform',
              open && 'rotate-180'
            )}
          />
        )}
      </button>
      {open &&
        createPortal(
          <div
            ref={listRef}
            id={id}
            role="listbox"
            aria-label={props['aria-label'] ?? 'Options'}
            style={position}
            className="fixed z-[200] overflow-y-auto overscroll-contain rounded-xl border border-border bg-card p-1 shadow-xl"
            onWheel={(event) => event.stopPropagation()}
          >
            {options.map((option, index) => (
              <div
                key={`${option.value}-${index}`}
                id={`${id}-${index}`}
                role="option"
                aria-selected={nativeRef.current?.value === option.value}
                aria-disabled={option.disabled}
                onPointerDown={(event) => event.preventDefault()}
                onClick={() => choose(index)}
                onMouseMove={() => !option.disabled && setActive(index)}
                className={cn(
                  'flex min-h-10 cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm text-foreground',
                  active === index && !option.disabled && 'bg-muted',
                  nativeRef.current?.value === option.value &&
                    option.value !== '' &&
                    !option.disabled &&
                    'bg-brand-light font-medium text-brand-dark',
                  (option.disabled || option.value === '') &&
                    'text-muted-foreground',
                  option.disabled && 'cursor-not-allowed'
                )}
              >
                <span>{option.label}</span>
                {nativeRef.current?.value === option.value &&
                  option.value !== '' &&
                  !option.disabled && (
                    <Check aria-hidden="true" className="h-4 w-4 shrink-0" />
                  )}
              </div>
            ))}
            {!options.length && (
              <p className="p-3 text-sm text-muted-foreground">
                No options available
              </p>
            )}
          </div>,
          document.body
        )}
    </span>
  );
}
