import { Building2, CreditCard, Wallet, AlertCircle } from 'lucide-react';
import StatCard from '@/components/shared/StatCard';
import Card from '@/components/ui/Card';
import { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';

const Dashboard = () => {
  // Chart data matching Figma visual pattern
  const chartData = [
    { month: 'Jan', income: 120, expense: 80 },
    { month: 'Feb', income: 180, expense: 100 },
    { month: 'Mar', income: 140, expense: 90 },
    { month: 'Apr', income: 200, expense: 110 },
    { month: 'May', income: 220, expense: 130 },
    { month: 'Jun', income: 250, expense: 140 },
    { month: 'Jul', income: 200, expense: 150 },
    { month: 'Aug', income: 180, expense: 160 },
    { month: 'Sep', income: 160, expense: 140 },
    { month: 'Oct', income: 190, expense: 130 },
    { month: 'Nov', income: 280, expense: 150 },
    { month: 'Dec', income: 260, expense: 160 },
  ];

  return (
    <div className="space-y-6 px-6">
      {/* Welcome Section */}
      <div style={{ marginTop: '24px' }}>
        <h1
          className="font-display font-semibold text-foreground"
          style={{
            fontFamily: 'Poppins',
            fontWeight: 600,
            fontSize: '22px',
            color: '#393939'
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
            fontFamily: 'Poppins',
            fontWeight: 600,
            fontSize: '20px',
            color: '#393939'
          }}
        >
          Overview
        </h2>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[42px]">
          <StatCard
            title="Active Estates"
            value="12"
            icon={Building2}
          />
          <StatCard
            title="Active subscriptions"
            value="24"
            icon={CreditCard}
          />
          <StatCard
            title="Total Revenue"
            value="₦20,000,000"
            icon={Wallet}
          />
          <StatCard
            title="Pending invoices"
            value="10"
            icon={AlertCircle}
          />
        </div>
      </div>

      {/* Analysis Report Chart */}
      <Card
        className="bg-card border border-border"
        style={{
          borderRadius: '24px',
          boxShadow: '0 4px 32px rgba(0, 0, 0, 0.1)'
        }}
      >
        <CardHeader
          className="flex flex-row items-center justify-between pb-4 border-b border-border"
          style={{ padding: '24px 24px 16px 24px' }}
        >
          <CardTitle
            className="font-display font-medium text-foreground"
            style={{
              fontFamily: 'Poppins',
              fontWeight: 500,
              fontSize: '16px',
              color: '#4c4c4c'
            }}
          >
            Analysis Report
          </CardTitle>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#f30100' }}></div>
              <span
                className="text-sm text-muted-foreground"
                style={{
                  fontFamily: 'Poppins',
                  fontWeight: 400,
                  color: '#4c4c4c'
                }}
              >
                Total Income
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#300000' }}></div>
              <span
                className="text-sm text-muted-foreground"
                style={{
                  fontFamily: 'Poppins',
                  fontWeight: 400,
                  color: '#4c4c4c'
                }}
              >
                Total Expense
              </span>
            </div>
            <button
              className="px-3 py-1.5 text-sm border border-border rounded-lg bg-card text-foreground hover:bg-muted transition-colors"
              style={{
                fontFamily: 'Poppins',
                borderRadius: '8px',
                borderColor: '#e3e3e3'
              }}
            >
              January
            </button>
          </div>
        </CardHeader>
        <CardContent style={{ padding: '16px 24px 24px 24px' }}>
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
                style={{
                  fontFamily: 'Poppins',
                  fontWeight: 400,
                  fill: '#717171',
                  fontSize: '12px'
                }}
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                domain={[0, 300]}
                style={{
                  fontFamily: 'Poppins',
                  fontWeight: 400,
                  fill: '#717171',
                  fontSize: '12px'
                }}
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                ticks={[0, 50, 100, 150, 200, 250, 300]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e3e3e3',
                  borderRadius: '8px',
                  fontFamily: 'Poppins',
                  fontSize: '12px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  padding: '12px'
                }}
              />
              <Area
                type="monotone"
                dataKey="income"
                stroke="#f30100"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorIncome)"
                dot={false}
                activeDot={{ r: 5, stroke: '#f30100', strokeWidth: 2, fill: '#ffffff' }}
              />
              <Line
                type="monotone"
                dataKey="expense"
                stroke="#300000"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5, stroke: '#300000', strokeWidth: 2, fill: '#ffffff' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
