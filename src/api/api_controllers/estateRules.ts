
import useApiManager from "../useApiManager";
import useGetApiManager from "../useGetApiManager";

export interface EstateRule {
  id?: string;
  name?: string;
  file?: string;
  ruleFile?: string;
  document?: string;
  documentUrl?: string;
  url?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface EstateRulesResponse {
  success: boolean;
  message?: string;
  data: EstateRule[];
}

const QUERY_KEY = "get_estate_rules";

const estateCode = () =>
  localStorage.getItem("code")?.trim() ?? "";

const isRecord = (
  value: unknown
): value is Record<string, unknown> =>
  typeof value === "object" &&
  value !== null &&
  !Array.isArray(value);

/**
 * Normalize estate rules API response.
 */
export function parseEstateRulesResponse(
  payload: unknown
): EstateRulesResponse {
  const envelope = isRecord(payload) ? payload : {};

  if (envelope.success === false) {
    throw new Error(
      typeof envelope.message === "string"
        ? envelope.message
        : "Could not load estate rules"
    );
  }

  const rawData = envelope.data;

  let candidate: unknown;

  if (Array.isArray(rawData)) {
    candidate = rawData;
  } else if (isRecord(rawData)) {
    // Check nested collections before treating data as a rule.
    candidate = [
      rawData.rules,
      rawData.items,
      rawData.data,
      rawData.rule,
    ].find(
      (value) => Array.isArray(value) || isRecord(value)
    );

    // Support APIs returning one rule directly.
    if (!candidate && (
      "id" in rawData ||
      "documentUrl" in rawData ||
      "file" in rawData
    )) {
      candidate = rawData;
    }
  }

  const data = Array.isArray(candidate)
    ? candidate.filter(isRecord) as EstateRule[]
    : isRecord(candidate)
      ? [candidate as EstateRule]
      : [];

  return {
    success: true,
    message:
      typeof envelope.message === "string"
        ? envelope.message
        : undefined,
    data,
  };
}

/**
 * Get the estate rule document URL.
 */
export function estateRuleUrl(
  rule?: EstateRule
): string | undefined {
  if (!rule) return undefined;

  return [
    rule.documentUrl,
    rule.file,
    rule.ruleFile,
    rule.document,
    rule.url,
  ].find(
    (value): value is string =>
      typeof value === "string" && value.length > 0
  );
}

/**
 * GET /:code/estate-rules/
 */
export const useGetEstateRules = () => {
  const code = estateCode();

  return useGetApiManager<EstateRulesResponse>({
    endpoint: "estate-rules",
    queryKey: [QUERY_KEY, code],
    isAuth: true,
    isCode: true,
    enabled: Boolean(code),
    select: parseEstateRulesResponse,
  });
};

/**
 * POST /:code/estate-rules/
 * Upload estate rules PDF.
 */
export const useUploadEstateRules = () => {
  const api = useApiManager({
    endpoint: "estate-rules",
    method: "POST",
    queryKey: [QUERY_KEY, estateCode()],
    isAuth: true,
    isCode: true,
  });

  const uploadEstateRules = async (file: File) => {
    if (!estateCode()) {
      throw new Error("Estate code is missing");
    }

    if (file.type !== "application/pdf") {
      throw new Error("Please select a PDF document");
    }

    const form = new FormData();

    // Important: API expects documentUrl, not file.
    form.append("documentUrl", file);

    const result = await api.callApi(form);

    if (result.success === false) {
      throw new Error(
        result.message || "Could not upload estate rules"
      );
    }

    return result;
  };

  return {
    ...api,
    uploadEstateRules,
  };
};
