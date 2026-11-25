import { createRoot } from 'react-dom/client';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { CircleCheck } from 'lucide-react';

interface DialogOptions {
  title?: string;
  text?: string;
  icon?: string;
  showCancelButton?: boolean;
  confirmButtonText?: string;
  cancelButtonText?: string;
  confirmButtonColor?: string;
  timer?: number;
  timerProgressBar?: boolean;
}
let queue = Promise.resolve();

function fire(options: DialogOptions): Promise<{ isConfirmed: boolean }> {
  const result = queue.then(
    () =>
      new Promise<{ isConfirmed: boolean }>((resolve) => {
        const container = document.createElement('div');
        document.body.appendChild(container);
        const root = createRoot(container);
        const timedSuccess =
          options.icon === 'success' && Boolean(options.timer);
        let timer: ReturnType<typeof setTimeout> | undefined;
        let finished = false;
        const finish = (isConfirmed: boolean) => {
          if (finished) return;
          finished = true;
          clearTimeout(timer);
          root.unmount();
          container.remove();
          resolve({ isConfirmed });
        };
        root.render(
          <Modal
            isOpen
            onClose={() => finish(false)}
            title={options.title ?? 'Notice'}
            size="sm"
            showCloseButton={!timedSuccess}
          >
            {timedSuccess ? (
              <div role="status" className="py-2 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/10 text-success">
                  <CircleCheck
                    aria-hidden="true"
                    className="h-9 w-9"
                    strokeWidth={1.75}
                  />
                </div>
                <p className="text-base font-medium text-foreground">
                  {options.text ?? 'Welcome back!'}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Taking you to your dashboard...
                </p>
                {options.timerProgressBar && (
                  <div
                    aria-hidden="true"
                    className="mt-6 h-1 overflow-hidden rounded-full bg-muted"
                  >
                    <div
                      className="h-full origin-left rounded-full bg-success"
                      style={{
                        animation: `dialog-countdown ${options.timer}ms linear forwards`,
                      }}
                    />
                  </div>
                )}
              </div>
            ) : (
              <>
                <p className="text-sm text-muted-foreground leading-6">
                  {options.text}
                </p>
                <div className="mt-6 flex justify-end gap-3">
                  {options.showCancelButton && (
                    <Button variant="outline" onClick={() => finish(false)}>
                      {options.cancelButtonText ?? 'Cancel'}
                    </Button>
                  )}
                  <Button
                    className="bg-brand-text text-white hover:bg-brand-text/90"
                    onClick={() => finish(true)}
                  >
                    {options.confirmButtonText ?? 'OK'}
                  </Button>
                </div>
              </>
            )}
          </Modal>
        );
        if (timedSuccess) timer = setTimeout(() => finish(true), options.timer);
      })
  );
  queue = result.then(() => undefined);
  return result;
}
export const showAlert = (text: string) => fire({ title: 'Notice', text });

export const confirmAction = async (text: string) =>
  (
    await fire({
      title: 'Confirm action',
      text,
      showCancelButton: true,
      confirmButtonText: 'Confirm',
    })
  ).isConfirmed;

export default { fire };
