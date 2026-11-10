import useApiManager from "../useApiManager";
import useGetApiManager from "../useGetApiManager";

export interface EstateRule {
  id?: string;
  name?: string;
  file?: string;
  ruleFile?: string;
  document?: string;
  url?: string;
  createdAt?: string;
}

export interface EstateRulesResponse {
  success: boolean;
  message?: string;
  data: EstateRule[];
}

const QUERY_KEY = "get_estate_rules";
const estateCode = () => localStorage.getItem("code")?.trim() ?? "";
const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/** Accepts the common list and single-record envelopes returned by the rules API. */
export function parseEstateRulesResponse(payload: unknown): EstateRulesResponse {
  const envelope = isRecord(payload) ? payload : {};
  if (envelope.success === false) {
    throw new Error(typeof envelope.message === "string" ? envelope.message : "Could not load estate rules");
  }
  const nested = isRecord(envelope.data) ? envelope.data : {};
  const candidate = [envelope.data, nested.rules, nested.items, nested.data, nested.rule]
    .find((value) => Array.isArray(value) || isRecord(value));
  const data = Array.isArray(candidate) ? candidate.filter(isRecord) : isRecord(candidate) ? [candidate] : [];
  return { success: true, message: typeof envelope.message === "string" ? envelope.message : undefined, data };
}

/** Returns the API-provided document URL regardless of the backend field name. */
export function estateRuleUrl(rule?: EstateRule): string | undefined {
  if (!rule) return undefined;
  return [rule.file, rule.ruleFile, rule.document, rule.url].find((value): value is string => typeof value === "string" && value.length > 0);
}

/** GET /:code/estate-rules/ */
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

/** POST /:code/estate-rules/ — sends the PDF in the `file` multipart field. */
export const useUploadEstateRules = () => {
  const api = useApiManager({
    endpoint: "estate-rules",
    method: "POST",
    queryKey: [QUERY_KEY],
    isAuth: true,
    isCode: true,
  });

  const uploadEstateRules = async (file: File) => {
    if (!estateCode()) throw new Error("Estate code is missing");
    if (file.type !== "application/pdf") throw new Error("Please select a PDF document");
    const form = new FormData();
    form.append("file", file);
    const result = await api.callApi(form);
    if (result.success === false) throw new Error(result.message || "Could not upload estate rules");
    return result;
  };

  return { ...api, uploadEstateRules };
};
