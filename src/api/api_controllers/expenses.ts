import useGetApiManager from "../useGetApiManager";
import useApiManager from "../useApiManager";

export interface Expense {
  id: string;
  title: string;
  issueType?: string;
  type?: string;
  amount: number | string;
  date?: string;
  notes?: string | null;
  receipt?: string | null;
  expenseNumber?: string | null;
  property?: string | null;
  unit?: string | null;
}

export interface ExpenseInput {
  title: string;
  issueType?: string;
  type?: string;
  amount: number;
  date: string;
  notes?: string;
  receipt?: File;
  property?: string;
  unit?: string;
}

export interface Pagination {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ExpensesResponse extends ApiResponse<Expense[]> {
  meta?: Pagination;
}

/** Keep the page independent of the list envelope returned by the API. */
export function parseExpensesResponse(payload: unknown): ExpensesResponse {
  const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === "object" && value !== null && !Array.isArray(value);
  const envelope = isRecord(payload) ? payload : undefined;
  if (envelope?.success === false) {
    throw new Error(typeof envelope.message === "string" ? envelope.message : "Could not load expenses");
  }

  const nested = isRecord(envelope?.data) ? envelope.data : undefined;
  const records = [payload, envelope?.data, nested?.expenses, nested?.items, nested?.data]
    .find(Array.isArray);
  if (!Array.isArray(records)) {
    throw new Error("The expenses API returned an unexpected response. Expected a list of expenses.");
  }
  if (!records.every((item) => isRecord(item) && typeof item.id === "string" && typeof item.title === "string" && (typeof item.amount === "number" || typeof item.amount === "string"))) {
    throw new Error("The expenses API returned records without the expected id, title, or amount fields.");
  }

  const meta = envelope?.meta ?? nested?.meta;
  const pagination = isRecord(meta) && ["currentPage", "itemsPerPage", "totalItems", "totalPages"].every((key) => typeof meta[key] === "number")
    ? meta as unknown as Pagination : undefined;
  return {
    success: true,
    message: typeof envelope?.message === "string" ? envelope.message : "",
    data: records as Expense[],
    meta: pagination,
  };
}

function requireId(id?: string): string {
  if (!id?.trim()) {
    throw new Error("Expense ID is required");
  }

  return id.trim();
}

function requireEstateCode(): void {
  const code = localStorage.getItem("code");

  if (!code?.trim()) {
    throw new Error("Estate code is missing");
  }
}

function validateInput(
  input: Partial<ExpenseInput>,
  creating = false,
): void {
  if (
    (creating || input.title !== undefined) &&
    !input.title?.trim()
  ) {
    throw new Error("Expense title is required");
  }

  if (creating && !input.issueType?.trim() && !input.type?.trim()) {
    throw new Error("Issue type is required");
  }

  if (creating && !input.notes?.trim()) {
    throw new Error("Expense notes are required");
  }

  if (
    (input.issueType !== undefined && !input.issueType.trim()) ||
    (input.type !== undefined && !input.type.trim())
  ) {
    throw new Error("Issue type cannot be empty");
  }

  if (
    (creating || input.date !== undefined) &&
    !input.date?.trim()
  ) {
    throw new Error("Expense date is required");
  }

  if (
    (creating || input.amount !== undefined) &&
    (
      typeof input.amount !== "number" ||
      !Number.isFinite(input.amount) ||
      input.amount <= 0
    )
  ) {
    throw new Error("Amount must be greater than zero");
  }
}

function toFormData(input: Partial<ExpenseInput>): FormData {
  const payload = {
    ...input,
    issueType: input.issueType ?? input.type,
    type: input.type ?? input.issueType,
  };

  const formData = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    formData.append(
      key,
      value instanceof Blob ? value : String(value),
    );
  });

  return formData;
}

export const useCreateExpense = () => {
  const {
    callApi,
    isLoading,
    data,
    response,
    error,
    isSuccess,
  } = useApiManager({
    endpoint: "expenses/",
    queryKey: ["get_expenses"],
    method: "POST",
    isAuth: true,
    isCode: true,
    contentType: "multipart/form-data",
  });

  const createExpense = async (
    details: ExpenseInput,
  ): Promise<Expense> => {
    requireEstateCode();
    validateInput(details, true);

    const result = await callApi(toFormData(details));

    if (!result.success) {
      throw new Error(result.message || "Could not create expense");
    }

    return result.data as Expense;
  };

  return {
    createExpense,
    isLoading,
    data,
    response,
    error,
    isSuccess,
  };
};

export const useUpdateExpense = (id?: string) => {
  const {
    callApi,
    isLoading,
    data,
    response,
    error,
    isSuccess,
  } = useApiManager({
    endpoint: `expenses/${encodeURIComponent(id?.trim() ?? "")}`,
    queryKey: ["get_expenses"],
    method: "PATCH",
    isAuth: true,
    isCode: true,
    contentType: "multipart/form-data",
  });

  const updateExpense = async (
    details: Partial<ExpenseInput>,
  ): Promise<Expense> => {
    requireEstateCode();
    requireId(id);
    validateInput(details);

    const result = await callApi(toFormData(details));

    if (!result.success) {
      throw new Error(result.message || "Could not update expense");
    }

    return result.data as Expense;
  };

  return {
    updateExpense,
    isLoading,
    data,
    response,
    error,
    isSuccess,
  };
};

export const useGetExpensesCall = (enabled = true) => {
  const code = localStorage.getItem("code") ?? "";

  return useGetApiManager<ExpensesResponse>({
    endpoint: "expenses/",
    queryKey: ["get_expenses", code],
    isAuth: true,
    isCode: true,
    enabled: enabled && Boolean(code.trim()),
    select: parseExpensesResponse,
  });
};

export const useGetExpenseByIdCall = (
  id?: string,
  enabled = true,
) => {
  const code = localStorage.getItem("code") ?? "";

  return useGetApiManager({
    endpoint: `expenses/${encodeURIComponent(id?.trim() ?? "")}`,
    queryKey: ["get_expenses", code, id?.trim() ?? ""],
    isAuth: true,
    isCode: true,
    enabled:
      enabled &&
      Boolean(code.trim()) &&
      Boolean(id?.trim()),
  });
};

export const useDeleteExpense = (id?: string) => {
  const {
    callApi,
    isLoading,
    data,
    response,
    error,
    isSuccess,
  } = useApiManager({
    endpoint: `expenses/${encodeURIComponent(id?.trim() ?? "")}`,
    queryKey: ["get_expenses"],
    method: "DELETE",
    isAuth: true,
    isCode: true,
  });

  const deleteExpense = async (): Promise<string> => {
    requireEstateCode();
    requireId(id);

    const result = await callApi(undefined);

    if (!result.success) {
      throw new Error(result.message || "Could not delete expense");
    }

    return result.message;
  };

  return {
    deleteExpense,
    isLoading,
    data,
    response,
    error,
    isSuccess,
  };
};
