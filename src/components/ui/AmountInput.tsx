import { useState, useEffect, type InputHTMLAttributes } from 'react';
import { inputCls } from './Modal';
import { cn } from '@/lib/utils';

export function formatAmountInput(value: string) {
  const [integer, decimal] = value.split('.');
  return (
    integer.replace(/\B(?=(\d{3})+(?!\d))/g, ',') +
    (decimal === undefined ? '' : '.' + decimal)
  );
}
export default function AmountInput({
  value,
  onValueChange,
  className,
  ...props
}: Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'value' | 'onChange' | 'type'
> & { value: number; onValueChange: (value: number) => void }) {
  const [draft, setDraft] = useState(value ? String(value) : '');

  useEffect(() => {
    if (Number(draft) !== value) setDraft(value ? String(value) : '');
  }, [value, draft]);
  return (
    <input
      {...props}
      className={cn(inputCls, className)}
      type="text"
      inputMode="decimal"
      value={formatAmountInput(draft)}
      onChange={(event) => {
        const raw = event.target.value.replace(/,/g, '');
        if (!/^\d*(\.\d{0,2})?$/.test(raw)) return;
        setDraft(raw);
        onValueChange(Number(raw) || 0);
      }}
    />
  );
}
