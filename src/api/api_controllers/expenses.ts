import useGetApiManager from "../useGetApiManager";
import useApiManager from "../useApiManager";

export interface Expense {
  id: string;
  title: string;
  // Create/update responses return `issueTypeId`; a list response may return
  // `issueType` as a string or an object, so accept all of them.
  issueType?: string | { id?: string; value?: string; name?: string } | null;
  type?: string;
  issueTypeId?: string | null;
  amount: number | string;
  date?: string;
  notes?: string | null;
  receipt?: string | null;
  receiptUrl?: string | null;
  expenseNumber?: string | null;
  propertyId?: string | null;
  unitId?: string | null;
  property?: string | { id: string; name: string } | null;
  unit?: string | { id: string; name: string } | null;
}

/** Matches the Postman form-data body for Create / Update Expenses.
 *  `issueType` is the frontend field; it is sent to the backend as `issueTypeId`. */
export interface ExpenseInput {
  title: string;
  issueType: string; // Backend issue type ID
  amount: number;
  date: string;
  notes: string;
  receipt?: File;
  propertyId?: string;
  unitId?: string;
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
  const code = localStorage.getItem("est_code");

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

  if (creating && !input.issueType?.trim()) {
    throw new Error("Issue type is required");
  }

  if (creating && !input.notes?.trim()) {
    throw new Error("Expense notes are required");
  }

  if (input.issueType !== undefined && !input.issueType.trim()) {
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

/** The backend expects the issue type as an uppercase ID. */
const toIssueTypeId = (value: string): string => value.trim().toUpperCase();

/** Builds multipart form-data from any plain object (skips null/undefined). */
function toFormData(input: Record<string, unknown>): FormData {
  const formData = new FormData();

  Object.entries(input).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    formData.append(
      key,
      value instanceof Blob ? value : String(value),
    );
  });

  return formData;
}


export const useCreateExpense = () => {
  const { callApi, isLoading, data, response, error, isSuccess } = useApiManager({
    endpoint: "expenses/",
    queryKey: ["get_expenses"],
    method: "POST",
    isAuth: true,
    isCode: true,
    contentType: "multipart/form-data",
  });

  const createExpense = async (details: ExpenseInput): Promise<Expense> => {
    requireEstateCode();
    validateInput(details, true);

    // Backend field is `issueTypeId`, so don't send `issueType`.
    const { issueType, ...rest } = details;

    const formData = toFormData({
      ...rest,
      title: details.title.trim(),
      notes: details.notes.trim(),
      issueTypeId: toIssueTypeId(issueType),
    });

    // FormData doesn't print in console.log, so inspect it like this:
    console.log("CREATE EXPENSE:", Object.fromEntries(formData.entries()));

    const result = await callApi(formData);
    if (!result.success) throw new Error(result.message || "Could not create expense");
    return result.data as Expense;
  };

  return { createExpense, isLoading, data, response, error, isSuccess };
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

    const { issueType, ...rest } = details;

    const formData = toFormData({
      ...rest,
      ...(rest.title !== undefined ? { title: rest.title.trim() } : {}),
      ...(rest.notes !== undefined ? { notes: rest.notes.trim() } : {}),
      ...(issueType !== undefined
        ? { issueTypeId: toIssueTypeId(issueType) }
        : {}),
    });

    console.log("UPDATE EXPENSE:", Object.fromEntries(formData.entries()));

    const result = await callApi(formData);

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
  const code = localStorage.getItem("est_code") ?? "";

  return useGetApiManager<ExpensesResponse>({
    endpoint: "expenses/",
    // Estate code first, so it matches useApiManager's invalidation key
    // ([estateCode, "get_expenses"]) and the list refreshes after mutations.
    queryKey: [code, "get_expenses"],
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
  const code = localStorage.getItem("est_code") ?? "";

  return useGetApiManager({
    endpoint: `expenses/${encodeURIComponent(id?.trim() ?? "")}`,
    queryKey: [code, "get_expenses", id?.trim() ?? ""],
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