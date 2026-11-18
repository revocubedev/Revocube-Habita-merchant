import useApiManager from '../useApiManager';
import useGetApiManager from '../useGetApiManager';

export interface EstateJoinRequest {
  id: string;
  userId: string;
  estateId: string;
  unitApartmentId: string;
  notes: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'MOVED_OUT' | string;
  reviewedAt: string | null;
  reviewedBy: string | null;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    fullName: string;
    email: string;
    phoneNumber: string | null;
    address?: string | null;
    occupation?: string | null;
  };
}

export interface JoinRequestPagination {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

const QUERY_KEY = 'estate_join_requests';

export const useGetEstateJoinRequests = () => {
  const query = useGetApiManager({
    queryKey: [QUERY_KEY],
    endpoint: 'join/',
    isAuth: true,
    isCode: true,
  });

  const items: EstateJoinRequest[] = Array.isArray(query.data?.data?.items)
    ? query.data.data.items
    : [];

  return {
    ...query,
    items,
    pagination: query.data?.data?.pagination as JoinRequestPagination | undefined,
  };
};

export const useApproveEstateJoinRequest = (id: string) => {
  const { callApi, isLoading } = useApiManager({
    endpoint: `join/${encodeURIComponent(id)}`,
    method: 'PATCH',
    isAuth: true,
    isCode: true,
    queryKey: [QUERY_KEY, 'get_members'],
  });

  return { approve: () => callApi(), isLoading };
};

export const useMoveOutResident = (requestId: string) => {
  const { callApi, isLoading } = useApiManager({
    endpoint: `join/${encodeURIComponent(requestId)}/move-out`,
    method: 'PATCH',
    isAuth: true,
    isCode: true,
    queryKey: [QUERY_KEY, 'get_members'],
  });

  return { moveOut: () => callApi(), isLoading };
};
