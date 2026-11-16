import useGetApiManager from "../useGetApiManager";
import useApiManager from "../useApiManager";

export interface Member {
  id: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
  phoneNumber?: string;
  phone?: string;
  streetAddress?: string;
  propertyId?: string;
  unitId?: string;
  status?: string;
  isSuspended?: boolean;
  suspended?: boolean;
  isRemoved?: boolean;
  removed?: boolean;
  properties?: MemberRelation | MemberRelation[] | null;
  units?: MemberRelation | MemberRelation[] | null;
  profileImage?: string | null;
}

export type MemberRelation = { id?: string; name?: string } | string;

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

const requireMemberId = (id?: string) => {
  const memberId = id?.trim();
  if (!memberId) throw new Error("Member ID is required");
  return memberId;
};

const requireEstateCode = () => {
  if (!estateCode()) throw new Error("Estate code is missing");
};

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

/** GET /:code/members/:id */
export const useGetMemberById = (id?: string, enabled = true) => {
  const code = estateCode();
  const memberId = id?.trim() ?? "";
  return useGetApiManager<{ success?: boolean; message?: string; data: Member }>({
    endpoint: `members/${encodeURIComponent(memberId)}`,
    queryKey: [QUERY_KEY, "detail", code, memberId],
    isAuth: true,
    isCode: true,
    enabled: enabled && Boolean(code) && Boolean(memberId),
  });
};

/** PATCH /:code/members/:id/remove */
export const useRemoveEstateMember = (id?: string) => {
  const { callApi, isLoading, data, response, error, isSuccess } = useApiManager({
    endpoint: `members/${encodeURIComponent(id?.trim() ?? "")}/remove`,
    method: "PATCH",
    queryKey: [QUERY_KEY],
    isAuth: true,
    isCode: true,
  });
  const removeEstateMember = async () => {
    requireEstateCode();
    requireMemberId(id);
    const result = await callApi();
    if (result.success === false) throw new Error(result.message || "Could not remove member");
    return result;
  };
  return { removeEstateMember, isLoading, data, response, error, isSuccess };
};

/** PATCH /:code/members/:id/restore */
export const useRestoreEstateMember = (id?: string) => {
  const { callApi, isLoading, data, response, error, isSuccess } = useApiManager({
    endpoint: `members/${encodeURIComponent(id?.trim() ?? "")}/restore`,
    method: "PATCH",
    queryKey: [QUERY_KEY],
    isAuth: true,
    isCode: true,
  });
  const restoreEstateMember = async () => {
    requireEstateCode();
    requireMemberId(id);
    const result = await callApi();
    if (result.success === false) throw new Error(result.message || "Could not restore member");
    return result;
  };
  return { restoreEstateMember, isLoading, data, response, error, isSuccess };
};

/** PATCH /:code/members/:id/suspend */
export const useSuspendEstateMember = (id?: string) => {
  const { callApi, isLoading, data, response, error, isSuccess } = useApiManager({
    endpoint: `members/${encodeURIComponent(id?.trim() ?? "")}/suspend`,
    method: "PATCH",
    queryKey: [QUERY_KEY],
    isAuth: true,
    isCode: true,
  });
  const suspendEstateMember = async () => {
    requireEstateCode();
    requireMemberId(id);
    const result = await callApi();
    if (result.success === false) throw new Error(result.message || "Could not suspend member");
    return result;
  };
  return { suspendEstateMember, isLoading, data, response, error, isSuccess };
};

/** PATCH /:code/members/:id/unsuspend */
export const useUnsuspendEstateMember = (id?: string) => {
  const { callApi, isLoading, data, response, error, isSuccess } = useApiManager({
    endpoint: `members/${encodeURIComponent(id?.trim() ?? "")}/unsuspend`,
    method: "PATCH",
    queryKey: [QUERY_KEY],
    isAuth: true,
    isCode: true,
  });
  const unsuspendEstateMember = async () => {
    requireEstateCode();
    requireMemberId(id);
    const result = await callApi();
    if (result.success === false) throw new Error(result.message || "Could not unsuspend member");
    return result;
  };
  return { unsuspendEstateMember, isLoading, data, response, error, isSuccess };
};

