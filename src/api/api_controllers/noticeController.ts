import useGetApiManager from "../useGetApiManager";
import useApiManager from "../useApiManager";

export const useCreateNotice = () => {
  const { callApi, isLoading, data, response, error, isSuccess } =
    useApiManager({
      endpoint: "notices",
      queryKey: ["get_notice"],
      method: "POST",
      isAuth: true,
      isCode: true,
    });

  const createNotice = (details: any) => callApi(details);

  return { createNotice, isLoading, data, response, error, isSuccess };
};
export const useUpdateNotice = (id?: string) => {
  const { callApi, isLoading, data, response, error, isSuccess } =
    useApiManager({
      endpoint: `notices/${id}`,
      queryKey: ["get_notice"],
      method: "PATCH",
      isAuth: true,
      isCode: true,
      // successMessage: "Notice updated successfully",
    });

  const updateNotice = (details: any) => callApi(details);

  return { updateNotice, isLoading, data, response, error, isSuccess };
};

export const useGetNoticeCall = ({
  enabled = true,
  page,
  perPage = 20,
  search,
}: {
  page: number;
  perPage?: number;
  search?: string | number;
  enabled?: boolean;
}) => {
  return useGetApiManager({
    queryKey: ["get_notice", page, perPage, search ?? ""],
    isAuth: true,
    isCode: true,
    endpoint: "notices",
    enabled,
    params: {
      page,
      perPage,
      ...(search !== undefined && search !== "" && { search }),
    },
  });
};


export const useDeleteNotice = (id?: string) => {
  const { callApi, isLoading, data, response, error, isSuccess } =
    useApiManager({
      endpoint: `notices/${id}`,
      queryKey: ["get_notice"],
      method: "DELETE",
      isAuth: true,
      isCode: true,
      successMessage: "Notice deleted successfully",
    });

  const deleteNotice = () => callApi(undefined);

  return { deleteNotice, isLoading, data, response, error, isSuccess };
};