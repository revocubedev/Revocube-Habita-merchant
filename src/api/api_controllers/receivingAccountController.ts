import useGetApiManager from "../useGetApiManager";
import useApiManager from "../useApiManager";

export interface ReceivingAccount {
  id: string;
  gateway: string;
  accountNumber: string;
  accountName: string;
  bankName: string;
  bankCode: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface ReceivingAccountFormValues {
  accountNumber: string;
  accountName: string;
  bankName: string;
}

const QUERY_KEY = "get_receiving_accounts";

// GET /:code/receive-payments/
export const useGetReceivingAccounts = (enabled = true) => {
  const query = useGetApiManager({
    queryKey: [QUERY_KEY],
    endpoint: "receive-payments/",
    isAuth: true,
    isCode: true,
    enabled,
  });

  const accounts: ReceivingAccount[] = Array.isArray(query.data?.data)
    ? query.data.data
    : [];

  return { ...query, accounts };
};

// POST /:code/receive-payments/
export const useCreateReceivingAccount = () => {
  const { callApi, isLoading } = useApiManager({
    endpoint: "receive-payments/",
    method: "POST",
    isAuth: true,
    isCode: true,
    queryKey: [QUERY_KEY],
  });

  const createAccount = (values: ReceivingAccountFormValues) => callApi(values);

  return { createAccount, isLoading };
};
