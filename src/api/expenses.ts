import axiosAuth from "./axios_with_token";

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
  meta: Pagination;
}

interface DeleteExpenseResponse {
  success: boolean;
  message: string;
}

/**
 * Builds:
 * /:code/expenses/
 * /:code/expenses/:id
 *
 * axiosAuth supplies the API base URL and token
 */
function expenseUrl(code: string, id?: string): string {
  const estateCode = code.trim();

  if (!estateCode) {
    throw new Error("Estate code is required");
  }

  const base = `${encodeURIComponent(estateCode)}/expenses/`;

  if (id === undefined) {
    return base;
  }

  const expenseId = id.trim();

  if (!expenseId) {
    throw new Error("Expense ID is required");
  }

  return `${base}${encodeURIComponent(expenseId)}`;
}

/**
 * Converts create/update fields to multipart form-data.
 * Missing values are omitted; empty strings are preserved.
 */
function toFormData(input: Partial<ExpenseInput>): FormData {
  const formData = new FormData();

  Object.entries(input).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }

    if (value instanceof Blob) {
      formData.append(key, value);
    } else {
      formData.append(key, String(value));
    }
  });

  return formData;
}

function validateAmount(amount: number | undefined): void {
  if (
    amount !== undefined &&
    (!Number.isFinite(amount) || amount <= 0)
  ) {
    throw new Error("Amount must be greater than zero");
  }
}

/**
 * POST /:code/expenses/
 */
export async function createExpense(
  code: string,
  input: ExpenseInput,
): Promise<Expense> {
  if (!input.title.trim()) {
    throw new Error("Expense title is required");
  }

  if (!input.issueType?.trim() && !input.type?.trim()) {
    throw new Error("Issue type is required");
  }

  if (!input.date.trim()) {
    throw new Error("Expense date is required");
  }

  validateAmount(input.amount);

  const payload: Partial<ExpenseInput> = {
    ...input,
    issueType: input.issueType ?? input.type,
    type: input.type ?? input.issueType,
  };

  const { data } = await axiosAuth.post<ApiResponse<Expense>>(
    expenseUrl(code),
    toFormData(payload),
    {
      headers: {
        "Content-Type": undefined,
      },
    },
  );

  if (!data.success) {
    throw new Error(data.message || "Could not create expense");
  }

  return data.data;
}

/**
 * PATCH /:code/expenses/:id
 */
export async function updateExpense(
  code: string,
  id: string,
  input: Partial<ExpenseInput>,
): Promise<Expense> {
  if (
    input.title !== undefined &&
    !input.title.trim()
  ) {
    throw new Error("Expense title cannot be empty");
  }

  if (
    input.issueType !== undefined &&
    !input.issueType.trim()
  ) {
    throw new Error("Issue type cannot be empty");
  }

  if (
    input.type !== undefined &&
    !input.type.trim()
  ) {
    throw new Error("Issue type cannot be empty");
  }

  if (
    input.date !== undefined &&
    !input.date.trim()
  ) {
    throw new Error("Expense date cannot be empty");
  }

  validateAmount(input.amount);

  const payload: Partial<ExpenseInput> = {
    ...input,
    issueType: input.issueType ?? input.type,
    type: input.type ?? input.issueType,
  };

  const { data } = await axiosAuth.patch<ApiResponse<Expense>>(
    expenseUrl(code, id),
    toFormData(payload),
    {
      headers: {
        "Content-Type": undefined,
      },
    },
  );

  if (!data.success) {
    throw new Error(data.message || "Could not update expense");
  }

  return data.data;
}

/**
 * GET /:code/expenses/
 */
export async function getAllExpenses(
  code: string,
): Promise<ExpensesResponse> {
  const { data } = await axiosAuth.get<ExpensesResponse>(
    expenseUrl(code),
  );

  if (!data.success) {
    throw new Error(data.message || "Could not retrieve expenses");
  }

  return data;
}

/**
 * GET /:code/expenses/:id
 */
export async function getExpenseById(
  code: string,
  id: string,
): Promise<Expense> {
  const { data } = await axiosAuth.get<ApiResponse<Expense>>(
    expenseUrl(code, id),
  );

  if (!data.success) {
    throw new Error(data.message || "Could not retrieve expense");
  }

  return data.data;
}

/**
 * DELETE /:code/expenses/:id
 */
export async function deleteExpense(
  code: string,
  id: string,
): Promise<string> {
  const { data } = await axiosAuth.delete<DeleteExpenseResponse>(
    expenseUrl(code, id),
  );

  if (!data.success) {
    throw new Error(data.message || "Could not delete expense");
  }

  return data.message;
}