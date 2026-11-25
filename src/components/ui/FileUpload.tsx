import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type InputHTMLAttributes,
} from 'react';
import { FileCheck2, UploadCloud } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadProps extends InputHTMLAttributes<HTMLInputElement> {
  file?: File | null;
}

const FileUpload = forwardRef<HTMLInputElement, FileUploadProps>(
  ({ className, onChange, disabled, accept, file, ...props }, ref) => {
    const inputRef = useRef<HTMLInputElement>(null);
    useImperativeHandle(ref, () => inputRef.current!, []);

    useEffect(() => {
      if (file === null && inputRef.current) inputRef.current.value = '';
    }, [file]);
    const [chosenFiles, setFiles] = useState<File[]>([]);
    const files = file === undefined ? chosenFiles : file ? [file] : [];
    const Icon = files.length ? FileCheck2 : UploadCloud;
    return (
      <div
        onDragOver={(event) => {
          if (!disabled) event.preventDefault();
        }}
        onDrop={(event) => {
          event.preventDefault();
          const input = inputRef.current;
          if (
            disabled ||
            !input ||
            input.disabled ||
            input.matches(':disabled') ||
            !event.dataTransfer.files.length
          )
            return;
          const transfer = new DataTransfer();
          Array.from(event.dataTransfer.files)
            .slice(0, props.multiple ? undefined : 1)
            .forEach((file) => transfer.items.add(file));
          input.files = transfer.files;
          input.dispatchEvent(new Event('change', { bubbles: true }));
        }}
        className={cn(
          'relative flex min-h-24 w-full items-center gap-3 rounded-xl border border-dashed border-border bg-muted/20 p-4 transition-colors focus-within:border-brand-text focus-within:ring-2 focus-within:ring-brand-text/15 hover:border-brand-text/50 hover:bg-brand-light/20',
          disabled && 'opacity-50',
          className
        )}
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-light text-brand-text">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-foreground">
            {files.length
              ? files.map((file) => file.name).join(', ')
              : 'Choose a file or drag it here'}
          </span>
          <span className="mt-1 block text-xs text-muted-foreground">
            {files.length
              ? `${(files.reduce((size, file) => size + file.size, 0) / 1024).toLocaleString(undefined, { maximumFractionDigits: 1 })} KB · Click to replace`
              : accept
                ? `Accepted: ${accept.replace('image/*', 'Images').replace('application/pdf', 'PDF')}`
                : 'Browse files on your device'}
          </span>
        </span>
        <input
          {...props}
          ref={inputRef}
          type="file"
          accept={accept}
          disabled={disabled}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
          onChange={(event) => {
            setFiles(Array.from(event.target.files ?? []));
            onChange?.(event);
          }}
        />
      </div>
    );
  }
);
FileUpload.displayName = 'FileUpload';

export default FileUpload;
