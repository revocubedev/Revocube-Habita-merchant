import useApiManager from '../useApiManager';
import useGetApiManager from '../useGetApiManager';

export type StaffCodeStatus = 'CHECKED_IN' | 'CHECKED_OUT';

export interface AdminStaff {
  id: string;
  staffCode: string;
  fullName: string;
  status: StaffCodeStatus | "INCOMING";
  checkInDate: string | null;
  checkOutDate: string | null;
  checkInTime: string | null;
  checkOutTime: string | null;
  checkInNote: string | null;
  checkOutNote: string | null;
  createdAt: string;
  email?: string | null;
  phoneNumber?: string | null;
  description?: string | null;
  numberOfVisitors?: number;
  propertyId?: string | null;
  unitId?: string | null;
  createdByMemberId?: string | null;
  allowedDays?: string[];
  updatedAt?: string;
  isActive?: boolean;
}

export interface AdminStaffMeta {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
}

export const useGetAdminStaff = () => {
  const query = useGetApiManager({
    queryKey: ['admin_staff'],
    endpoint: 'staff/get',
    isAuth: true,
    isCode: true,
  });

  const staff: AdminStaff[] = Array.isArray(query.data?.data)
    ? query.data.data
    : [];

  return { ...query, staff, meta: query.data?.meta as AdminStaffMeta | undefined };
};

export const useGetAdminStaffById = (id: string | null) => {
  const query = useGetApiManager({
    queryKey: ['admin_staff_details', id ?? ''],
    endpoint: `staff/${encodeURIComponent(id ?? '')}/get`,
    isAuth: true,
    isCode: true,
    enabled: !!id,
  });

  return { ...query, staff: query.data?.data as AdminStaff | undefined };
};

export const useUpdateStaffCodeStatus = (staffCode: string) => {
  const { callApi, isLoading } = useApiManager({
    endpoint: `staff/${encodeURIComponent(staffCode)}/status`,
    method: 'PATCH',
    isAuth: true,
    isCode: true,
    queryKey: ['admin_staff'],
  });

  const updateStatus = (status: StaffCodeStatus) => callApi({ status });

  return { updateStatus, isLoading };
};


export const useDeactivateStaffCode = (staffCode?: string) => {
  const { callApi, isLoading, error, isSuccess } = useApiManager({
    endpoint: `staff/${staffCode}/deactivate`,
    queryKey: [
      /* same keys as useUpdateStaffCodeStatus */
    ],
    method: "PATCH", // confirm in Postman: PATCH, PUT or POST
    isAuth: true,
    isCode: true,
    successMessage: "Staff access code deactivated successfully",
  });

  const deactivateStaffCode = () => callApi({});
  return { deactivateStaffCode, isLoading, error, isSuccess };
};