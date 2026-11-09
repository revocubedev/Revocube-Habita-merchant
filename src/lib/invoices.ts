
import { z } from 'zod';


export const INVOICE_TYPES = ['DAMAGES', 'SECURITY', 'OTHER'] as const;

export type InvoiceType = (typeof INVOICE_TYPES)[number];

export const FREQUENCIES = ['MONTHLY', 'YEARLY'] as const;


export const invoiceSchema = z.object({
  type: z.string().min(1),

  payment: z.enum(['ONE_TIME_PAYMENT', 'RECURRING_PAYMENT']),

  frequency: z.enum(FREQUENCIES),

  amount: z.number().finite().positive('Enter an amount greater than zero.'),

  invoiceMonth: z.string().regex(
    /^\d{4}-\d{2}-01$/,
    'Select an invoice month.'
  ),

  dueDate: z.string().regex(
    /^\d{4}-\d{2}-\d{2}$/,
    'Select a due date.'
  ),

  description: z.string(),

  propertyScope: z.enum(['ENTIRE_ESTATE', 'SELECTED_PROPERTIES']),

  propertyIds: z.array(z.string()).optional(),

  unitScope: z.enum(['ALL_UNITS', 'SELECTED_UNITS']),

  unitIds: z.array(z.string()).optional(),

  receivingAccountId: z.string().min(1, 'Select a receiving account.'),

}).superRefine((v, ctx) => {
  if (v.propertyScope === 'SELECTED_PROPERTIES' && !v.propertyIds?.length) {
    ctx.addIssue({
      code: 'custom',
      path: ['propertyIds'],
      message: 'Select at least one property.',
    });
  }

  if (v.unitScope === 'SELECTED_UNITS' && !v.unitIds?.length) {
    ctx.addIssue({
      code: 'custom',
      path: ['unitIds'],
      message: 'Select at least one unit.',
    });
  }
});


export type InvoiceValues = z.infer<typeof invoiceSchema>;


export type InvoiceRecipient = {
  id: string;
  name: string;
  propertyId?: string;
};


export interface Invoice {
  id: string;
  invoiceNumber: string;
  type: string;
  payment: InvoiceValues['payment'];

  frequency: InvoiceValues['frequency'];
  amount: string | number;
  invoiceMonth: string;

  dueDate: string;
  description: string;
  status: string;

  propertyScope: InvoiceValues['propertyScope'];
  unitScope: InvoiceValues['unitScope'];

  receivingAccountId?: string;

  receivingAccount?: {
    id: string;
    accountName: string;
    accountNumber: string;
    bankName: string;
    gateway: string;
  };

  properties: InvoiceRecipient[];
  units: InvoiceRecipient[];

  payments?: {
    id: string;
    reference?: string;
    amount: string | number;
    status?: string;
    createdAt?: string;
    paidAt?: string;
  }[];
}


export function normalizeInvoice(value: Invoice): Invoice {
  const unwrap = (
    items: unknown,
    key: 'property' | 'unit'
  ): InvoiceRecipient[] =>
    Array.isArray(items)
      ? items.map(item => item[key] ?? item)
      : [];

  return {
    ...value,
    properties: unwrap(value.properties, 'property'),
    units: unwrap(value.units, 'unit'),
  };
}


export function invoicePayload(values: InvoiceValues): InvoiceValues {
  const parsed = invoiceSchema.parse(values);

  const { propertyIds, unitIds, ...rest } = parsed;

  return {
    ...rest,

    ...(parsed.propertyScope === 'SELECTED_PROPERTIES'
      ? { propertyIds }
      : {}),

    ...(parsed.unitScope === 'SELECTED_UNITS'
      ? { unitIds }
      : {}),
  };
}


export const invoiceLabel = (value: string) =>
  value
    .toLowerCase()
    .split('_')
    .map(s => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' ');


export const invoiceMoney = (value: number | string) =>
  new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
  }).format(Number(value));


export const invoiceDate = (value: string, month = false) => {
  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? '—'
    : date.toLocaleDateString(
        'en-GB',
        month
          ? {
              month: 'long',
              year: 'numeric',
              timeZone: 'UTC',
            }
          : {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              timeZone: 'UTC',
            }
      );
};
