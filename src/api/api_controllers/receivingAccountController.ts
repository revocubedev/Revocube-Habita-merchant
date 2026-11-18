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
  bankCode: string;
}

export interface ReceivingBank {
  name: string;
  code: string;
}

export interface ResolvedBankAccount {
  accountNumber: string;
  accountName: string;
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

export const useGetReceivingBanks = (enabled = true) => {
  const query = useGetApiManager({
    queryKey: ["get_receiving_banks"],
    endpoint: "receive-payments/banks",
    isAuth: true,
    isCode: true,
    enabled,
  });

  const banks: ReceivingBank[] = Array.isArray(query.data?.data)
    ? query.data.data
    : [];

  return { ...query, banks };
};

export const useResolveBankAccount = (
  accountNumber: string,
  bankCode: string,
  enabled: boolean,
) => {
  const query = useGetApiManager({
    queryKey: ["resolve_bank_account", accountNumber, bankCode],
    endpoint: "receive-payments/resolve",
    params: { accountNumber, bankCode },
    isAuth: true,
    isCode: true,
    enabled: enabled && /^\d{10}$/.test(accountNumber) && !!bankCode,
  });

  return {
    ...query,
    resolvedAccount: query.data?.data as ResolvedBankAccount | undefined,
  };
};
