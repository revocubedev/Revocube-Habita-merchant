
import { useState } from 'react';
import { Landmark, Send } from 'lucide-react';

import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/Table';

import {
  useGetInvoice,
  useIssueInvoice,
} from '@/api/api_controllers/invoiceController';

import {
  Invoice,
  invoiceDate,
  invoiceLabel,
  invoiceMoney,
} from '@/lib/invoices';


export function InvoiceSummary({ invoice }: { invoice: Invoice }) {
  return (
    <div className="space-y-7">
      <div className="flex justify-between gap-4 flex-wrap">
        <div>
          <img
            src="/assets/spacesl.png"
            alt="Revocube Spaces"
            className="w-28 h-auto mb-3"
          />

          <p className="text-sm break-all">
            {invoice.invoiceNumber || 'Invoice Preview'}
          </p>
        </div>

        <dl className="text-sm space-y-2 text-right">
          <div>
            <dt className="inline text-muted-foreground mr-3">
              Invoice Month
            </dt>

            <dd className="inline">
              {invoiceDate(invoice.invoiceMonth, true)}
            </dd>
          </div>

          <div>
            <dt className="inline text-muted-foreground mr-3">
              Due Date
            </dt>

            <dd className="inline">
              {invoiceDate(invoice.dueDate)}
            </dd>
          </div>

          <div>
            <dt className="inline text-muted-foreground mr-3">
              Status
            </dt>

            <dd className="inline text-brand-text">
              {invoiceLabel(invoice.status)}
            </dd>
          </div>
        </dl>
      </div>

      <div className="grid grid-cols-2 border border-border rounded-lg divide-x divide-border">
        <div className="p-4 space-y-2 min-w-0">
          <p className="text-xs text-muted-foreground">
            From
          </p>

          <p className="text-sm font-medium break-words">
            {invoice.receivingAccount?.accountName || '—'}
          </p>

          <p className="text-sm text-muted-foreground">
            {invoice.receivingAccount?.bankName}
          </p>
        </div>

        <div className="p-4 space-y-2 min-w-0">
          <p className="text-xs text-muted-foreground">
            Recipients
          </p>

          <p className="text-sm break-words">
            {invoice.propertyScope === 'ENTIRE_ESTATE'
              ? 'Entire Estate'
              : invoice.properties.map(p => p.name).join(', ') || '—'}
          </p>

          <p className="text-sm text-muted-foreground break-words">
            {invoice.unitScope === 'ALL_UNITS'
              ? 'All property units'
              : invoice.units.map(u => u.name).join(', ') || '—'}
          </p>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            {['Type', 'Frequency', 'Amount', 'Payment Type'].map(label => (
              <TableHead key={label}>
                {label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          <TableRow>
            <TableCell>
              {invoiceLabel(invoice.type)}
            </TableCell>

            <TableCell>
              {invoiceLabel(invoice.frequency)}
            </TableCell>

            <TableCell>
              {invoiceMoney(invoice.amount)}
            </TableCell>

            <TableCell>
              {invoiceLabel(invoice.payment)}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>

      {invoice.description && (
        <div>
          <p className="text-xs text-muted-foreground mb-2">
            Description
          </p>

          <p className="text-sm whitespace-pre-wrap break-words">
            {invoice.description}
          </p>
        </div>
      )}

      <div className="flex justify-between text-sm px-4">
        <span className="text-muted-foreground">
          Invoice Amount
        </span>

        <strong>
          {invoiceMoney(invoice.amount)}
        </strong>
      </div>

      <div className="rounded-lg border border-border p-4">
        <p className="text-sm font-medium mb-3">
          Receiving Account
        </p>

        <div className="flex gap-3 items-center">
          <Landmark className="w-5 h-5 text-brand-text shrink-0" />

          <div className="min-w-0">
            <p className="text-sm break-words">
              {invoice.receivingAccount?.accountName || '—'}
            </p>

            <p className="text-xs text-muted-foreground break-words">
              {invoice.receivingAccount?.accountNumber} ·{' '}
              {invoice.receivingAccount?.bankName}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


export default function InvoiceDetails({
  id,
  onClose,
}: {
  id: string;
  onClose: () => void;
}) {
  const { invoice, isLoading, isError, error, refetch } = useGetInvoice(id);

  const issue = useIssueInvoice(id);

  const [confirming, setConfirming] = useState(false);

  return (
    <Modal
      isOpen
      onClose={() => {
        if (!issue.isLoading) onClose();
      }}
      title="Invoice Details"
      variant="drawer"
      bodyClassName="p-0 flex flex-col"
    >
      <div className="p-6 flex-1 overflow-y-auto min-h-0">
        {isLoading && (
          <p className="text-sm text-muted-foreground">
            Loading invoice…
          </p>
        )}

        {isError && (
          <div className="space-y-3">
            <p className="text-danger text-sm">
              {error?.message}
            </p>

            <Button
              variant="outline"
              onClick={() => refetch()}
            >
              Retry
            </Button>
          </div>
        )}

        {invoice && (
          <>
            <InvoiceSummary invoice={invoice} />

            <section className="mt-7">
              <h3 className="text-sm font-medium mb-3">
                Payment History
              </h3>

              {invoice.payments?.length ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      {['Reference', 'Date', 'Amount', 'Status'].map(s => (
                        <TableHead key={s}>
                          {s}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {invoice.payments.map(p => (
                      <TableRow key={p.id}>
                        <TableCell>
                          <span className="break-all">
                            {p.reference || p.id}
                          </span>
                        </TableCell>

                        <TableCell>
                          {p.paidAt || p.createdAt
                            ? invoiceDate(p.paidAt || p.createdAt || '')
                            : '—'}
                        </TableCell>

                        <TableCell>
                          {invoiceMoney(p.amount)}
                        </TableCell>

                        <TableCell>
                          {p.status
                            ? invoiceLabel(p.status)
                            : '—'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No payments recorded.
                </p>
              )}
            </section>
          </>
        )}
      </div>

      {invoice?.status === 'PENDING' && (
        <div className="p-4 border-t border-border bg-card shrink-0 flex justify-end gap-2">
          {confirming ? (
            <>
              <Button
                variant="outline"
                disabled={issue.isLoading}
                onClick={() => setConfirming(false)}
              >
                Cancel
              </Button>

              <Button
                className="bg-brand-text text-primary-foreground hover:bg-brand-text/90"
                isLoading={issue.isLoading}
                onClick={async () => {
                  try {
                    await issue.callApi();
                    setConfirming(false);
                  } catch {
                    /* API toast */
                  }
                }}
              >
                Confirm Issue
              </Button>
            </>
          ) : (
            <Button
              className="bg-brand-text text-primary-foreground hover:bg-brand-text/90"
              leftIcon={<Send className="w-4 h-4" />}
              onClick={() => setConfirming(true)}
            >
              Issue Invoice
            </Button>
          )}
        </div>
      )}
    </Modal>
  );
}
