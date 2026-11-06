import useGetApiManager from "../useGetApiManager";
import useApiManager from "../useApiManager";

export interface Unit {
  id: string;
  propertyId: string;
  name: string;
  bedrooms: number;
  kitchens: number;
  bathrooms: number;
  rentType: string;
  rentAmount: string;
  rentDuration: number;
  depositType: string;
  depositAmount: string;
  lateFeeType: string;
  lateFeeAmount: string;
  incidentReceiptAmount: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  property?: { id: string; name: string; address?: string; city?: string; state?: string };
}

export interface UnitFormValues {
  propertyId: string;
  name: string;
  bedrooms: number;
  kitchens: number;
  bathrooms: number;
  rentType: string;
  rentAmount: number;
  rentDuration: number;
  depositType: string;
  depositAmount: number;
  lateFeeType: string;
  lateFeeAmount: number;
  incidentReceiptAmount: number;
  notes: string;
}

export interface UnitsListResponse {
  items: Unit[];
  meta: { currentPage: number; itemsPerPage: number; totalItems: number; totalPages: number };
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

const QUERY_KEY = "get_units";

// GET /:code/units
export const useGetUnits = ({ page = 1, perPage = 10, search = "" }: { page?: number; perPage?: number; search?: string }) => {
  const q = useGetApiManager({
    queryKey: [QUERY_KEY, page, perPage, search],
    endpoint: "units",
    isAuth: true,
    isCode: true,
    params: { page, perPage, ...(search ? { search } : {}) },
  });
  return { ...q, list: (q.data?.data ?? null) as UnitsListResponse | null };
};

// GET /:code/units/:id
export const useGetUnitById = (id?: string) =>
  useGetApiManager({ queryKey: [QUERY_KEY, "detail", id ?? ""], endpoint: `units/${id}`, isAuth: true, isCode: true, enabled: !!id });

// POST /:code/units/
export const useCreateUnit = () => {
  const { callApi, isLoading } = useApiManager({ endpoint: "units/", method: "POST", isAuth: true, isCode: true, queryKey: [QUERY_KEY] });
  return { createUnit: (v: UnitFormValues) => callApi(v), isLoading };
};

// PATCH /:code/units/:id
export const useUpdateUnit = (id: string) => {
  const { callApi, isLoading } = useApiManager({ endpoint: `units/${id}`, method: "PATCH", isAuth: true, isCode: true, queryKey: [QUERY_KEY] });
  return { updateUnit: (v: Partial<UnitFormValues>) => callApi(v), isLoading };
};

// DELETE /:code/units/:id
export const useDeleteUnit = (id: string) => {
  const { callApi, isLoading } = useApiManager({ endpoint: `units/${id}`, method: "DELETE", isAuth: true, isCode: true, queryKey: [QUERY_KEY] });
  return { deleteUnit: () => callApi(), isLoading };
};

// Properties list for the unit form dropdown (GET /:code/properties). Falls back gracefully if unavailable.
export const useGetPropertyOptions = () => {
  const q = useGetApiManager({ queryKey: ["get_properties", "options"], endpoint: "properties", isAuth: true, isCode: true, params: { page: 1, perPage: 100 } });
  const d = q.data?.data;
  const items: { id: string; name: string }[] = Array.isArray(d) ? d : Array.isArray(d?.items) ? d.items : [];
  return { ...q, properties: items };
};
