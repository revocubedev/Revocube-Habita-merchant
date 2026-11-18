import useGetApiManager from "../useGetApiManager";

export const useGetAdminRoles = ({
  enabled = true,
  page,
  perPage = 20,
}: {
  page: number;
  perPage?: number;
  enabled?: boolean;
}) => {
  return useGetApiManager({
    queryKey: ["get_admin_roles", page, perPage],
    isAuth: true,
    isCode: true,
    endpoint: "role", // match your Postman route
    enabled,
    params: { page, perPage },
  });
};

// Handles [..], { data: [..] }, { data: { roles: [..] } }, { data: { data: [..] } }
export const extractRoles = (payload: any): any[] => {
  if (Array.isArray(payload)) return payload;
  const d = payload?.data;
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.roles)) return d.roles;
  if (Array.isArray(d?.data)) return d.data;
  if (Array.isArray(d?.items)) return d.items;
  return [];
};
