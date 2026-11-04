import useGetApiManager from "../useGetApiManager";
import useApiManager from "../useApiManager";

export type MaintainerType = "PLUMBER" | "ELECTRICIAN" | "CARPENTER" | "OTHER" | string;

export interface Maintainer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  maintainerType: MaintainerType;
  profileImage: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MaintainerFormValues {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password?: string;
  maintainerType: string;
  profileImage?: File | null;
}

/** Builds multipart form data, skipping empty values. */
export const toMaintainerFormData = (values: MaintainerFormValues) => {
  const fd = new FormData();
  Object.entries(values).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    fd.append(key, value as string | Blob);
  });
  return fd;
};

const QUERY_KEY = "get_maintainers";

// POST /:code/maintainers/
export const useCreateMaintainer = () => {
  const { callApi, isLoading, data, response, error, isSuccess } = useApiManager({
    endpoint: "maintainers/",
    queryKey: [QUERY_KEY],
    method: "POST",
    isAuth: true,
    isCode: true,
    contentType: "multipart/form-data",
  });
  const createMaintainer = (values: MaintainerFormValues) =>
    callApi(toMaintainerFormData(values));
  return { createMaintainer, isLoading, data, response, error, isSuccess };
};

// POST /:code/maintainers/login
export const useLoginMaintainer = () => {
  const { callApi, isLoading, data, response, error, isSuccess } = useApiManager({
    endpoint: "maintainers/login",
    method: "POST",
    isAuth: false,
    isCode: true,
  });
  const loginMaintainer = (details: { email: string; password: string }) => callApi(details);
  return { loginMaintainer, isLoading, data, response, error, isSuccess };
};

// GET /:code/maintainers/
export const useGetMaintainers = ({
  page = 1,
  perPage = 15,
  search,
  enabled = true,
}: {
  page?: number;
  perPage?: number;
  search?: string;
  enabled?: boolean;
} = {}) =>
  useGetApiManager({
    queryKey: [QUERY_KEY, page, perPage, search ?? ""],
    endpoint: "maintainers/",
    isAuth: true,
    isCode: true,
    enabled,
    params: { page, perPage, ...(search ? { search } : {}) },
  });

// GET /:code/maintainers/:id
export const useGetMaintainerById = (id?: string) =>
  useGetApiManager({
    queryKey: [QUERY_KEY, "detail", id ?? ""],
    endpoint: `maintainers/${id}`,
    isAuth: true,
    isCode: true,
    enabled: !!id,
  });

// PATCH /:code/maintainers/:id
export const useUpdateMaintainer = (id?: string) => {
  const { callApi, isLoading, data, response, error, isSuccess } = useApiManager({
    endpoint: `maintainers/${id}`,
    queryKey: [QUERY_KEY],
    method: "PATCH",
    isAuth: true,
    isCode: true,
    contentType: "multipart/form-data",
  });
  const updateMaintainer = (values: Partial<MaintainerFormValues>) =>
    callApi(toMaintainerFormData(values as MaintainerFormValues));
  return { updateMaintainer, isLoading, data, response, error, isSuccess };
};

// DELETE /:code/maintainers/:id
export const useDeleteMaintainer = (id?: string) => {
  const { callApi, isLoading, error, isSuccess } = useApiManager({
    endpoint: `maintainers/${id}`,
    queryKey: [QUERY_KEY],
    method: "DELETE",
    isAuth: true,
    isCode: true,
  });
  const deleteMaintainer = () => callApi();
  return { deleteMaintainer, isLoading, error, isSuccess };
};
