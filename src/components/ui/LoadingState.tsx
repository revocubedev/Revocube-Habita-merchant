import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function LoadingState({
  label = 'Loading...',
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <span
      role="status"
      aria-live="polite"
      className={cn(
        'flex w-full items-center justify-center gap-2.5 py-6 text-sm text-muted-foreground',
        className
      )}
    >
      <Loader2
        aria-hidden="true"
        className="h-5 w-5 shrink-0 animate-spin text-brand-text motion-reduce:animate-none"
      />
      {label}
    </span>
  );
}
export function CardSkeletons({ count = 4 }: { count?: number }) {
  return (
    <div
      role="status"
      aria-label="Loading properties"
      className="grid grid-cols-1 gap-6 p-6 sm:grid-cols-2 xl:grid-cols-4"
    >
      <span className="sr-only">Loading properties...</span>
      {Array.from({ length: count }, (_, index) => (
        <div
          aria-hidden="true"
          key={index}
          className="overflow-hidden rounded-xl border border-border bg-card"
        >
          <div className="h-40 animate-pulse bg-muted motion-reduce:animate-none" />
          <div className="space-y-3 p-4">
            <div className="h-4 w-2/3 rounded bg-muted animate-pulse motion-reduce:animate-none" />
            <div className="h-3 w-full rounded bg-muted" />
            <div className="h-3 w-4/5 rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}
