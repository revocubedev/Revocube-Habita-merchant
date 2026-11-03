import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

const Management = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect to /management/users if on /management
  useEffect(() => {
    if (location.pathname === '/management') {
      navigate('/management/users', { replace: true });
    }
  }, [location.pathname, navigate]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[20px] font-display font-semibold text-foreground" style={{ fontFamily: 'Poppins', fontWeight: 600, color: '#393939' }}>
          Management
        </h1>
        <p className="text-muted-foreground mt-1" style={{ fontFamily: 'Poppins', color: '#717171' }}>
          Manage users, roles, and permissions.
        </p>
      </div>

      <div className="border-b border-border"></div>

      <Outlet />
    </div>
  );
};

export default Management;
