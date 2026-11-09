
import useApiManager from '../useApiManager';
import useGetApiManager from '../useGetApiManager';
import { Invoice, InvoiceValues, invoicePayload, normalizeInvoice } from '@/lib/invoices';


export const INVOICE_QUERY_KEY = 'get_invoices';


export function useGetInvoices(
  page = 1,
  perPage = 10,
  invoiceType = '',
  propertyId = ''
) {
  const query = useGetApiManager({
    queryKey: [INVOICE_QUERY_KEY, page, perPage, invoiceType, propertyId],
    endpoint: 'invoices/',
    isAuth: true,
    isCode: true,

    params: {
      page,
      perPage,
      ...(invoiceType ? { invoiceType } : {}),
      ...(propertyId ? { propertyId } : {}),
    },
  });

  return {
    ...query,

    invoices: (
      Array.isArray(query.data?.data) ? query.data.data : []
    ).map(normalizeInvoice) as Invoice[],

    meta: query.data?.meta as
      | {
          currentPage: number;
          itemsPerPage: number;
          totalItems: number;
          totalPages: number;
        }
      | undefined,
  };
}


export function useGetInvoice(id?: string) {
  const query = useGetApiManager({
    queryKey: [INVOICE_QUERY_KEY, 'detail', id ?? ''],
    endpoint: `invoices/${encodeURIComponent(id ?? '')}`,
    isAuth: true,
    isCode: true,
    enabled: !!id,
  });

  return {
    ...query,
    invoice: query.data?.data
      ? normalizeInvoice(query.data.data)
      : undefined,
  };
}


export function useSaveInvoice(id?: string) {
  const mutation = useApiManager({
    endpoint: id ? `invoices/${encodeURIComponent(id)}` : 'invoices/',
    method: id ? 'PATCH' : 'POST',
    isAuth: true,
    isCode: true,
    queryKey: [INVOICE_QUERY_KEY],
  });

  return {
    ...mutation,

    save: async (values: InvoiceValues) => {
      const response = await mutation.callApi(invoicePayload(values));

      return normalizeInvoice(response.data);
    },
  };
}


export function useIssueInvoice(id: string) {
  return useApiManager({
    endpoint: `invoices/${encodeURIComponent(id)}/issue`,
    method: 'POST',
    isAuth: true,
    isCode: true,
    queryKey: [INVOICE_QUERY_KEY],
  });
}


export function useInvoiceUnitOptions(enabled = true) {
  const query = useGetApiManager({
    queryKey: ['get_units', 'invoice_options'],
    endpoint: 'units',
    isAuth: true,
    isCode: true,

    params: {
      page: 1,
      perPage: 100,
    },

    enabled,
  });

  const data = query.data?.data;

  return {
    ...query,

    units: (
      Array.isArray(data) ? data : data?.items ?? []
    ) as {
      id: string;
      name: string;
      propertyId: string;
    }[],
  };
}
