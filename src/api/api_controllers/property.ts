import useApiManager from "../useApiManager";
import useGetApiManager from "../useGetApiManager";

export interface PropertyInput {
  name?: string;
  propertyType?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  description?: string;
  thumbnailImage?: File;
  propertyImage?: File;
}
export type Property = Record<string, unknown> & {
  id: string;
  name?: string;
  description?: string;
  propertyType?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  thumbnailImage?: string | null;
  propertyImage?: string | null;
  unitCount?: number;
  roomCount?: number;
  images?: string[];
};

export interface PropertyResponse<T = Property> {
  success?: boolean;
  message?: string;
  data: T;
  meta?: {
    currentPage: number;
    itemsPerPage: number;
    totalItems: number;
    totalPages: number;
  };
}

const QUERY_KEY = "get_properties";

function estateCode(): string {
  return localStorage.getItem("code")?.trim() ?? "";
}

function requireEstate(): void {
  if (!estateCode()) throw new Error("Estate code is missing. Sign in to your estate first.");
}

function requireId(id?: string): string {
  if (!id?.trim()) throw new Error("Property ID is required");
  return id.trim();
}

function validatePayload(values: PropertyInput): void {
  if (!values || Array.isArray(values) || typeof values !== "object" || Object.keys(values).length === 0) {
    throw new Error("Property details are required");
  }
}

export function toPropertyFormData(values: PropertyInput): FormData {
  const form = new FormData();
  for (const key of ['name', 'propertyType', 'address', 'city', 'state', 'country', 'zipCode', 'description', 'thumbnailImage', 'propertyImage'] as const) {
    const value = values[key];
    if (value === undefined || value === null) continue;
    form.append(key, value instanceof Blob ? value : key === 'propertyType' ? value.trim().toUpperCase() : value);
  }
  return form;
}

function ensureSuccess<T extends { success?: boolean; message?: string }>(response: T): T {
  if (response.success === false) throw new Error(response.message || "The property request failed");
  return response;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

function isProperty(value: unknown): value is Property {
  return isRecord(value) && typeof value.id === "string" && Boolean(value.id.trim());
}

/** Normalize list envelopes once, before the property page receives them. */
export function parsePropertiesResponse(payload: unknown): PropertyResponse<Property[]> {
  const envelope = isRecord(payload) ? payload : {};
  ensureSuccess(envelope);
  const nested = isRecord(envelope.data) ? envelope.data : {};
  const records = [payload, envelope.data, nested.properties, nested.items, nested.data].find(Array.isArray);
  if (!Array.isArray(records) || !records.every(isProperty)) {
    throw new Error("The properties API returned an unexpected list. Each property must have an ID.");
  }
  const rawMeta = envelope.meta ?? nested.meta;
  const meta = isRecord(rawMeta) && ["currentPage", "itemsPerPage", "totalItems", "totalPages"].every((key) => typeof rawMeta[key] === "number")
    ? rawMeta as unknown as NonNullable<PropertyResponse["meta"]> : undefined;
  return { success: true, data: records, meta, message: typeof envelope.message === "string" ? envelope.message : undefined };
}

export function parsePropertyResponse(payload: unknown): PropertyResponse {
  const envelope = isRecord(payload) ? payload : {};
  ensureSuccess(envelope);
  const nested = isRecord(envelope.data) ? envelope.data : {};
  const record = [envelope.data, nested.property, nested.data, payload].find(isProperty);
  if (!record) throw new Error("The properties API returned an unexpected property detail response.");
  return { success: true, data: record, message: typeof envelope.message === "string" ? envelope.message : undefined };
}

/** POST /:code/properties/ — multipart fields and optional image files. */
export const useCreateProperty = () => {
  const api = useApiManager({
    endpoint: "properties/",
    method: "POST",
    queryKey: [QUERY_KEY],
    isAuth: true,
    isCode: true,
    validateResponse: ensureSuccess,
  });

  const createProperty = async (values: PropertyInput): Promise<PropertyResponse> => {
    requireEstate();
    validatePayload(values);
    if (!values.name?.trim()) throw new Error("Property name is required");
    if (!values.propertyType?.trim()) throw new Error("Property type is required");
    return api.callApi(toPropertyFormData(values));
  };

  return { ...api, createProperty };
};

/** PATCH /:code/properties/:id — only include fields being changed. */
export const useUpdateProperty = (id?: string) => {
  const api = useApiManager({
    endpoint: `properties/${encodeURIComponent(id?.trim() ?? "")}`,
    method: "PATCH",
    queryKey: [QUERY_KEY],
    isAuth: true,
    isCode: true,
    validateResponse: ensureSuccess,
  });

  const updateProperty = async (values: PropertyInput): Promise<PropertyResponse> => {
    requireEstate();
    requireId(id);
    validatePayload(values);
    return api.callApi(toPropertyFormData(values));
  };

  return { ...api, updateProperty };
};

export interface PropertyListOptions {
  page?: number;
  perPage?: number;
  search?: string;
  enabled?: boolean;
}

/** GET /:code/properties/ — cache separately for each estate and filter. */
export const useGetProperties = ({ page = 1, perPage = 20, search = "", enabled = true }: PropertyListOptions = {}) => {
  const code = estateCode();
  const term = search.trim();
  return useGetApiManager<PropertyResponse<Property[]>>({
    endpoint: "properties/",
    queryKey: [QUERY_KEY, code, "list", page, perPage, term],
    isAuth: true,
    isCode: true,
    enabled: enabled && Boolean(code),
    params: { page, perPage, ...(term ? { search: term } : {}) },
    select: parsePropertiesResponse,
  });
};

/** GET /:code/properties/:id — one property, enabled once an ID is available. */
export const useGetPropertyById = (id?: string, enabled = true) => {
  const code = estateCode();
  const propertyId = id?.trim() ?? "";
  return useGetApiManager<PropertyResponse>({
    endpoint: `properties/${encodeURIComponent(propertyId)}`,
    queryKey: [QUERY_KEY, code, "detail", propertyId],
    isAuth: true,
    isCode: true,
    enabled: enabled && Boolean(code) && Boolean(propertyId),
    select: parsePropertyResponse,
  });
};

/** DELETE /:code/properties/:id. */
export const useDeleteProperty = (id?: string) => {
  const api = useApiManager({
    endpoint: `properties/${encodeURIComponent(id?.trim() ?? "")}`,
    method: "DELETE",
    queryKey: [QUERY_KEY],
    isAuth: true,
    isCode: true,
    validateResponse: ensureSuccess,
  });

  const deleteProperty = async (): Promise<{ success?: boolean; message?: string }> => {
    requireEstate();
    requireId(id);
    return api.callApi();
  };

  return { ...api, deleteProperty };
};
