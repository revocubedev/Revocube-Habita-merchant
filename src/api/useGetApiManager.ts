import { useQuery } from "@tanstack/react-query";
import AxiosWithToken from "./axios_with_token";
import Axios from "../api/axios_without_token";

interface Props {
  queryKey: (string | number)[];
  endpoint: string;
  isAuth?: boolean;
  isCode?: boolean;
  params?: any;
  enabled?: boolean;
}

export default function useGetApiManager({
  queryKey,
  endpoint,
  isAuth = true,
  isCode = false,
  params,
  enabled = true,
}: Props) {
  const axiosInstance = isAuth ? AxiosWithToken : Axios;

  return useQuery({
    queryKey,
    queryFn: async () => {
      const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
      const url = isCode ? `/${localStorage.getItem("code")}${path}` : path;
      try {
        const response = await axiosInstance.get(url, { params });
        return response.data;
      } catch (error: any) {
        throw new Error(
          error.response?.data?.message || error.message || "Request failed"
        );
      }
    },
    enabled,
    refetchOnWindowFocus: false,
  });
}
