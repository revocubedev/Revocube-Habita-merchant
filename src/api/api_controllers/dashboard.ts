import useGetApiManager from "../useGetApiManager";


export interface DashboardStats {
  year: number;
  summary: {
    totalProperties: number;
    totalUnits: number;
    totalInvoices: number;
    totalInvoiceAmount: number;
    totalExpenses: number;
  };
  monthlyAnalysis: {
    month: number;
    monthName: string;
    income: number;
    expenses: number;
  }[];
}
export const useGetDashboardStats = ({enabled = true} : {enabled?: boolean} = {}) =>
  useGetApiManager({
    queryKey: ["get_dashboard_stats"],
    isAuth: true,
    isCode: true,
    endpoint: "admin-dashboard",
    enabled,
  });

  export const extractDashboard = (payload: any): DashboardStats | null =>
    payload?.data ?? null;