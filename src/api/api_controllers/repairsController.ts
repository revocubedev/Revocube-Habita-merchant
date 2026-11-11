import useGetApiManager from "../useGetApiManager";
import useApiManager from "../useApiManager";

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
    method: "POST",
    isAuth: true,
    isCode: true,
    showSuccessToastt: true,
    successMessage: "Repair request approved successfully",
  });

export const extractRepairs = (payload: any): RepairRequest[] =>
  payload?.data ?? [];

export const extractRepair = (payload: any): RepairRequest | null =>
  payload?.data ?? null;
