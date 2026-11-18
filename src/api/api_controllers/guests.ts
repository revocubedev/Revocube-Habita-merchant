import useGetApiManager from "../useGetApiManager";
import useApiManager from "../useApiManager";

export const useGetGuests = ({
  page,
  perPage = 10,
  enabled = true,
}: {
  page: number;
  perPage?: number;
  enabled?: boolean;
}) => {
  const { data, isLoading, isError, error } = useGetApiManager({
    queryKey: ["get_guests", page, perPage],
    isAuth: true,
    isCode: true,
    endpoint: "guests/get", 
    enabled,
    params: { page, perPage },
  });

  
  return { guests: data, isLoading, isError, error };
};

export const useGetGuest = (id?: string, enabled = true) =>
  useGetApiManager({
    queryKey: ["get_guest", id ?? ""],
    isAuth: true,
    isCode: true,
    endpoint: `guests/${id}/get`,
    enabled: enabled && !!id,
  });


export const useUpdateGuestStatus = (guestCode?: string) => {
  const { callApi, isLoading, error, isSuccess } = useApiManager({
    endpoint: `guests/${guestCode}/status`,
    queryKey: ["get_guests", "get_guest"],
    method: "PATCH",
    isAuth: true,
    isCode: true,
    successMessage: "Guest status updated successfully",
  });

  const updateGuestStatus = (status: string) => callApi({ status });
  return { updateGuestStatus, isLoading, error, isSuccess };
};

// Response is { success, message, data: {...} }
export const extractGuest = (payload: any): any | null => payload?.data ?? null;
