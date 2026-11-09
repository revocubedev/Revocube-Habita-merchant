import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import AxiosWithToken from "./axios_with_token";
import Axios from "../api/axios_without_token";

interface Props<TData = any> {
  queryKey: (string | number)[];
  endpoint: string;
  isAuth?: boolean;
  isCode?: boolean;
  params?: any;
  enabled?: boolean;
  select?: (response: any) => TData;
}

export default function useGetApiManager<TData = any>({
  queryKey,
  endpoint,
  isAuth = true,
  isCode = false,
  params,
  enabled = true,
  select,
}: Props<TData>) {
  const axiosInstance = isAuth ? AxiosWithToken : Axios;
  const { estateCode } = useParams();

  return useQuery({
    queryKey: isCode ? [estateCode, ...queryKey] : queryKey,
    queryFn: async () => {
      const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
      if (isCode && !estateCode) throw new Error("Estate code is missing from the URL");
      const url = isCode ? `/${encodeURIComponent(estateCode!)}${path}` : path;
      try {
        const response = await axiosInstance.get(url, { params });
        return response.data;
      } catch (error: any) {
        throw new Error(
          error.response?.data?.message || error.message || "Request failed"
        );
      }
    },
    select,
    enabled: enabled && (!isCode || !!estateCode),
    refetchOnWindowFocus: false,
  });
}
