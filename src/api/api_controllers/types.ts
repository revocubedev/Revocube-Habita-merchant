import useApiManager from "../useApiManager";
import useGetApiManager from "../useGetApiManager";

export const TYPE_CATEGORIES = [
  "EXPENSES_ISSUE_TYPE",
  "PROPERTY_TYPE",
  "MAINTAINER_TYPE",
  "INVOICE_TYPE",
] as const;

export type TypeCategory = (typeof TYPE_CATEGORIES)[number];

export interface TypeOption {
  id: string;
  value: string; 
  label: string; 
  isActive: boolean;
}

export const useGetTypesByCategory = (
  category: TypeCategory,
  { enabled = true }: { enabled?: boolean } = {}
) =>
  useGetApiManager({
    queryKey: ["get_types_by_category", category],
    isAuth: true,
    isCode: true,
    endpoint: "types",
    enabled,
    params: { category },
  });

const prettyLabel = (value: string) =>
  value
    .toLowerCase()
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");


export const extractTypes = (
  payload: any,
  includeInactive = false
): TypeOption[] => {
  const list: any[] = Array.isArray(payload?.data) ? payload.data : [];

  return list
    .filter((t) => t.value && (includeInactive || t.isActive !== false))
    .map((t) => ({
      id: String(t.id),
      value: String(t.value),
      label: prettyLabel(String(t.value)),
      isActive: t.isActive !== false,
    }));
};

// Convenience wrappers
export const useGetExpenseTypes = (enabled = true) =>
  useGetTypesByCategory("EXPENSES_ISSUE_TYPE", { enabled });
export const useGetPropertyTypes = (enabled = true) =>
  useGetTypesByCategory("PROPERTY_TYPE", { enabled });
export const useGetMaintainerTypes = (enabled = true) =>
  useGetTypesByCategory("MAINTAINER_TYPE", { enabled });
export const useGetInvoiceTypes = (enabled = true) =>
  useGetTypesByCategory("INVOICE_TYPE", { enabled });


export const useCreateType = () => {
  const { callApi, isLoading, error, isSuccess } = useApiManager({
    endpoint: "types", // confirm in Postman
    queryKey: ["get_types_by_category"],
    method: "POST",
    isAuth: true,
    isCode: true,
    successMessage: "Type created successfully",
  });

  const createType = (details: { category: TypeCategory; value: string }) =>
    callApi(details);
  return { createType, isLoading, error, isSuccess };
};

export const useUpdateType = (id?: string) => {
  const { callApi, isLoading, error, isSuccess } = useApiManager({
    endpoint: `types/${id}`, // confirm in Postman
    queryKey: ["get_types_by_category"],
    method: "PATCH", // confirm in Postman: PATCH or PUT
    isAuth: true,
    isCode: true,
    successMessage: "Type updated successfully",
  });

  const updateType = (details: { value: string }) => callApi(details);
  return { updateType, isLoading, error, isSuccess };
};