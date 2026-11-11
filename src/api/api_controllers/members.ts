import useGetApiManager from "../useGetApiManager";

export interface Member {
  id: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
  phoneNumber?: string;
  phone?: string;
  address?: string;
  propertyId?: string;
  unitId?: string;
  property?: { id?: string; name?: string } | string | null;
  unit?: { id?: string; name?: string } | string | null;
  profileImage?: string | null;
}

export interface MembersResponse {
  success: boolean;
  message?: string;
  data: Member[];
  meta?: { currentPage: number; itemsPerPage: number; totalItems: number; totalPages: number };
}

const QUERY_KEY = "get_members";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isMember = (value: unknown): value is Member =>
  isRecord(value) && typeof value.id === "string" && value.id.trim().length > 0;

/** Normalizes the list envelopes used by the estate API into one stable shape. */
export function parseMembersResponse(payload: unknown): MembersResponse {
  const envelope = isRecord(payload) ? payload : {};
  if (envelope.success === false) {
    throw new Error(typeof envelope.message === "string" ? envelope.message : "Could not load members");
  }
  const nested = isRecord(envelope.data) ? envelope.data : {};
  const records = [envelope.data, nested.members, nested.items, nested.data].find(Array.isArray);
  if (!Array.isArray(records) || !records.every(isMember)) {
    throw new Error("The members API returned an unexpected list.");
  }
  const rawMeta = envelope.meta ?? nested.meta;
  const meta = isRecord(rawMeta) && ["currentPage", "itemsPerPage", "totalItems", "totalPages"].every((key) => typeof rawMeta[key] === "number")
    ? rawMeta as MembersResponse["meta"]
    : undefined;
  return {
    success: true,
    message: typeof envelope.message === "string" ? envelope.message : undefined,
    data: records,
    meta,
  };
}

const estateCode = () => localStorage.getItem("code")?.trim() ?? "";

/** GET /:code/members/ */
export const useGetMembers = ({ page = 1, perPage = 10, search = "", enabled = true }: {
  page?: number;
  perPage?: number;
  search?: string;
  enabled?: boolean;
} = {}) => {
  const code = estateCode();
  const term = search.trim();
  return useGetApiManager<MembersResponse>({
    endpoint: "members/",
    queryKey: [QUERY_KEY, code, page, perPage, term],
    isAuth: true,
    isCode: true,
    enabled: enabled && Boolean(code),
    params: { page, perPage, ...(term ? { search: term } : {}) },
    select: parseMembersResponse,
  });
};

