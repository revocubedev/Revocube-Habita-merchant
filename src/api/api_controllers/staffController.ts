import useApiManager from '../useApiManager';
import useGetApiManager from '../useGetApiManager';

export type StaffCodeStatus = 'CHECKED_IN' | 'CHECKED_OUT';

export interface AdminStaff {
  id: string;
  staffCode: string;
  fullName: string;
  status: StaffCodeStatus | 'INCOMING';
  checkInDate: string | null;
  checkOutDate: string | null;
  checkInTime: string | null;
  checkOutTime: string | null;
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
