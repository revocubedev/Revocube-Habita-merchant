import useGetApiManager from "../useGetApiManager";

export const useGetPermissions = (enabled = true) =>
  useGetApiManager({
    queryKey: ["get_permissions"],
    isAuth: true,
    isCode: true,
    endpoint: "role/get-permissions",
    enabled,
  });

// Response is { message, data: string[] }
export const extractPermissions = (payload: any): string[] => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};
