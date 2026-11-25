import useGetApiManager from "../useGetApiManager";
import useApiManager from "../useApiManager";
export interface RepairOption {
  id: string;
  name: string;
}

export interface RepairUnitOption extends RepairOption {
  propertyId: string;
}

export interface RepairMaintainer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  maintainerType: string;
  profileImage: string | null;
}

export interface RepairRequest {
  id: string;
  requestDate: string;
  issueType: string;
  maintainerId: string;
  status: string;
  issueDocument: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  memberId: string | null;
  propertyId: string | null;
  unitId: string | null;
  member: any | null;
  maintainer: RepairMaintainer | null;
  property: any | null;
  unit: any | null;
}

export interface RepairsResponse {
  success: boolean;
  message: string;
  data: RepairRequest[];
  meta: {
    currentPage: number;
    itemsPerPage: number;
    totalItems: number;
    totalPages: number;
  };
}

// GET all repair requests
export const useGetRepairs = ({
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
    queryKey: ["get_repairs", page, perPage, search ?? ""],
    isAuth: true,
    isCode: true,
    endpoint: "repairs/admin",
    enabled,
    params: { page, perPage, search },
  });

// GET one repair request
export const useGetRepairById = (id: string | null, enabled = true) =>
  useGetApiManager({
    queryKey: ["get_repair", id || ""],
    isAuth: true,
    isCode: true,
    endpoint: `repairs/admin/${id || ""}`,
    enabled: enabled && Boolean(id),
  });

// POST approve repair request
export const useApproveRepair = (id: string) =>
  useApiManager({
    queryKey: ["get_repairs"],
    endpoint: `repairs/${id}/approve`,
    method: "PATCH",
    isAuth: true,
    isCode: true,
    showSuccessToastt: true,
    // successMessage: "Repair request approved successfully",
  });

  export const useUpdateRepairStatus = (id?: string) => {
    const { callApi, isLoading, error, isSuccess } = useApiManager({
      endpoint: `repairs/${id}/status`,
      queryKey: ["get_repairs", "get_repair"],
      method: "PATCH", // confirm in Postman: PATCH, PUT or POST
      isAuth: true,
      isCode: true,
      successMessage: "Repair status updated successfully",
    });

    const updateRepairStatus = (status: string) => callApi({ status });
    return { updateRepairStatus, isLoading, error, isSuccess };
  };

export const extractRepairs = (payload: any): RepairRequest[] =>
  payload?.data ?? [];

export const extractRepair = (payload: any): RepairRequest | null =>
  payload?.data ?? null;


export const useCreateAdminRepair = () =>
  useApiManager({
    endpoint: "repairs/admin",
    queryKey: ["get_repairs"],
    method: "POST",
    isAuth: true,
    isCode: true,
    contentType: "multipart/form-data",
  });




const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const getRecords = (payload: unknown): Record<string, unknown>[] => {
  if (Array.isArray(payload)) {
    return payload.filter(isRecord);
  }

  if (!isRecord(payload)) return [];

  if (Array.isArray(payload.data)) {
    return payload.data.filter(isRecord);
  }

  if (isRecord(payload.data)) {
    const nested = payload.data;

    for (const key of [
      "items",
      "members",
      "properties",
      "units",
      "maintainers",
    ]) {
      if (Array.isArray(nested[key])) {
        return nested[key].filter(isRecord);
      }
    }
  }

  return [];
};

const getName = (record: Record<string, unknown>) => {
  if (typeof record.name === "string" && record.name.trim()) {
    return record.name;
  }

  return [record.firstName, record.lastName]
    .filter((part): part is string => typeof part === "string")
    .join(" ");
};

const parseOptions = (payload: unknown): RepairOption[] =>
  getRecords(payload)
    .map((record) => ({
      id: String(record.id ?? ""),
      name: getName(record),
    }))
    .filter((item) => item.id && item.name);

const parseUnitOptions = (payload: unknown): RepairUnitOption[] =>
  getRecords(payload)
    .map((record) => ({
      id: String(record.id ?? ""),
      name: getName(record),
      propertyId: String(record.propertyId ?? ""),
    }))
    .filter((item) => item.id && item.name);

export const useGetRepairProperties = () =>
  useGetApiManager<RepairOption[]>({
    endpoint: "properties/",
    queryKey: ["repair_properties"],
    isAuth: true,
    isCode: true,
    select: parseOptions,
  });

export const useGetRepairUnits = () =>
  useGetApiManager<RepairUnitOption[]>({
    endpoint: "units/",
    queryKey: ["repair_units"],
    isAuth: true,
    isCode: true,
    select: parseUnitOptions,
  });

export const useGetRepairMaintainers = () =>
  useGetApiManager<RepairOption[]>({
    endpoint: "maintainers/",
    queryKey: ["repair_maintainers"],
    isAuth: true,
    isCode: true,
    select: parseOptions,
  });


  export interface MemberPropertyOption {
    id: string;
    name: string;
  }

  export interface MemberUnitOption {
    id: string;
    name: string;
    propertyId: string;
  }

  export interface MemberUnitsLookup {
    properties: MemberPropertyOption[];
    units: MemberUnitOption[];
    autoSelectedUnit: MemberUnitOption | null;
  }

  // GET /:code/repairs/:memberId/units
  export const useGetMemberUnits = (memberId?: string) =>
    useGetApiManager({
      queryKey: ["get_member_units", memberId ?? ""],
      isAuth: true,
      isCode: true,
      endpoint: `repairs/${memberId}/units`,
      enabled: Boolean(memberId),
    });

  // Response: { data: { member, properties[], units[{ id, name, property }], autoSelectedUnit } }
  export const extractMemberUnits = (payload: any): MemberUnitsLookup => {
    const d = payload?.data ?? {};
    const rawUnits: any[] = Array.isArray(d.units) ? d.units : [];
    const rawProperties: any[] = Array.isArray(d.properties)
      ? d.properties
      : [];

    const units: MemberUnitOption[] = rawUnits
      .filter((u) => u && typeof u.id === "string")
      .map((u) => ({
        id: u.id,
        name: u.name ?? "Unnamed unit",
        propertyId: String(u.property?.id ?? u.propertyId ?? ""),
      }));

    // Properties listed directly, plus any that only appear on a unit
    const propertyMap = new Map<string, MemberPropertyOption>();
    for (const p of rawProperties) {
      if (p && typeof p.id === "string") {
        propertyMap.set(p.id, { id: p.id, name: p.name ?? "Unnamed property" });
      }
    }
    for (const u of rawUnits) {
      const p = u?.property;
      if (p && typeof p.id === "string" && !propertyMap.has(p.id)) {
        propertyMap.set(p.id, { id: p.id, name: p.name ?? "Unnamed property" });
      }
    }

    // autoSelectedUnit can be null, a unit id, or a unit object
    const raw = d.autoSelectedUnit;
    const autoId = typeof raw === "string" ? raw : raw?.id ?? raw?.unitId;
    let autoSelectedUnit: MemberUnitOption | null = null;
    if (autoId) {
      autoSelectedUnit =
        units.find((u) => u.id === String(autoId)) ??
        (raw && typeof raw === "object"
          ? {
              id: String(autoId),
              name: raw.name ?? "Unit",
              propertyId: String(raw.property?.id ?? raw.propertyId ?? ""),
            }
          : null);
      if (autoSelectedUnit && !autoSelectedUnit.propertyId)
        autoSelectedUnit = null;
    }

    return { properties: [...propertyMap.values()], units, autoSelectedUnit };
  };