import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useParams } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from '@/lib/auth';
import { ThemeProvider, useTheme } from '@/lib/theme';
import PageLayout from '@/components/layout/PageLayout';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import VerifyEmail from '@/pages/VerifyEmail';
import Dashboard from '@/pages/Dashboard';
import Placeholder from '@/pages/Placeholder';
import Members from '@/pages/Members';
import Maintainers from '@/pages/Maintainers';
import Maintenance from '@/pages/Maintenance';
import Finance from '@/pages/finance';
import Invoices from '@/pages/finance/Invoices';
import Expense from '@/pages/finance/Expense';
import NoticeBoard from '@/pages/NoticeBoard';
import Visitors from '@/pages/visitors';
import GuestVerification from '@/pages/visitors/GuestVerification';
import StaffVerification from '@/pages/visitors/StaffVerification';
import EstateRules from '@/pages/EstateRules';
import Types from '@/pages/Types';
import EmailNotification from '@/pages/EmailNotification';
import Settings from '@/pages/Settings';
import RealEstate from '@/pages/real-estate';
import Properties from '@/pages/real-estate/Properties';
import Units from '@/pages/real-estate/Units';
import Management from '@/pages/management';
import Users from '@/pages/management/Users';
import Roles from '@/pages/management/Roles';
import { Toaster } from 'sonner';
import { estatePath, getDefaultEstateCode, getStoredEstateCodes } from '@/lib/estateRoutes';

// Query Client Configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    },
    mutations: {
      retry: false,
    },
  },
});

// Protected route wrapper
function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const { estateCode } = useParams();
  const location = useLocation();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  const defaultCode = getDefaultEstateCode();
  if (!defaultCode) return <Navigate to="/login" replace />;
  const legacySections = new Set([
    'dashboard',
    'management',
    'members',
    'maintainers',
    'real-estate',
    'maintenance',
    'finance',
    'notice-board',
    'visitors',
    'estate-rules',
    'types',
    'email-notification',
    'settings',
  ]);

  if (estateCode && legacySections.has(estateCode)) {
    const redirect = `${estatePath(defaultCode, location.pathname)}${location.search}${location.hash}`;
    return <Navigate to={redirect} replace />;
  }

  const codes = getStoredEstateCodes();
  const isAllowed = estateCode && (codes.length
    ? codes.includes(estateCode)
    : estateCode === defaultCode);

  if (!isAllowed) {
    return <Navigate to={estatePath(defaultCode)} replace />;
  }

  return <ActiveEstate code={estateCode}>{children}</ActiveEstate>;
}

function ActiveEstate({ code, children }: { code: string; children: React.ReactNode }) {
  useEffect(() => {
    localStorage.setItem('code', code);
  }, [code]);
  return <>{children}</>;
}

function EstateFallback() {
  const { estateCode = '' } = useParams();
  return <Navigate to={estatePath(estateCode)} replace />;
}

function HomeRedirect() {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  const code = getDefaultEstateCode();
  return <Navigate to={code ? estatePath(code) : '/login'} replace />;
}

// App with providers
function AppContent() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/" element={<HomeRedirect />} />
      <Route
        path="/:estateCode"
        element={
          <RequireAuth>
            <PageLayout theme={theme} toggleTheme={toggleTheme} />
          </RequireAuth>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="management" element={<Management />}>
          <Route index element={<Users />} />
          <Route path="users" element={<Users />} />
          <Route path="roles" element={<Roles />} />
          <Route path="logs" element={<Placeholder title="Logged History" />} />
        </Route>
        <Route path="members" element={<Members />} />
        <Route path="maintainers" element={<Maintainers />} />
        <Route path="real-estate" element={<RealEstate />}>
          <Route index element={<Properties />} />
          <Route path="properties" element={<Properties />} />
          <Route path="units" element={<Units />} />
        </Route>
        <Route path="maintenance" element={<Maintenance />} />
        <Route path="finance" element={<Finance />}>
          <Route index element={<Invoices />} />
          <Route path="invoices" element={<Invoices />} />
          <Route path="expense" element={<Expense />} />
        </Route>
        <Route path="notice-board" element={<NoticeBoard />} />
        <Route path="visitors" element={<Visitors />}>
          <Route index element={<GuestVerification />} />
          <Route path="guest-verification" element={<GuestVerification />} />
          <Route path="staff-verification" element={<StaffVerification />} />
        </Route>
        <Route path="estate-rules" element={<EstateRules />} />
        <Route path="types" element={<Types />} />
        <Route path="email-notification" element={<EmailNotification />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<EstateFallback />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  );
}

export default App;
