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
