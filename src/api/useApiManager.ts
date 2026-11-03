import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import AxiosWithToken from "../api/axios_with_token";
import Axios from "../api/axios_without_token";
import { showErrorToast, showSuccessToast } from "@/lib/toast";

interface Props {
  endpoint: string;
  queryKey?: string[];
  method?: "POST" | "PUT" | "PATCH" | "DELETE";
  isAuth?: boolean;
  isCode?: boolean;
  showSuccessToastt?: boolean;
  contentType?: string;
}

export class ApiError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

const buildUrl = (endpoint: string, isCode: boolean) => {
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  if (!isCode) return path;
  const code = localStorage.getItem("code"); // read at call time, not render time
  return `/${code}${path}`;
};

const useApiManager = ({
  endpoint,
  queryKey = [],
  method = "POST",
  isAuth = false,
  isCode = false, // Habita has no tenant code
  showSuccessToastt = true,
  contentType = "application/json",
}: Props) => {
  const queryClient = useQueryClient();
  const axiosInstance = isAuth ? AxiosWithToken : Axios;
  const [statusCode, setStatusCode] = useState<number | null>(null);

  const apiController = async (details: any) => {
    const url = buildUrl(endpoint, isCode);
    const config = {
      headers: contentType ? { "Content-Type": contentType } : undefined,
      withCredentials: true,
    };

    try {
      let response;
      switch (method.toUpperCase()) {
        case "POST":
          response = await axiosInstance.post(url, details, config);
          break;
        case "PUT":
          response = await axiosInstance.put(url, details, config);
          break;
        case "PATCH":
          response = await axiosInstance.patch(url, details, config);
          break;
        case "DELETE":
          response = await axiosInstance.delete(url, {
            ...config,
            data: details,
          });
          break;
        default:
          throw new Error(`Unsupported HTTP method: ${method}`);
      }

      setStatusCode(response.status);
      return { ...response.data, statusCode: response.status };
    } catch (error: any) {
      const status = error.response?.status || 500;
      setStatusCode(status);

      const backendError = error.response?.data;
      const message =
        backendError?.message ||
        backendError?.error ||
        backendError?.msg ||
        backendError?.data?.message ||
        error.message ||
        "An unexpected error occurred";

      throw new ApiError(message, status);
    }
  };

  const mutation = useMutation({
    mutationFn: apiController,
    onSuccess: (response) => {
      if (showSuccessToastt && response?.message)
        showSuccessToast(response.message);
      queryKey.forEach((key) => {
        if (key) queryClient.invalidateQueries({ queryKey: [key] });
      });
    },
    onError: (error: Error) => {
      showErrorToast(error.message);
      console.error(`${method} error:`, error);
    },
  });

  const callApi = (details?: any) => mutation.mutateAsync(details);

  return {
    callApi,
    data: mutation.data?.data,
    response: mutation.data,
    statusCode,
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    error: mutation.error,
    isError: mutation.isError,
    mutation,
  };
};

export default useApiManager;
