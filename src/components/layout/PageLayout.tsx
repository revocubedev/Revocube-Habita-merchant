import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import type { Theme } from '@/types';

interface PageLayoutProps {
  theme: Theme;
  toggleTheme: () => void;
}

const PageLayout = ({ theme, toggleTheme }: PageLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    // TODO: Implement logout logic
    console.log('Logout clicked');
  };

  return (
    <div className="h-screen overflow-hidden flex bg-background text-foreground">
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        <Header
          theme={theme}
          toggleTheme={toggleTheme}
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        />

        <main className="flex-1 p-4 lg:p-8 overflow-x-hidden animate-slide-up">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default PageLayout;
