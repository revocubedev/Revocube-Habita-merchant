import useGetApiManager from "../useGetApiManager";
import useApiManager from "../useApiManager";

export interface CreateUserPayload {
  roleId: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
}
export interface InviteAdminPayload {
  email: string;
  roleId: string;
  firstName: string;
  lastName: string;
}

export type UpdateUserPayload = Omit<CreateUserPayload, "password">;

export const useGetUsers = ({
  page,
  perPage = 10,
  search,
  enabled = true,
}: {
  page: number;
  perPage?: number;
  search?: string;
  enabled?: boolean;
}) =>
  useGetApiManager({
    queryKey: ["get_users", page, perPage, search ?? ""],
    isAuth: true,
    isCode: true,
    endpoint: "estate",
    enabled,
    params: { page, perPage, ...(search ? { search } : {}) },
  });

export const useGetUser = (id?: string, enabled = true) =>
  useGetApiManager({
    queryKey: ["get_user", id ?? ""],
    isAuth: true,
    isCode: true,
    endpoint: `estate/${id}`,
    enabled: enabled && !!id,
  });

export const useCreateUser = () => {
  const { callApi, isLoading, error, isSuccess } = useApiManager({
    endpoint: "estate/create",
    queryKey: ["get_users", "get_admin_roles"],
    method: "POST",
    isAuth: true,
    isCode: true,
  });

  const createUser = (details: CreateUserPayload) => callApi(details);
  return { createUser, isLoading, error, isSuccess };
};

export const useInviteAdmin = () => {
  const { callApi, isLoading, error, isSuccess } = useApiManager({
    endpoint: "estate/send-invite",
    queryKey: ["get_users", "get_admin_roles"],
    method: "POST",
    isAuth: true,
    isCode: true,
  });

  const inviteAdmin = (details: InviteAdminPayload) => callApi(details);
  return { inviteAdmin, isLoading, error, isSuccess };
};

export const useUpdateUser = (id?: string) => {
  const { callApi, isLoading, error, isSuccess } = useApiManager({
    endpoint: `estate/${id}/update`,
    queryKey: ["get_users", "get_user", "get_admin_roles"],
    method: "PATCH",
    isAuth: true,
    isCode: true,
  });

  const updateUser = (details: UpdateUserPayload) => callApi(details);
  return { updateUser, isLoading, error, isSuccess };
};

// No estate code in this route: /superadmin/auth/:id/suspend
export const useSuspendUser = (id?: string) => {
  const { callApi, isLoading, error, isSuccess } = useApiManager({
    endpoint: `estate/${id}/suspend`,
    queryKey: ["get_users", "get_user"],
    method: "PATCH", 
    isAuth: true,
    isCode: true,
    // successMessage: "User suspended successfully",
  });

  const suspendUser = () => callApi({});
  return { suspendUser, isLoading, error, isSuccess };
};

// Handles [..], { data: [..] }, { data: { users: [..] } }, { data: { data: [..] } }
export const extractUsers = (payload: any): any[] => {
  if (Array.isArray(payload)) return payload;
  const d = payload?.data;
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.users)) return d.users;
  if (Array.isArray(d?.data)) return d.data;
  if (Array.isArray(d?.items)) return d.items;
  return [];
};

// Single record: { data: {...} }, { data: { user: {...} } }, { data: { admin: {...} } }
export const extractUser = (payload: any): any | null => {
  const d = payload?.data ?? payload;
  return d?.user ?? d?.admin ?? d?.estateManager ?? d ?? null;
};

export const extractTotal = (payload: any): number | null => {
  const sources = [
    payload?.meta,
    payload?.pagination,
    payload?.data?.meta,
    payload?.data?.pagination,
    payload?.data,
    payload,
  ];
  for (const s of sources) {
    const total = s?.total ?? s?.totalCount ?? s?.totalItems;
    if (typeof total === "number") return total;
  }
  return null;
};


export const useGetProfile = (id?: string, enabled = true) =>
  useGetApiManager({
    queryKey: ["get_profile", id ?? ""],
    isAuth: true,
    isCode: true,
    endpoint: `estate/${id}/profile`,
    enabled: enabled && !!id,
  });

export const useUpdateProfile = (id?: string) => {
  const { callApi, isLoading, error, isSuccess } = useApiManager({
    endpoint: `estate/${id}/profile`,
    queryKey: ["get_profile", "get_users", "get_user"],
    method: "PATCH", 
    isAuth: true,
    isCode: true,
    contentType: "multipart/form-data", 
    // successMessage: "Profile updated successfully",
  });

  const updateProfile = (details: FormData) => callApi(details);
  return { updateProfile, isLoading, error, isSuccess };
};

// Response is { success, message, data: { firstName, lastName, ... } }
export const extractProfile = (payload: any): any | null =>
  payload?.data ?? null;

export interface UpdatePasswordPayload {
  oldPassword: string;
  password: string;
}

export const useUpdatePassword = (id?: string) => {
  const { callApi, isLoading, error, isSuccess } = useApiManager({
    endpoint: `estate/${id}/update-password`,
    method: "PATCH", // confirm in Postman: PATCH, PUT or POST
    isAuth: true,
    isCode: true,
    // successMessage: "Password updated successfully",
  });

  const updatePassword = (details: UpdatePasswordPayload) => callApi(details);
  return { updatePassword, isLoading, error, isSuccess };
};