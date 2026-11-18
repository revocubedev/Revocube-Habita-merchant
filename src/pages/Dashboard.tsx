import { Building2, CreditCard, Wallet, AlertCircle } from "lucide-react";
import StatCard from "@/components/shared/StatCard";
import Card from "@/components/ui/Card";
import { CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import {
  extractDashboard,
  useGetDashboardStats,
} from "@/api/api_controllers/dashboard";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);

const formatCompactCurrency = (amount: number) => {
  if (amount >= 1_000_000) {
    return `₦${(amount / 1_000_000).toFixed(1)}m`;
  }

  if (amount >= 1_000) {
    return `₦${(amount / 1_000).toFixed(0)}k`;
  }

  return `₦${amount}`;
};

const Dashboard = () => {
  const { data, isLoading, isError, error } = useGetDashboardStats();

  const dashboard = extractDashboard(data);
  const summary = dashboard?.summary;

  const monthly = dashboard?.monthlyAnalysis ?? [];

  // Use actual API response for the chart
  const chartData = monthly.map((item) => ({
    month: item.monthName.slice(0, 3),
    income: item.income,
    expense: item.expenses,
  }));

  if (isLoading) {
    return (
      <div className="px-6 py-10 text-center text-muted-foreground">
        Loading dashboard statistics...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="px-6 py-10 text-center text-red-500">
        Failed to load dashboard statistics.
        <p className="text-sm mt-2">
          {error instanceof Error ? error.message : "Please try again."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-6">
      {/* Welcome Section */}
      <div style={{ marginTop: "24px" }}>
        <h1
          className="font-display font-semibold text-foreground"
          style={{
            fontFamily: "Poppins",
            fontWeight: 600,
            fontSize: "22px",
            color: "#393939",
          }}
        >
          Welcome Back, Diwura!
        </h1>
      </div>

      {/* Overview Section */}
      <div>
        <h2
          className="font-display font-semibold text-foreground mb-4"
          style={{
            fontFamily: "Poppins",
            fontWeight: 600,
            fontSize: "20px",
            color: "#393939",
          }}
        >
          Overview
        </h2>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[42px]">
          <StatCard
            title="Total Properties"
            value={String(summary?.totalProperties ?? 0)}
            icon={Building2}
          />

          <StatCard
            title="Total Units"
            value={String(summary?.totalUnits ?? 0)}
            icon={CreditCard}
          />

          <StatCard
            title="Total Invoice Amount"
            value={formatCurrency(summary?.totalInvoiceAmount ?? 0)}
            icon={Wallet}
          />

          <StatCard
            title="Total Expenses"
            value={formatCurrency(summary?.totalExpenses ?? 0)}
            icon={AlertCircle}
          />
        </div>

        {/* Additional Dashboard Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <Card className="border border-border rounded-xl">
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">Total Invoices</p>
              <h3 className="text-2xl font-semibold mt-2">
                {summary?.totalInvoices ?? 0}
              </h3>
            </CardContent>
          </Card>

          <Card className="border border-border rounded-xl">
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">Reporting Year</p>
              <h3 className="text-2xl font-semibold mt-2">
                {dashboard?.year ?? new Date().getFullYear()}
              </h3>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Analysis Report Chart */}
      <Card
        className="bg-card border border-border"
        style={{
          borderRadius: "24px",
          boxShadow: "0 4px 32px rgba(0, 0, 0, 0.1)",
        }}
      >
        <CardHeader
          className="flex flex-row items-center justify-between pb-4 border-b border-border"
          style={{ padding: "24px 24px 16px 24px" }}
        >
          <div>
            <CardTitle
              className="font-display font-medium text-foreground"
              style={{
                fontFamily: "Poppins",
                fontWeight: 500,
                fontSize: "16px",
                color: "#4c4c4c",
              }}
            >
              Analysis Report
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Monthly income and expenses ({dashboard?.year})
            </p>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: "#f30100" }}
              />
              <span className="text-sm text-muted-foreground">
                Total Income
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: "#300000" }}
              />
              <span className="text-sm text-muted-foreground">
                Total Expense
              </span>
            </div>
          </div>
        </CardHeader>

        <CardContent style={{ padding: "16px 24px 24px 24px" }}>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f30100" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f30100" stopOpacity={0} />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e3e3e3"
                  vertical={false}
                />

                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12, fill: "#717171" }}
                  tickLine={false}
                  axisLine={false}
                />

                <YAxis
                  domain={[0, (max: number) => Math.max(max, 1)]}
                  tickFormatter={formatCompactCurrency}
                  tick={{ fontSize: 12, fill: "#717171" }}
                  tickLine={false}
                  axisLine={false}
                  width={75}
                />

                <Tooltip
                  formatter={(value) => formatCurrency(Number(value))}
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #e3e3e3",
                    borderRadius: "8px",
                    fontFamily: "Poppins",
                    fontSize: "12px",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    padding: "12px",
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="income"
                  name="Total Income"
                  stroke="#f30100"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorIncome)"
                  dot={false}
                  activeDot={{
                    r: 5,
                    stroke: "#f30100",
                    strokeWidth: 2,
                    fill: "#ffffff",
                  }}
                />

                <Line
                  type="monotone"
                  dataKey="expense"
                  name="Total Expense"
                  stroke="#300000"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{
                    r: 5,
                    stroke: "#300000",
                    strokeWidth: 2,
                    fill: "#ffffff",
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[350px] flex items-center justify-center text-muted-foreground">
              No monthly analysis data available.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
