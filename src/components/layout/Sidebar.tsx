import { NavLink, useLocation, useParams } from 'react-router-dom';
import { LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { navItems, userProfile } from '@/lib/navigation';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { estatePath } from '@/lib/estateRoutes';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onLogout: () => void;
}

const Sidebar = ({ isOpen, onToggle, onLogout }: SidebarProps) => {
  const location = useLocation();
  const { estateCode = '' } = useParams();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set(['management', 'real estate', 'finance']));

  const toggleExpanded = (label: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(label)) {
        next.delete(label);
      } else {
        next.add(label);
      }
      return next;
    });
  };

  const isItemActive = (item: any, currentPath: string): boolean => {
    if (estatePath(estateCode, item.to) === currentPath) return true;
    if (item.children) {
      return item.children.some((child: any) => estatePath(estateCode, child.to) === currentPath);
    }
    return false;
  };

  const renderNavItem = (item: any, depth = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.label.toLowerCase());
    const isActive = isItemActive(item, location.pathname);

    if (hasChildren) {
      return (
        <div key={item.to || item.label}>
          <button
            onClick={() => toggleExpanded(item.label.toLowerCase())}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-colors',
              isActive
                ? 'bg-brand-light text-brand-text font-semibold'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
            style={{ paddingLeft: depth === 0 ? '12px' : `${12 + depth * 16}px` }}
          >
            <item.icon className="w-4 h-4 flex-shrink-0" />
            <span className="flex-1 text-left">{item.label}</span>
            {isExpanded ? (
              <ChevronLeft className="w-4 h-4 flex-shrink-0" />
            ) : (
              <ChevronRight className="w-4 h-4 flex-shrink-0" />
            )}
          </button>
          {isExpanded && (
            <div className="space-y-1 mt-1">
              {item.children.map((child: any) => renderNavItem(child, depth + 1))}
            </div>
          )}
        </div>
      );
    }

    return (
      <NavLink
        key={item.to}
        to={estatePath(estateCode, item.to)}
        end={item.end}
        onClick={() => onToggle()}
        className={({ isActive: linkIsActive }) =>
          cn(
            'flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-colors',
            linkIsActive || isActive
              ? 'bg-brand-light text-brand-text font-semibold'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          )
        }
        style={{ paddingLeft: depth === 0 ? '12px' : `${12 + depth * 16}px` }}
      >
        <item.icon className="w-4 h-4 flex-shrink-0" />
        {item.label}
      </NavLink>
    );
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed md:static z-50 inset-y-0 left-0 h-screen shrink-0 w-[276px] md:w-[220px] lg:w-[276px] bg-card border-r border-border flex-col transition-transform duration-300',
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
          'flex'
        )}
      >
        {/* Logo */}
        <div className="px-5 py-5 flex items-center gap-2.5 border-b border-border">
          <div className="w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
            <span className="text-primary-foreground font-logo font-extrabold text-lg">
              R
            </span>
          </div>
          <div>
            <div className="font-logo font-extrabold leading-none text-brand-text">
              revocube
            </div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mt-1">
              spaces
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => renderNavItem(item))}
        </nav>

        {/* User Profile */}
        <div className="p-3 border-t border-border">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-muted">
            <div className="w-9 h-9 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-semibold">
              {userProfile.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold truncate">{userProfile.name}</div>
              <div className="text-[10px] text-muted-foreground truncate">
                {userProfile.email}
              </div>
            </div>
            <button
              onClick={onLogout}
              className="w-8 h-8 rounded-lg hover:bg-background flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
