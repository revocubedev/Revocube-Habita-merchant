import { useState, useEffect, useRef } from 'react';
import { Settings, ChevronDown, LogOut, Menu } from 'lucide-react';
import { useLocation, useParams } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import type { Theme } from '@/types';
import { estatePath } from '@/lib/estateRoutes';

interface HeaderProps {
  theme: Theme;
  toggleTheme: () => void;
  onMenuToggle: () => void;
}

const Header = ({ onMenuToggle }: HeaderProps) => {
  const location = useLocation();
  const { estateCode = '' } = useParams();
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const getPageTitle = () => {
    const path = location.pathname.slice(estatePath(estateCode).length) || '/';
    if (path === '/' || path === '/dashboard') return 'Dashboard';
    if (path === '/members') return 'Members';
    if (path === '/maintainers') return 'Maintainers';
    if (path.startsWith('/management')) return 'Management';
    if (path.startsWith('/real-estate')) return 'Real Estate';
    if (path === '/maintenance') return 'Maintenance';
    if (path.startsWith('/finance')) return 'Finance';
    if (path === '/notice-board') return 'Notice Board';
    if (path === '/visitors') return 'Visitors';
    if (path === '/estate-rules') return 'Estate Rules';
    if (path === '/types') return 'Types';
    if (path === '/email-notification') return 'Email Notification';
    if (path === '/settings') return 'Settings';
    return 'Dashboard';
  };

  return (
    <header className="h-[82px] border-b border-border bg-card sticky top-0 z-20 flex items-center justify-between px-6">
      {/* Left side - Page title */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuToggle}
          className="md:hidden w-9 h-9 rounded-lg hover:bg-muted flex items-center justify-center"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-display font-semibold text-foreground" style={{ fontFamily: 'Poppins', fontWeight: 500 }}>
          {getPageTitle()}
        </h1>
      </div>

      {/* Right side - User profile */}
      <div className="flex items-center gap-3">
        {/* Settings icon */}
        <button className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground transition-colors">
          <Settings className="w-4 h-4" />
        </button>

        {/* User profile section */}
        {user && (
          <div className="flex items-center gap-3 relative">
            {/* Avatar */}
            <div className="w-9 h-9 rounded-full bg-brand-light flex items-center justify-center text-brand-text font-semibold">
              {user.name.charAt(0)}
            </div>

            {/* User info */}
            <div className="hidden sm:block">
              <div className="text-sm font-medium text-foreground" style={{ fontFamily: 'Poppins' }}>
                {user.name}
              </div>
              <div className="text-xs text-muted-foreground">
                {user.role}
              </div>
            </div>

            {/* Dropdown chevron */}
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-5 h-5 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronDown className="w-4 h-4" />
            </button>

            {/* Dropdown menu */}
            {showDropdown && (
              <div ref={dropdownRef} className="absolute right-0 top-12 bg-white border border-border rounded-lg shadow-lg py-2 min-w-[160px] z-50">
                <button
                  onClick={() => {
                    logout();
                    setShowDropdown(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-muted flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                  style={{ fontFamily: 'Poppins' }}
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
